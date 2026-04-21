import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export type TreeType = 'oak' | 'pine' | 'willow' | 'bioluminescent';

interface Tree3DProps {
  position: [number, number, number];
  scale?: number;
  type?: TreeType;
  glowing?: boolean;
}

function OakTree({ scale = 1, glowing = false }: { scale?: number; glowing?: boolean }) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 2.4, 8]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.95} metalness={0} />
      </mesh>
      {/* Main canopy - 3 overlapping spheres */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <sphereGeometry args={[1.4, 12, 12]} />
        <meshStandardMaterial
          color={glowing ? '#00ff88' : '#1a6b2e'}
          roughness={0.9}
          emissive={glowing ? '#00aa44' : '#001a06'}
          emissiveIntensity={glowing ? 0.4 : 0.05}
        />
      </mesh>
      <mesh position={[0.7, 2.9, 0.3]} castShadow>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color={glowing ? '#00ff66' : '#228b35'} roughness={0.9} />
      </mesh>
      <mesh position={[-0.6, 2.8, -0.4]} castShadow>
        <sphereGeometry args={[0.85, 10, 10]} />
        <meshStandardMaterial color={glowing ? '#00cc55' : '#1d7a2a'} roughness={0.9} />
      </mesh>
      {glowing && <pointLight position={[0, 3, 0]} intensity={0.8} color="#00ff88" distance={6} />}
    </group>
  );
}

function PineTree({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 3, 6]} />
        <meshStandardMaterial color="#4a2a0e" roughness={0.95} />
      </mesh>
      {/* Three cone layers */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[0.8, 2, 8]} />
        <meshStandardMaterial color="#0d5c1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2.2, 8]} />
        <meshStandardMaterial color="#0f6b20" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1.6, 2.5, 8]} />
        <meshStandardMaterial color="#117a25" roughness={0.8} />
      </mesh>
    </group>
  );
}

function WillowTree({ scale = 1 }: { scale?: number }) {
  const branchRefs = useRef<THREE.Mesh[]>([]);

  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 4, 8]} />
        <meshStandardMaterial color="#6b4a1e" roughness={0.95} />
      </mesh>
      {/* Canopy top */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[1.6, 10, 10]} />
        <meshStandardMaterial color="#1d8a2a" roughness={0.9} />
      </mesh>
      {/* Drooping branches (ellipsoid shapes) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * 1.2, 3.0, Math.cos(rad) * 1.2]}
            scale={[0.25, 1.5, 0.25]}
            castShadow
          >
            <cylinderGeometry args={[1, 0.2, 1, 6]} />
            <meshStandardMaterial color="#15a030" roughness={0.9} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

function BioluminescentTree({ scale = 1 }: { scale?: number }) {
  const glowRef = useRef<THREE.PointLight>(null);
  const leafColor = '#00ffaa';

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.4;
    }
  });

  return (
    <group scale={scale}>
      {/* Crystal trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 3, 6]} />
        <meshStandardMaterial color="#0a2a1a" roughness={0.2} metalness={0.5} emissive="#003322" emissiveIntensity={0.3} />
      </mesh>
      {/* Glowing canopy */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshStandardMaterial
          color={leafColor}
          roughness={0.3}
          metalness={0.1}
          emissive="#00aa66"
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0.6, 3.2, 0.4]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#00ffbb" roughness={0.3} emissive="#00cc88" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 3.8, 0]} intensity={1.2} color="#00ffaa" distance={8} />
    </group>
  );
}

export function Tree3D({ position, scale = 1, type = 'oak', glowing = false }: Tree3DProps) {
  const TreeComponent = useMemo(() => {
    switch (type) {
      case 'pine': return <PineTree scale={scale} />;
      case 'willow': return <WillowTree scale={scale} />;
      case 'bioluminescent': return <BioluminescentTree scale={scale} />;
      default: return <OakTree scale={scale} glowing={glowing} />;
    }
  }, [type, scale, glowing]);

  return (
    <group position={position}>
      {TreeComponent}
    </group>
  );
}
