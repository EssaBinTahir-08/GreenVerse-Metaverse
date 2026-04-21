import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboard } from './useKeyboard';

const MOVE_SPEED = 10;
const SPRINT_MULTIPLIER = 1.8;
const CAMERA_DISTANCE = 14;  // Much further back so avatar is visible
const CAMERA_HEIGHT = 4;
const GRAVITY = -22;
const JUMP_FORCE = 12;
const GROUND_Y = 0.9;

// Share avatar position so other components (minimap, HUD) can read it
export const avatarPositionRef = { current: new THREE.Vector3(0, GROUND_Y, 0) };
export const avatarRotationRef = { current: 0 };

export function AvatarController() {
  const { camera, gl } = useThree();
  const keys = useKeyboard();

  const avatarRef = useRef<THREE.Group>(null);
  const velocityY = useRef(0);
  const isGrounded = useRef(true);

  // Camera orbit state
  const cameraYaw = useRef(Math.PI); // start looking from behind avatar
  const cameraPitch = useRef(0.35);
  const isDragging = useRef(false);
  const avatarTargetRotY = useRef(Math.PI);

  // Walking animation
  const walkCycle = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) isDragging.current = true;
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      cameraYaw.current += e.movementX * 0.004;
      cameraPitch.current = THREE.MathUtils.clamp(
        cameraPitch.current - e.movementY * 0.004,
        0.05,
        1.1
      );
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch support for mobile
    let lastTouchX = 0, lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        isDragging.current = true;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      cameraYaw.current += dx * 0.006;
      cameraPitch.current = THREE.MathUtils.clamp(cameraPitch.current - dy * 0.006, 0.05, 1.1);
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchEnd = () => { isDragging.current = false; };

    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (!avatarRef.current) return;
    const avatar = avatarRef.current;
    const dt = Math.min(delta, 0.05); // cap delta to avoid huge jumps

    // ── Movement input ──────────────────────────────────────
    const moveRight = (keys.current['KeyD'] || keys.current['ArrowRight'] ? 1 : 0) - (keys.current['KeyA'] || keys.current['ArrowLeft'] ? 1 : 0);
    const moveForward = (keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0) - (keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0);
    const isSprinting = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const speed = MOVE_SPEED * (isSprinting ? SPRINT_MULTIPLIER : 1);

    const isMoving = moveRight !== 0 || moveForward !== 0;
    if (isMoving) { walkCycle.current += dt * speed * 0.6; }

    if (isMoving) {
      // Directions relative to camera yaw
      const forward = new THREE.Vector3(-Math.sin(cameraYaw.current), 0, -Math.cos(cameraYaw.current));
      const right = new THREE.Vector3(Math.cos(cameraYaw.current), 0, -Math.sin(cameraYaw.current));

      const movement = new THREE.Vector3();
      movement.addScaledVector(forward, -moveForward);
      movement.addScaledVector(right, moveRight);
      movement.normalize().multiplyScalar(speed * dt);

      avatar.position.add(movement);

      // Face movement direction
      avatarTargetRotY.current = Math.atan2(movement.x, movement.z);
    }

    // ── Gravity & jumping ───────────────────────────────────
    if (isGrounded.current && (keys.current['Space'])) {
      velocityY.current = JUMP_FORCE;
      isGrounded.current = false;
    }
    velocityY.current += GRAVITY * dt;
    avatar.position.y += velocityY.current * dt;

    if (avatar.position.y <= GROUND_Y) {
      avatar.position.y = GROUND_Y;
      velocityY.current = 0;
      isGrounded.current = true;
    }

    // ── Smooth avatar rotation ──────────────────────────────
    avatar.rotation.y = THREE.MathUtils.lerp(avatar.rotation.y, avatarTargetRotY.current, 0.12);

    // ── Walking animation (leg swing) ──────────────────────
    const lLeg = avatar.getObjectByName('leg_l');
    const rLeg = avatar.getObjectByName('leg_r');
    const lArm = avatar.getObjectByName('arm_l');
    const rArm = avatar.getObjectByName('arm_r');
    const swing = isMoving ? Math.sin(walkCycle.current) * 0.5 : 0;
    if (lLeg) lLeg.rotation.x = swing;
    if (rLeg) rLeg.rotation.x = -swing;
    if (lArm) lArm.rotation.x = -swing * 0.7;
    if (rArm) rArm.rotation.x = swing * 0.7;

    // ── Sync shared refs (for HUD/minimap) ─────────────────
    avatarPositionRef.current.copy(avatar.position);
    avatarRotationRef.current = avatar.rotation.y;

    // ── Camera (orbit around avatar) ───────────────────────
    const lookTarget = new THREE.Vector3(avatar.position.x, avatar.position.y + 1.2, avatar.position.z);
    const cosP = Math.cos(cameraPitch.current);
    const sinP = Math.sin(cameraPitch.current);
    const camX = avatar.position.x + Math.sin(cameraYaw.current) * CAMERA_DISTANCE * cosP;
    const camY = avatar.position.y + sinP * CAMERA_DISTANCE + CAMERA_HEIGHT * 0.3;
    const camZ = avatar.position.z + Math.cos(cameraYaw.current) * CAMERA_DISTANCE * cosP;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
    camera.lookAt(lookTarget);
  });

  return (
    <group ref={avatarRef} position={[0, GROUND_Y, 0]} name="avatar">
      {/* Torso */}
      <mesh position={[0, 0.1, 0]} castShadow name="torso">
        <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
        <meshStandardMaterial color="#10b981" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.82, 0]} castShadow name="head">
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color="#fde68a" roughness={0.8} />
      </mesh>

      {/* Helmet visor */}
      <mesh position={[0, 0.84, 0.18]} castShadow>
        <sphereGeometry args={[0.16, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#00ccff" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.38, 0.12, 0]} castShadow name="arm_l">
        <capsuleGeometry args={[0.1, 0.5, 4, 6]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.38, 0.12, 0]} castShadow name="arm_r">
        <capsuleGeometry args={[0.1, 0.5, 4, 6]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.18, -0.55, 0]} castShadow name="leg_l">
        <capsuleGeometry args={[0.12, 0.55, 4, 6]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.18, -0.55, 0]} castShadow name="leg_r">
        <capsuleGeometry args={[0.12, 0.55, 4, 6]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>

      {/* Eco-backpack */}
      <mesh position={[0, 0.1, -0.32]} castShadow>
        <boxGeometry args={[0.38, 0.5, 0.22]} />
        <meshStandardMaterial color="#065f46" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Backpack leaf icon */}
      <mesh position={[0, 0.1, -0.44]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>

      {/* Eco-glow aura */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#00ff88" distance={4} />
    </group>
  );
}
