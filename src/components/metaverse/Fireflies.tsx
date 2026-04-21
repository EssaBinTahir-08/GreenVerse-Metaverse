import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FirefliesProps {
  count?: number;
  spread?: number;
}

export function Fireflies({ count = 60, spread = 60 }: FirefliesProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = 0.5 + Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.2;
    }

    return { positions, phases, speeds };
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const phase = phases[i];
      const speed = speeds[i];
      // Gentle drift
      posAttr.setX(i, positions[i * 3 + 0] + Math.sin(t * speed + phase) * 2);
      posAttr.setY(i, positions[i * 3 + 1] + Math.sin(t * speed * 0.7 + phase * 1.3) * 1.5);
      posAttr.setZ(i, positions[i * 3 + 2] + Math.cos(t * speed * 0.9 + phase * 0.8) * 2);
    }
    posAttr.needsUpdate = true;

    // Pulse opacity
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.4;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        color="#00ffaa"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
