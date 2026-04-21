import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface NFTParcelProps {
  id: number;
  position: [number, number, number];
  owner: string | null;
  treeType: string;
  onClick: () => void;
}

export function NFTParcel({ id, position, owner, treeType, onClick }: NFTParcelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Color based on ownership and rarity
  const rarityColors: Record<string, string> = {
    oak: '#4ade80',
    pine: '#60a5fa',
    willow: '#a78bfa',
    bioluminescent: '#fbbf24',
  };
  const parcelColor = owner ? (rarityColors[treeType] || '#4ade80') : '#334155';
  const emissiveColor = owner ? parcelColor : '#1e293b';

  useFrame((state) => {
    if (!glowRef.current || !ringRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.intensity = owner
      ? (hovered ? 2.0 : 0.8) + Math.sin(t * 2 + id) * 0.3
      : 0.1;
    ringRef.current.rotation.y = t * (hovered ? 1.5 : 0.6);
    ringRef.current.scale.setScalar(hovered ? 1.08 : 1.0 + Math.sin(t * 1.5 + id * 0.5) * 0.02);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Platform base */}
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 0.3, 6]} />
        <meshStandardMaterial
          color={parcelColor}
          roughness={0.3}
          metalness={0.6}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>

      {/* Ownership border ring */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.1, 0.12, 8, 32]} />
        <meshStandardMaterial
          color={parcelColor}
          emissive={parcelColor}
          emissiveIntensity={hovered ? 2.0 : 0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Interior grid pattern */}
      {[[-1.5, -1.5], [-1.5, 1.5], [1.5, -1.5], [1.5, 1.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]}>
          <boxGeometry args={[0.08, 0.08, owner ? 0.8 : 0.2]} />
          <meshStandardMaterial
            color={parcelColor}
            emissive={parcelColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 1, 0]}
        intensity={owner ? 0.8 : 0.1}
        color={parcelColor}
        distance={10}
      />

      {/* Floating label */}
      <Billboard position={[0, 3.5, 0]}>
        <Text
          fontSize={0.45}
          color={owner ? parcelColor : '#64748b'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {owner
            ? `#${id} · ${treeType.toUpperCase()}\n${owner.slice(0, 8)}…`
            : `Parcel #${id}\nAvailable`}
        </Text>
      </Billboard>

      {/* "For Sale" indicator */}
      {!owner && (
        <Billboard position={[0, 2.2, 0]}>
          <mesh>
            <planeGeometry args={[2.4, 0.7]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.8} />
          </mesh>
          <Text fontSize={0.32} color="#00ff88" anchorX="center" anchorY="middle" position={[0, 0, 0.01]}>
            🌱 MINT YOUR PLOT
          </Text>
        </Billboard>
      )}
    </group>
  );
}
