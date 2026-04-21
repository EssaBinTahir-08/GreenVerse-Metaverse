import { useEffect, useRef, useState, useCallback } from 'react';

// MQTT topics we subscribe to (configurable prefix)
export interface SensorData {
  temperature: number | null;   // °C
  humidity: number | null;      // %
  soilMoisture: number | null;  // %
  light: number | null;         // Lux
  co2: number | null;           // ppm
  ph: number | null;            // 0–14
  nitrogen: number | null;      // mg/kg
  phosphorus: number | null;    // mg/kg
}

export interface MQTTConfig {
  brokerUrl: string;      // e.g. wss://broker.hivemq.com:8884/mqtt
  deviceId: string;       // e.g. "plant-01"
  topicPrefix: string;    // e.g. "greenverse/sensors"
  username?: string;
  password?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const EMPTY_DATA: SensorData = {
  temperature: null, humidity: null, soilMoisture: null,
  light: null, co2: null, ph: null, nitrogen: null, phosphorus: null,
};

// Simulated fallback data generator (used until real hardware connects)
function generateSimulatedUpdate(prev: SensorData): SensorData {
  const jitter = (val: number, range: number) =>
    Math.round((val + (Math.random() - 0.5) * range) * 10) / 10;
  return {
    temperature: jitter(prev.temperature ?? 24, 1.5),
    humidity: Math.min(100, Math.max(20, jitter(prev.humidity ?? 65, 3))),
    soilMoisture: Math.min(100, Math.max(10, jitter(prev.soilMoisture ?? 55, 4))),
    light: Math.max(0, jitter(prev.light ?? 18000, 800)),
    co2: Math.max(350, jitter(prev.co2 ?? 420, 15)),
    ph: Math.min(9, Math.max(4, jitter(prev.ph ?? 6.5, 0.2))),
    nitrogen: Math.max(0, jitter(prev.nitrogen ?? 140, 10)),
    phosphorus: Math.max(0, jitter(prev.phosphorus ?? 80, 8)),
  };
}

// Compute overall plant health score 0–100
export function computeHealthScore(data: SensorData): number {
  const scores: number[] = [];

  const clamp = (v: number, lo: number, hi: number) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  const bell = (v: number, lo: number, opt: number, hi: number) => {
    if (v < lo || v > hi) return 0;
    if (v < opt) return (v - lo) / (opt - lo);
    return (hi - v) / (hi - opt);
  };

  if (data.temperature !== null)  scores.push(bell(data.temperature, 5, 22, 40) * 100);
  if (data.humidity !== null)      scores.push(bell(data.humidity, 30, 65, 95) * 100);
  if (data.soilMoisture !== null)  scores.push(bell(data.soilMoisture, 20, 60, 90) * 100);
  if (data.light !== null)         scores.push(Math.min(1, data.light / 25000) * 100);
  if (data.co2 !== null)           scores.push(bell(data.co2, 350, 450, 1200) * 100);
  if (data.ph !== null)            scores.push(bell(data.ph, 5, 6.5, 7.5) * 100);

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function useMQTT(initialConfig?: Partial<MQTTConfig>) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [data, setData] = useState<SensorData>(EMPTY_DATA);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [history, setHistory] = useState<Array<SensorData & { time: string }>>([]);
  const [config, setConfig] = useState<MQTTConfig>({
    brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
    deviceId: 'plant-01',
    topicPrefix: 'greenverse/sensors',
    ...initialConfig,
  });

  const clientRef = useRef<any>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSimulated = useRef(false);

  // Push to history (keep last 20 readings)
  const pushHistory = useCallback((d: SensorData) => {
    setHistory((prev) => [
      ...prev.slice(-19),
      { ...d, time: new Date().toLocaleTimeString() },
    ]);
  }, []);

  const startSimulation = useCallback(() => {
    isSimulated.current = true;
    simTimerRef.current = setInterval(() => {
      setData((prev) => {
        const next = generateSimulatedUpdate(prev);
        setHealthScore(computeHealthScore(next));
        pushHistory(next);
        return next;
      });
    }, 2500);
  }, [pushHistory]);

  const stopSimulation = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    isSimulated.current = false;
  }, []);

  const connect = useCallback(async (cfg?: MQTTConfig) => {
    const activeConfig = cfg || config;
    if (cfg) setConfig(cfg);

    try {
      // Dynamically import to avoid SSR issues
      const mqttModule = await import('mqtt');
      const mqtt = mqttModule.default ?? mqttModule;

      setStatus('connecting');
      const client = mqtt.connect(activeConfig.brokerUrl, {
        username: activeConfig.username,
        password: activeConfig.password,
        clientId: `greenverse-web-${Math.random().toString(36).slice(2, 9)}`,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
      });

      clientRef.current = client;

      client.on('connect', () => {
        setStatus('connected');
        stopSimulation(); // real data takes over

        const prefix = `${activeConfig.topicPrefix}/${activeConfig.deviceId}`;
        const metrics = ['temperature', 'humidity', 'soil_moisture', 'light', 'co2', 'ph', 'nitrogen', 'phosphorus'];
        metrics.forEach((m) => client.subscribe(`${prefix}/${m}`));
        // Also accept wildcard
        client.subscribe(`${prefix}/#`);
      });

      client.on('message', (topic: string, message: Buffer) => {
        try {
          const metric = topic.split('/').pop() || '';
          const payload = JSON.parse(message.toString());
          const value = typeof payload === 'number' ? payload : payload.value;

          setData((prev) => {
            const keyMap: Record<string, keyof SensorData> = {
              temperature: 'temperature', humidity: 'humidity',
              soil_moisture: 'soilMoisture', light: 'light',
              co2: 'co2', ph: 'ph', nitrogen: 'nitrogen', phosphorus: 'phosphorus',
            };
            const key = keyMap[metric];
            if (!key) return prev;
            const next = { ...prev, [key]: value };
            setHealthScore(computeHealthScore(next));
            pushHistory(next);
            return next;
          });
        } catch { /* ignore parse errors */ }
      });

      client.on('error', () => {
        setStatus('error');
        // Fall back to simulation if broker unreachable
        if (!isSimulated.current) startSimulation();
      });

      client.on('offline', () => setStatus('disconnected'));
    } catch (err) {
      setStatus('error');
      if (!isSimulated.current) startSimulation();
    }
  }, [config, startSimulation, stopSimulation, pushHistory]);

  const disconnect = useCallback(() => {
    clientRef.current?.end(true);
    clientRef.current = null;
    stopSimulation();
    setStatus('disconnected');
  }, [stopSimulation]);

  // Auto-start simulation so page always shows live-looking data
  useEffect(() => {
    startSimulation();
    return () => {
      stopSimulation();
      clientRef.current?.end(true);
    };
  }, []);

  return { status, data, healthScore, history, config, connect, disconnect, setConfig, isSimulated: isSimulated.current };
}
