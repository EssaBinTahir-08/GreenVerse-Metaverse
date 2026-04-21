import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Stars, Sky, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Tree3D, TreeType } from '../components/metaverse/Tree3D';
import { Fireflies } from '../components/metaverse/Fireflies';
import { useNavigate } from 'react-router-dom';

// ── Cinematic fly camera path ─────────────────────────────────
const PATH_POINTS = [
  new THREE.Vector3(-60, 8, 80),
  new THREE.Vector3(-20, 5, 50),
  new THREE.Vector3(5, 3, 20),
  new THREE.Vector3(20, 8, -10),
  new THREE.Vector3(0, 12, -40),
  new THREE.Vector3(-30, 6, -30),
  new THREE.Vector3(-50, 4, 10),
  new THREE.Vector3(-60, 8, 80),
];
const SPLINE = new THREE.CatmullRomCurve3(PATH_POINTS, true);

function CinemaCamera({ playing }: { playing: boolean }) {
  const tRef = useRef(0);
  useFrame((state, delta) => {
    if (!playing) return;
    tRef.current = (tRef.current + delta * 0.018) % 1;
    const t = tRef.current;
    const pos = SPLINE.getPoint(t);
    const ahead = SPLINE.getPoint((t + 0.02) % 1);
    state.camera.position.lerp(pos, 0.04);
    state.camera.lookAt(ahead);
  });
  return null;
}

function FloatingStat({ position, title, value, color }: { position: [number, number, number]; title: string; value: string; color: string }) {
  return (
    <Float position={position} speed={1.2} rotationIntensity={0.1} floatIntensity={0.8}>
      <group>
        <mesh><planeGeometry args={[5, 2.5]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.85} /></mesh>
        <Text position={[0, 0.5, 0.01]} fontSize={0.7} color={color} anchorX="center" anchorY="middle" fontWeight={700}>{value}</Text>
        <Text position={[0, -0.4, 0.01]} fontSize={0.4} color="#94a3b8" anchorX="center" anchorY="middle">{title}</Text>
        <mesh position={[0, 0, -0.01]}><planeGeometry args={[5.1, 2.6]} /><meshStandardMaterial color={color} transparent opacity={0.15} emissive={color} emissiveIntensity={0.5} /></mesh>
      </group>
    </Float>
  );
}

function VRScene({ playing }: { playing: boolean }) {
  const treePositions = React.useMemo(() => {
    const rng = (s: number) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
    const types: TreeType[] = ['oak', 'pine', 'willow', 'bioluminescent'];
    return Array.from({ length: 60 }, (_, i) => ({
      x: (rng(i * 2) - 0.5) * 150, z: (rng(i * 2 + 1) - 0.5) * 150,
      type: types[Math.floor(rng(i * 3) * 4)],
      scale: 0.8 + rng(i * 4) * 1.0,
    }));
  }, []);

  return (
    <>
      <CinemaCamera playing={playing} />
      <Sky sunPosition={[60, 10, 60]} turbidity={6} rayleigh={2.5} />
      <Stars radius={200} depth={60} count={5000} factor={5} fade />
      <fog attach="fog" args={['#060d1a', 50, 180]} />
      <ambientLight intensity={0.2} color="#1a3a2a" />
      <directionalLight position={[50, 80, 30]} intensity={2} color="#fffbe0" castShadow />
      <pointLight position={[0, 15, 0]} intensity={4} color="#00ff88" distance={40} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0d2815" roughness={0.95} />
      </mesh>
      {treePositions.map((t, i) => (
        <Tree3D key={i} position={[t.x, 0, t.z]} scale={t.scale} type={t.type} />
      ))}
      <FloatingStat position={[-20, 8, -30]} title="Trees Planted in GreenVerse" value="1,248 🌳" color="#00ff88" />
      <FloatingStat position={[20, 6, -20]} title="Eco-Actions Verified" value="892 ⚡" color="#a78bfa" />
      <FloatingStat position={[0, 10, -50]} title="Total ECO Tokens Issued" value="48,500 🪙" color="#fbbf24" />
      <FloatingStat position={[-35, 5, 10]} title="CO₂ Offset (tonnes)" value="2.4T 🌿" color="#4ade80" />
      <Float position={[0, 3, 0]} speed={0.5} floatIntensity={1}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 1.2, 6, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} emissive="#00ff88" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} roughness={0.1} />
        </mesh>
        <pointLight position={[0, 4, 0]} intensity={5} color="#00ff88" distance={50} />
      </Float>
      <Fireflies count={100} spread={120} />
      <Sparkles count={120} scale={120} size={2} speed={0.3} color="#00ff88" />
    </>
  );
}

// ── Beautiful VR Setup Guide Modal ───────────────────────────
function VRSetupModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'quest' | 'pcvr' | 'phone'>('quest');

  const tabs = [
    { id: 'quest' as const, label: 'Meta Quest', icon: '🥽' },
    { id: 'pcvr' as const, label: 'PC VR', icon: '💻' },
    { id: 'phone' as const, label: 'Phone VR', icon: '📱' },
  ];

  const content = {
    quest: {
      title: 'Meta Quest 2 / 3 / Pro',
      color: '#a78bfa',
      steps: [
        { icon: '1️⃣', title: 'Enable Developer Mode', desc: 'Open Meta app on your phone → Headset Settings → Developer Mode → toggle ON' },
        { icon: '2️⃣', title: 'Connect via Air Link', desc: 'In Quest: Settings → Experimental → Air Link → Enable → select your PC on same Wi-Fi' },
        { icon: '3️⃣', title: 'Open in Quest Browser', desc: 'Or directly open this URL in Quest Browser — it supports WebXR natively' },
        { icon: '4️⃣', title: 'Press Enter VR', desc: 'Come back here and press the 🥽 Enter VR button — it will launch immersive mode' },
      ],
      tip: '💡 Quest 3 with Wi-Fi 6 gives the best wireless experience at 90fps',
    },
    pcvr: {
      title: 'SteamVR / Valve Index / Vive',
      color: '#60a5fa',
      steps: [
        { icon: '1️⃣', title: 'Install SteamVR', desc: 'Download from steam.com/steamvr — launch it and make sure your headset is detected' },
        { icon: '2️⃣', title: 'Install Chrome/Edge', desc: 'Use Google Chrome or Microsoft Edge — both support WebXR for PC VR' },
        { icon: '3️⃣', title: 'Enable WebXR flag', desc: 'In Chrome: go to chrome://flags → search "webxr" → enable WebXR Device API → restart' },
        { icon: '4️⃣', title: 'Put on headset & click Enter VR', desc: 'With SteamVR running and headset on, click 🥽 Enter VR — the browser hands off to SteamVR' },
      ],
      tip: '💡 Valve Index at 120Hz refresh rate delivers the smoothest GreenVerse experience',
    },
    phone: {
      title: 'Google Cardboard / Phone VR',
      color: '#4ade80',
      steps: [
        { icon: '1️⃣', title: 'Get a VR headset for phone', desc: 'Any Google Cardboard-compatible case works — available for $10–30 online' },
        { icon: '2️⃣', title: 'Open in Chrome on Android', desc: 'iOS (Safari) does not support WebXR. Use Chrome on Android for phone VR' },
        { icon: '3️⃣', title: 'Tap Enter VR', desc: 'Chrome will activate split-screen stereoscopic view automatically for cardboard' },
        { icon: '4️⃣', title: 'Insert phone into headset', desc: 'Put your phone in the cardboard viewer and enjoy the cinematic forest tour in 3D' },
      ],
      tip: '💡 For best results use a phone with 90Hz display and OIS camera stabilization',
    },
  };

  const c = content[tab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #0c1a10 0%, #090d1a 100%)',
        border: `1px solid ${c.color}44`,
        borderRadius: 28, padding: 32, maxWidth: 560, width: '100%',
        boxShadow: `0 0 80px ${c.color}22, 0 24px 80px rgba(0,0,0,0.8)`,
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{
              display: 'inline-flex', gap: 6, alignItems: 'center',
              background: `${c.color}18`, border: `1px solid ${c.color}44`,
              borderRadius: 20, padding: '4px 12px', marginBottom: 8,
              color: c.color, fontSize: 11, fontWeight: 800, letterSpacing: 2,
            }}>🥽 VR SETUP GUIDE</div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 22, margin: 0 }}>
              Connect Your VR Headset
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
              No VR headset detected. Follow these steps to connect.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(30,41,59,0.8)', border: '1px solid #334155',
            borderRadius: 10, width: 34, height: 34, color: '#94a3b8',
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 6, background: 'rgba(15,23,42,0.8)',
          border: '1px solid #1e293b', borderRadius: 14, padding: 5, marginBottom: 22,
        }}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 800,
              border: `1px solid ${tab === id ? content[id].color + '66' : 'transparent'}`,
              background: tab === id ? `${content[id].color}18` : 'transparent',
              color: tab === id ? content[id].color : '#475569',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {c.steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(15,23,42,0.6)', border: `1px solid ${c.color}18`,
              borderRadius: 14, padding: '12px 14px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: 20, minWidth: 28, marginTop: 2 }}>{step.icon}</div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{step.title}</div>
                <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{
          background: `${c.color}0d`, border: `1px solid ${c.color}33`,
          borderRadius: 12, padding: '10px 14px', marginBottom: 20,
          color: c.color, fontSize: 12, fontWeight: 600, lineHeight: 1.5,
        }}>{c.tip}</div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '13px 0', borderRadius: 14,
            background: 'linear-gradient(135deg, #059669, #00ff88)',
            border: 'none', color: '#000', fontWeight: 900, fontSize: 14, cursor: 'pointer',
          }}>▶ Play Cinematic Preview</button>
          <button
            onClick={() => window.open('https://immersiveweb.dev/', '_blank')}
            style={{
              padding: '13px 16px', borderRadius: 14,
              background: 'transparent', border: `1px solid ${c.color}44`,
              color: c.color, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>📖 WebXR Docs</button>
        </div>
      </div>
    </div>
  );
}

// ── Main VR Experience Page ───────────────────────────────────
export default function VRExperience() {
  const [playing, setPlaying] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);
  const [showVRGuide, setShowVRGuide] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(setVrSupported);
    }
  }, []);

  const enterVR = async () => {
    if (!vrSupported) {
      setShowVRGuide(true); // Beautiful modal instead of alert()
      return;
    }
    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr');
      console.log('VR session started', session);
    } catch (err) {
      setShowVRGuide(true);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060d1a' }}>
      {/* 3D Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [-60, 8, 80], fov: 80 }} gl={{ antialias: true }} shadows style={{ background: '#060d1a' }}>
          <Suspense fallback={null}>
            <VRScene playing={playing} />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay UI */}
      {!playing && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(6,13,26,0.7)', backdropFilter: 'blur(6px)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 560, padding: '0 24px' }}>
            {/* VR status indicator */}
            <div style={{
              display: 'inline-flex', gap: 8, alignItems: 'center',
              background: vrSupported ? 'rgba(74,222,128,0.1)' : 'rgba(71,85,105,0.3)',
              border: `1px solid ${vrSupported ? '#4ade8066' : '#33415566'}`,
              borderRadius: 50, padding: '5px 14px', marginBottom: 20,
              color: vrSupported ? '#4ade80' : '#64748b',
              fontSize: 12, fontWeight: 700, letterSpacing: 1,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: vrSupported ? '#4ade80' : '#475569',
                boxShadow: vrSupported ? '0 0 8px #4ade80' : 'none',
              }} />
              {vrSupported ? '● VR Headset Detected' : '○ No VR Headset — Preview Mode Available'}
            </div>

            <div style={{ fontSize: 56, marginBottom: 12 }}>🌍</div>
            <h1 style={{
              fontSize: 42, fontWeight: 900, margin: '0 0 12px',
              background: 'linear-gradient(135deg, #00ff88, #4ade80, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>GreenVerse VR</h1>
            <p style={{ color: '#94a3b8', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
              Fly through a living, bioluminescent 3D forest. Experience your environmental impact brought to life in an immersive virtual world.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPlaying(true)} style={{
                padding: '15px 34px', borderRadius: 14,
                background: 'linear-gradient(135deg, #059669, #00ff88)',
                border: 'none', color: '#000', fontWeight: 800, fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0,255,136,0.3)',
              }}>▶ Cinematic Tour</button>

              <button onClick={enterVR} style={{
                padding: '15px 34px', borderRadius: 14,
                background: vrSupported
                  ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                  : 'rgba(30,41,59,0.9)',
                border: `1px solid ${vrSupported ? '#7c3aed' : '#334155'}`,
                color: vrSupported ? 'white' : '#94a3b8',
                fontWeight: 800, fontSize: 16, cursor: 'pointer',
                position: 'relative',
              }}>
                🥽 {vrSupported ? 'Enter VR' : 'Connect VR Headset'}
                {!vrSupported && (
                  <span style={{
                    position: 'absolute', top: -8, right: -8,
                    background: '#f97316', borderRadius: 50,
                    width: 18, height: 18, fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'white',
                  }}>?</span>
                )}
              </button>

              <button onClick={() => navigate('/metaverse')} style={{
                padding: '15px 34px', borderRadius: 14,
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid #00ff8844',
                color: '#00ff88', fontWeight: 800, fontSize: 16, cursor: 'pointer',
              }}>🌿 Explore World</button>
            </div>

            {/* Quick hint below buttons */}
            {!vrSupported && (
              <div style={{ marginTop: 20, color: '#334155', fontSize: 12 }}>
                No headset? Click <span style={{ color: '#60a5fa' }}>Connect VR Headset</span> to see setup guide
              </div>
            )}
          </div>
        </div>
      )}

      {/* Playing controls */}
      {playing && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 10, background: 'rgba(6,13,26,0.8)', borderRadius: 14, padding: '8px 10px', backdropFilter: 'blur(12px)', border: '1px solid #1e293b' }}>
            <button onClick={() => setPlaying(false)} style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(15,23,42,0.9)', border: '1px solid #334155',
              color: '#e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>⏹ Stop</button>
            <button onClick={enterVR} style={{
              padding: '10px 20px', borderRadius: 10,
              background: vrSupported ? 'rgba(124,58,237,0.3)' : 'rgba(30,41,59,0.6)',
              border: `1px solid ${vrSupported ? '#7c3aed' : '#334155'}`,
              color: vrSupported ? '#a78bfa' : '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>🥽 {vrSupported ? 'Enter VR' : 'Connect VR'}</button>
            <button onClick={() => navigate('/metaverse')} style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #059669, #00ff88)',
              border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>🌿 Enter World</button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button onClick={() => navigate(-1 as any)} style={{
        position: 'absolute', top: 20, left: 20, zIndex: 20,
        padding: '8px 16px', borderRadius: 10,
        background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b',
        color: '#94a3b8', cursor: 'pointer', fontSize: 13,
      }}>← Back</button>

      {/* VR Setup Guide Modal */}
      {showVRGuide && (
        <VRSetupModal onClose={() => setShowVRGuide(false)} />
      )}
    </div>
  );
}
