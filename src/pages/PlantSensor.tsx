import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMQTT, computeHealthScore, MQTTConfig } from '../components/metaverse/useMQTT';
import { SensorGauge } from '../components/metaverse/SensorGauge';
import { Tree3D } from '../components/metaverse/Tree3D';

// ── 3D plant health visualization ─────────────────────────────
function HealthPlant({ score }: { score: number }) {
  const wilted = score < 40;
  const stressed = score < 70;
  const scale = 0.6 + (score / 100) * 0.6;

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 55 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.4} color="#1a3a2a" />
      <directionalLight position={[5, 8, 3]} intensity={2} />
      <pointLight position={[0, 3, 0]} intensity={score / 40} color={score > 70 ? '#00ff88' : score > 40 ? '#facc15' : '#ef4444'} />
      <Suspense fallback={null}>
        <Float speed={1} floatIntensity={0.3}>
          <group rotation={[wilted ? 0.3 : 0, 0, wilted ? 0.15 : 0]}>
            <Tree3D
              position={[0, -1.5, 0]}
              scale={scale}
              type={stressed ? 'oak' : 'bioluminescent'}
              glowing={score > 80}
            />
          </group>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
      </Suspense>
    </Canvas>
  );
}

// ── Health score ring ─────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
  const color = score > 70 ? '#22c55e' : score > 40 ? '#facc15' : '#ef4444';
  const label = score > 70 ? 'THRIVING' : score > 40 ? 'STRESSED' : 'CRITICAL';
  const R = 56, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={10} />
        <circle
          cx={cx} cy={cy} r={R} fill="none"
          stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={24} fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="sans-serif">/ 100</text>
      </svg>
      <div style={{
        color, fontWeight: 800, fontSize: 13, letterSpacing: 2,
        textShadow: `0 0 10px ${color}`,
      }}>{label}</div>
    </div>
  );
}

// ── MQTT Config Panel ─────────────────────────────────────────
function MQTTConfigPanel({ config, onConnect, status }: {
  config: MQTTConfig;
  onConnect: (cfg: MQTTConfig) => void;
  status: string;
}) {
  const [brokerUrl, setBrokerUrl] = useState(config.brokerUrl);
  const [deviceId, setDeviceId] = useState(config.deviceId);
  const [topicPrefix, setTopicPrefix] = useState(config.topicPrefix);
  const [username, setUsername] = useState(config.username || '');
  const [password, setPassword] = useState(config.password || '');
  const [open, setOpen] = useState(false);

  const inputStyle = {
    background: 'rgba(15,23,42,0.9)', border: '1px solid #334155',
    borderRadius: 10, padding: '8px 12px', color: '#e2e8f0', fontSize: 13,
    width: '100%', boxSizing: 'border-box' as const, outline: 'none',
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: status === 'connected' ? '#22c55e' : status === 'connecting' ? '#facc15' : status === 'error' ? '#ef4444' : '#475569',
            boxShadow: status === 'connected' ? '0 0 8px #22c55e' : 'none',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
            MQTT {status === 'connected' ? '● Connected' : status === 'connecting' ? '◌ Connecting…' : status === 'error' ? '✗ Error (using simulation)' : '○ Disconnected (simulation mode)'}
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid #334155',
            borderRadius: 10, padding: '6px 14px', color: '#60a5fa',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >⚙️ Configure Hardware</button>
      </div>

      {open && (
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid #1e4a6e',
          borderRadius: 16, padding: 20, marginBottom: 16,
        }}>
          <h4 style={{ color: '#60a5fa', margin: '0 0 16px', fontSize: 14 }}>🔌 MQTT Broker Configuration</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>BROKER URL (WebSocket)</label>
              <input style={inputStyle} value={brokerUrl} onChange={(e) => setBrokerUrl(e.target.value)}
                placeholder="wss://broker.hivemq.com:8884/mqtt" />
              <div style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>HiveMQ / Mosquitto / AWS IoT</div>
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>DEVICE ID</label>
              <input style={inputStyle} value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="plant-01" />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>TOPIC PREFIX</label>
              <input style={inputStyle} value={topicPrefix} onChange={(e) => setTopicPrefix(e.target.value)} placeholder="greenverse/sensors" />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>USERNAME (optional)</label>
              <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your-mqtt-username" />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>PASSWORD (optional)</label>
              <input style={{ ...inputStyle }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {/* Arduino setup code */}
          <details style={{ marginTop: 16 }}>
            <summary style={{ color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
              📟 Arduino / RPi Setup Code
            </summary>
            <pre style={{
              background: '#020817', border: '1px solid #1e293b', borderRadius: 10,
              padding: 14, color: '#94a3b8', fontSize: 11, overflowX: 'auto', whiteSpace: 'pre',
            }}>{`// Arduino + ESP32 + DHT22 + Capacitive Soil Sensor
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YourWiFi";
const char* WIFI_PASS = "YourPass";
const char* MQTT_HOST = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* DEVICE_ID = "${deviceId}";
const char* TOPIC_PREFIX = "${topicPrefix}";

DHT dht(4, DHT22); // GPIO 4
const int SOIL_PIN = 34;
const int LIGHT_PIN = 35;

WiFiClient wifi;
PubSubClient mqtt(wifi);

void publishSensor(const char* metric, float value) {
  char topic[80], payload[40];
  snprintf(topic, 80, "%s/%s/%s", TOPIC_PREFIX, DEVICE_ID, metric);
  snprintf(payload, 40, "%.2f", value);
  mqtt.publish(topic, payload);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float soil = map(analogRead(SOIL_PIN), 0, 4095, 100, 0);
  float light = analogRead(LIGHT_PIN) * 10.0;

  publishSensor("temperature", temp);
  publishSensor("humidity", hum);
  publishSensor("soil_moisture", soil);
  publishSensor("light", light);
  publishSensor("co2", 420.0); // Add MH-Z19 for real CO₂
  delay(2500);
}`}</pre>
          </details>

          <button
            onClick={() => onConnect({ brokerUrl, deviceId, topicPrefix, username: username || undefined, password: password || undefined })}
            style={{
              marginTop: 14, padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #059669, #00ff88)',
              border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >🔌 Connect Hardware</button>
        </div>
      )}
    </div>
  );
}

// ── Alert banner ──────────────────────────────────────────────
function AlertBanner({ data }: { data: any }) {
  const alerts: string[] = [];
  if (data.soilMoisture !== null && data.soilMoisture < 25) alerts.push('🚨 Soil moisture critically low — water your plant!');
  if (data.temperature !== null && (data.temperature > 38 || data.temperature < 8)) alerts.push('🌡️ Temperature out of safe range!');
  if (data.co2 !== null && data.co2 > 900) alerts.push('💨 CO₂ levels elevated — increase ventilation');
  if (data.ph !== null && (data.ph < 5.2 || data.ph > 7.8)) alerts.push('⚗️ pH imbalance detected — check soil nutrients');

  if (alerts.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid #ef444444',
          borderRadius: 12, padding: '10px 16px', marginBottom: 8,
          color: '#fca5a5', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span> {a}
        </div>
      ))}
    </div>
  );
}

// ── Main Plant Sensor Page ─────────────────────────────────────
export default function PlantSensor() {
  const { status, data, healthScore, history, config, connect } = useMQTT();
  const [activeChart, setActiveChart] = useState<string>('temperature');

  const chartData = history.map((h) => ({
    time: h.time,
    temperature: h.temperature,
    humidity: h.humidity,
    soilMoisture: h.soilMoisture,
    co2: h.co2,
    light: h.light,
  }));

  const SENSORS = [
    { key: 'temperature', label: 'Temperature', unit: '°C', min: -10, max: 50, optimal: [18, 28] as [number, number], icon: '🌡️', color: '#f97316' },
    { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, optimal: [50, 80] as [number, number], icon: '💧', color: '#38bdf8' },
    { key: 'soilMoisture', label: 'Soil Moisture', unit: '%', min: 0, max: 100, optimal: [40, 80] as [number, number], icon: '🌱', color: '#4ade80' },
    { key: 'light', label: 'Light', unit: 'Lux', min: 0, max: 50000, optimal: [10000, 30000] as [number, number], icon: '☀️', color: '#fbbf24' },
    { key: 'co2', label: 'CO₂', unit: 'ppm', min: 300, max: 2000, optimal: [380, 600] as [number, number], icon: '💨', color: '#a78bfa' },
    { key: 'ph', label: 'pH Level', unit: 'pH', min: 3, max: 10, optimal: [5.5, 7.0] as [number, number], icon: '⚗️', color: '#fb7185' },
    { key: 'nitrogen', label: 'Nitrogen', unit: 'mg/kg', min: 0, max: 500, optimal: [100, 200] as [number, number], icon: '🔬', color: '#34d399' },
    { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/kg', min: 0, max: 300, optimal: [50, 120] as [number, number], icon: '🧪', color: '#60a5fa' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060d1a 0%, #0a1f11 100%)', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 900, margin: '0 0 8px',
            background: 'linear-gradient(135deg, #4ade80, #00ff88)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>📡 Plant Health Sensor Hub</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Real-time IoT data from your GreenVerse sensor nodes. Connect Arduino/Raspberry Pi via MQTT.
          </p>
        </div>

        {/* MQTT Config */}
        <MQTTConfigPanel config={config} onConnect={connect} status={status} />

        {/* Alerts */}
        <AlertBanner data={data} />

        {/* Main layout: plant viz + health score + gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 28 }}>
          {/* Left: Plant 3D + Health */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(15,23,42,0.85)', border: '1px solid #0f3320',
              borderRadius: 20, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>PLANT HEALTH</div>
              <HealthRing score={healthScore} />
            </div>
            <div style={{
              background: 'rgba(15,23,42,0.85)', border: '1px solid #0f3320',
              borderRadius: 20, height: 220, overflow: 'hidden',
            }}>
              <HealthPlant score={healthScore} />
            </div>
            <div style={{
              background: 'rgba(15,23,42,0.85)', border: '1px solid #0f3320',
              borderRadius: 20, padding: 16,
            }}>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>RECOMMENDATIONS</div>
              {healthScore > 80 && <div style={{ color: '#4ade80', fontSize: 12, lineHeight: 1.7 }}>✅ Plant is thriving! Maintain current conditions.</div>}
              {healthScore <= 80 && healthScore > 50 && <div style={{ color: '#fbbf24', fontSize: 12, lineHeight: 1.7 }}>⚠️ Monitor soil moisture and temperature closely.</div>}
              {healthScore <= 50 && <div style={{ color: '#f87171', fontSize: 12, lineHeight: 1.7 }}>🚨 Immediate attention needed! Check water and nutrients.</div>}
            </div>
          </div>

          {/* Right: Sensor gauges */}
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>SENSOR READINGS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {SENSORS.map((s) => (
                <div key={s.key} onClick={() => setActiveChart(s.key)} style={{ cursor: 'pointer' }}>
                  <SensorGauge
                    label={s.label}
                    value={(data as any)[s.key]}
                    unit={s.unit}
                    min={s.min}
                    max={s.max}
                    optimal={s.optimal}
                    icon={s.icon}
                    color={s.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historical chart */}
        <div style={{
          background: 'rgba(15,23,42,0.85)', border: '1px solid #1e293b',
          borderRadius: 20, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16 }}>📈 Historical Trend</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {SENSORS.slice(0, 5).map((s) => (
                <button key={s.key}
                  onClick={() => setActiveChart(s.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11,
                    border: `1px solid ${activeChart === s.key ? s.color : '#334155'}`,
                    background: activeChart === s.key ? `${s.color}22` : 'transparent',
                    color: activeChart === s.key ? s.color : '#64748b',
                    cursor: 'pointer', fontWeight: 700,
                  }}
                >{s.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: SENSORS.find((s) => s.key === activeChart)?.color || '#00ff88' }}
              />
              <Line
                type="monotone"
                dataKey={activeChart}
                stroke={SENSORS.find((s) => s.key === activeChart)?.color || '#00ff88'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
            Showing last {chartData.length} readings · Updates every 2.5 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
