import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Sparkles, Environment, Fog } from '@react-three/drei';
import * as THREE from 'three';
import { Tree3D, TreeType } from './Tree3D';
import { NFTParcel } from './NFTParcel';
import { AvatarController } from './AvatarController';
import { Fireflies } from './Fireflies';

// ── Terrain ──────────────────────────────────────────────────
function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 80, 80);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      // Keep center flat, raise edges with rolling hills
      if (dist > 35) {
        const h =
          Math.sin(x * 0.025) * Math.cos(z * 0.033) * 7 +
          Math.sin(x * 0.06 + 1.2) * Math.sin(z * 0.05 + 0.8) * 4 +
          Math.max(0, (dist - 70) * 0.04);
        pos.setY(i, h);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#1a4a2e" roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ── Water ─────────────────────────────────────────────────────
function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[300, 300, 1, 1]} />
      <meshStandardMaterial
        color="#0a3d5c"
        transparent
        opacity={0.65}
        roughness={0.05}
        metalness={0.4}
      />
    </mesh>
  );
}

// ── Floating island platform ──────────────────────────────────
function IslandCenter() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[32, 28, 3, 24]} />
        <meshStandardMaterial color="#0f3320" roughness={0.9} />
      </mesh>
      {/* Center stone monument */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[1, 1.4, 4, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} emissive="#00ff88" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color="#00ff88" roughness={0.2} metalness={0.3} emissive="#00ff88" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 5.5, 0]} intensity={3} color="#00ff88" distance={30} />
    </group>
  );
}

// ── Grass patches ─────────────────────────────────────────────
function GrassPatches() {
  const patches = useMemo(() => {
    const p = [];
    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * Math.PI * 2 + Math.sin(i * 73) * 0.5;
      const r = 3 + Math.sin(i * 37) * 25 + Math.abs(Math.cos(i * 17)) * 10;
      p.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, rot: Math.random() * Math.PI });
    }
    return p;
  }, []);

  return (
    <>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.x, 0.2, p.z]} rotation={[0, p.rot, 0]}>
          <planeGeometry args={[0.4, 0.8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.9} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ── Ambient floating eco-stats ─────────────────────────────────
function EcoOrbs() {
  const orbs = [
    { pos: [-8, 3, -8], label: '🌱 1,248 Trees' },
    { pos: [10, 4, -6], label: '⚡ 892 Actions' },
    { pos: [-6, 3.5, 10], label: '🪙 4,580 ECO' },
  ];

  return (
    <>
      {orbs.map(({ pos }, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1} transparent opacity={0.7} />
          </mesh>
          <pointLight intensity={0.6} color="#a78bfa" distance={5} />
        </group>
      ))}
    </>
  );
}

// ── Main WorldCanvas export ───────────────────────────────────
interface WorldCanvasProps {
  onParcelClick: (id: number) => void;
}

export function WorldCanvas({ onParcelClick }: WorldCanvasProps) {
  // Seeded-random tree layout (deterministic per session)
  const treePositions = useMemo(() => {
    const rng = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
    const types: TreeType[] = ['oak', 'pine', 'willow', 'bioluminescent'];
    return Array.from({ length: 90 }, (_, i) => {
      const angle = rng(i * 2) * Math.PI * 2;
      const r = 22 + rng(i * 2 + 1) * 75;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        type: types[Math.floor(rng(i * 3) * 4)],
        scale: 0.7 + rng(i * 4) * 0.9,
      };
    });
  }, []);

  // 25 NFT parcels in a 5x5 grid centred on the world
  const parcelData = useMemo(() => {
    const owned = [0, 3, 5, 8, 11, 14, 19];
    const types: TreeType[] = ['oak', 'pine', 'willow', 'bioluminescent'];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: (i % 5 - 2) * 11,
      z: Math.floor(i / 5) * 11 - 22,
      owner: owned.includes(i) ? `0x${i.toString(16).padStart(4, '0')}…` : null,
      treeType: types[i % 4],
    }));
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 14], fov: 72 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ background: '#060d1a' }}
    >
      <Suspense fallback={null}>
        {/* Sky & stars */}
        <Sky sunPosition={[80, 15, 80]} turbidity={10} rayleigh={3} mieCoefficient={0.005} />
        <Stars radius={180} depth={70} count={4000} factor={4} fade speed={0.5} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#060d1a', 60, 220]} />

        {/* Lighting */}
        <ambientLight intensity={0.25} color="#1a3a2a" />
        <directionalLight
          position={[60, 90, 40]}
          intensity={2}
          color="#fffbe0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
        />
        <directionalLight position={[-40, 30, -60]} intensity={0.4} color="#4a7c9e" />

        {/* World geometry */}
        <Terrain />
        <Water />
        <IslandCenter />
        <GrassPatches />

        {/* Trees */}
        {treePositions.map((t, i) => (
          <Tree3D
            key={i}
            position={[t.x, 0, t.z]}
            scale={t.scale}
            type={t.type}
          />
        ))}

        {/* NFT Parcels */}
        {parcelData.map((p) => (
          <NFTParcel
            key={p.id}
            id={p.id}
            position={[p.x, 0.15, p.z]}
            owner={p.owner}
            treeType={p.treeType}
            onClick={() => onParcelClick(p.id)}
          />
        ))}

        {/* Ambient FX */}
        <Fireflies count={70} spread={80} />
        <EcoOrbs />
        <Sparkles count={80} scale={100} size={1.5} speed={0.2} color="#00ff88" />

        {/* Avatar (player) */}
        <AvatarController />
      </Suspense>
    </Canvas>
  );
}
