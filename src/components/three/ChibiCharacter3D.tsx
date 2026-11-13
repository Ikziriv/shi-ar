import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CharacterId, CharacterPose } from '../../data/shiarContent';

interface ChibiCharacter3DProps {
  characterId: CharacterId;
  pose: CharacterPose;
  onClick?: () => void;
}

const OUTLINE_COLOR = '#2d221c';

function createToonGradient(): THREE.DataTexture {
  const colors = new Uint8Array([
    145, 145, 145, 255,
    215, 215, 215, 255,
    255, 255, 255, 255,
  ]);
  const tex = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function ToonMesh({
  geometry,
  color,
  outlineScale = 1.035,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  gradientMap,
  noOutline = false,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  outlineScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  gradientMap: THREE.DataTexture;
  noOutline?: boolean;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
      {!noOutline && (
        <mesh geometry={geometry} scale={outlineScale}>
          <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

export function ChibiCharacter3D({ characterId, pose, onClick }: ChibiCharacter3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const envelopesRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);

  const gradientMap = useMemo(() => createToonGradient(), []);

  // Shared reusable geometries
  const geos = useMemo(() => {
    return {
      head: new THREE.SphereGeometry(0.56, 32, 32),
      hijabCap: new THREE.SphereGeometry(0.59, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62),
      hijabOuter: new THREE.SphereGeometry(0.635, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.72),
      hijabNeck: new THREE.TorusGeometry(0.42, 0.16, 16, 32),
      hijabTail: new THREE.ConeGeometry(0.2, 0.75, 16),
      agalRing: new THREE.TorusGeometry(0.52, 0.055, 14, 36),
      bodyDress: new THREE.CylinderGeometry(0.28, 0.5, 0.92, 28),
      bodyThobe: new THREE.CylinderGeometry(0.3, 0.44, 0.96, 28),
      arm: new THREE.CapsuleGeometry(0.1, 0.34, 8, 16),
      hand: new THREE.SphereGeometry(0.11, 16, 16),
      shoe: new THREE.SphereGeometry(0.12, 16, 16),
      eyeBall: new THREE.SphereGeometry(0.11, 20, 20),
      eyeIris: new THREE.SphereGeometry(0.085, 20, 20),
      eyeHighlight: new THREE.SphereGeometry(0.03, 12, 12),
      cheek: new THREE.SphereGeometry(0.075, 14, 14),
      brow: new THREE.BoxGeometry(0.17, 0.038, 0.04),
      mouth: new THREE.TorusGeometry(0.065, 0.022, 10, 20, Math.PI),
      beard: new THREE.TorusGeometry(0.45, 0.095, 14, 28, Math.PI),
      crescent: new THREE.TorusGeometry(0.075, 0.02, 10, 20, Math.PI * 1.35),
      envelope: new THREE.BoxGeometry(0.2, 0.14, 0.03),
      goldTrim: new THREE.BoxGeometry(0.06, 0.88, 0.06),
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!rootRef.current || !headRef.current) return;

    // Gentle floating & breathing
    const floatY = Math.sin(t * 2.1) * 0.06;
    rootRef.current.position.y = -0.32 + floatY;

    // Pose-driven body & head motion
    if (pose === 'salam') {
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, 0.14, delta * 5);
    } else {
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, 0, delta * 5);
    }

    // Cursor look-at tracking for the head
    const targetRotY = state.pointer.x * 0.35;
    const targetRotX = -state.pointer.y * 0.18 + (pose === 'salam' ? 0.1 : 0);
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, delta * 4);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, delta * 4);

    // Blinking every ~3.5 seconds
    const blinkCycle = t % 3.6;
    const isBlinking = blinkCycle > 3.45;
    const eyeScaleY = isBlinking ? 0.12 : 1;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, delta * 24);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, delta * 24);
    }

    // Arms animation based on pose
    if (leftArmRef.current && rightArmRef.current) {
      if (pose === 'wave') {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          2.2 + Math.sin(t * 8) * 0.35,
          delta * 8
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.45, delta * 6);
      } else if (pose === 'salam') {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.9, delta * 6);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.7, delta * 6);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.9, delta * 6);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.7, delta * 6);
      } else {
        const defaultR = characterId === 'aisyah' ? 1.85 : 0.65;
        const defaultL = characterId === 'aisyah' ? -0.85 : -0.65;
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          defaultR + Math.sin(t * 2) * 0.08,
          delta * 5
        );
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          characterId === 'ahmad' ? -0.55 : 0,
          delta * 5
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          defaultL - Math.sin(t * 2) * 0.08,
          delta * 5
        );
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          characterId === 'ahmad' ? -0.55 : 0,
          delta * 5
        );
      }
    }

    // Floating envelopes for Aisyah
    if (envelopesRef.current) {
      envelopesRef.current.position.y = Math.sin(t * 2.6) * 0.06;
      envelopesRef.current.rotation.z = Math.sin(t * 1.5) * 0.08;
    }
  });

  const isAisyah = characterId === 'aisyah';

  return (
    <group ref={rootRef} position={[0, -0.32, 0]} onClick={onClick}>
      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 0.65, 0]}>
        {/* Face Base */}
        <ToonMesh geometry={geos.head} color="#f8caa8" scale={[1.05, 0.96, 0.98]} gradientMap={gradientMap} />

        {/* Eyes */}
        <group ref={leftEyeRef} position={[-0.2, 0.02, 0.49]} scale={[1, 1, 0.65]}>
          <mesh geometry={geos.eyeBall}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh geometry={geos.eyeIris} position={[0.01, -0.01, 0.05]}>
            <meshBasicMaterial color={isAisyah ? '#1e4235' : '#4a2f1d'} />
          </mesh>
          <mesh geometry={geos.eyeHighlight} position={[-0.03, 0.03, 0.1]}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        <group ref={rightEyeRef} position={[0.2, 0.02, 0.49]} scale={[1, 1, 0.65]}>
          <mesh geometry={geos.eyeBall}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh geometry={geos.eyeIris} position={[-0.01, -0.01, 0.05]}>
            <meshBasicMaterial color={isAisyah ? '#1e4235' : '#4a2f1d'} />
          </mesh>
          <mesh geometry={geos.eyeHighlight} position={[-0.03, 0.03, 0.1]}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh geometry={geos.brow} position={[-0.2, 0.18, 0.51]} rotation={[0, 0, 0.12]}>
          <meshBasicMaterial color="#3b2618" />
        </mesh>
        <mesh geometry={geos.brow} position={[0.2, 0.18, 0.51]} rotation={[0, 0, -0.12]}>
          <meshBasicMaterial color="#3b2618" />
        </mesh>

        {/* Rosy Cheeks */}
        <mesh geometry={geos.cheek} position={[-0.31, -0.09, 0.45]} scale={[1.2, 0.7, 0.4]}>
          <meshBasicMaterial color="#f28f8f" />
        </mesh>
        <mesh geometry={geos.cheek} position={[0.31, -0.09, 0.45]} scale={[1.2, 0.7, 0.4]}>
          <meshBasicMaterial color="#f28f8f" />
        </mesh>

        {/* Smile Mouth */}
        <mesh geometry={geos.mouth} position={[0, -0.15, 0.51]} rotation={[0, 0, Math.PI]}>
          <meshBasicMaterial color="#9e3b3b" />
        </mesh>

        {/* AISYAH HIJAB vs AHMAD GHUTRA & BEARD */}
        {isAisyah ? (
          <group>
            {/* Teal inner cap */}
            <ToonMesh
              geometry={geos.hijabCap}
              color="#47959e"
              position={[0, 0.05, -0.02]}
              rotation={[-0.2, 0, 0]}
              gradientMap={gradientMap}
            />
            {/* Lilac outer hijab */}
            <ToonMesh
              geometry={geos.hijabOuter}
              color="#cbbdf2"
              position={[0, 0.06, -0.08]}
              rotation={[-0.35, 0, 0]}
              scale={[1.08, 1.05, 1.05]}
              gradientMap={gradientMap}
            />
            {/* Hijab neck wrap */}
            <ToonMesh
              geometry={geos.hijabNeck}
              color="#cbbdf2"
              position={[0, -0.44, 0.05]}
              rotation={[Math.PI / 2.2, 0, 0]}
              gradientMap={gradientMap}
            />
            {/* Flowing Hijab Tails */}
            <ToonMesh
              geometry={geos.hijabTail}
              color="#cbbdf2"
              position={[-0.55, -0.58, -0.1]}
              rotation={[0, 0, -0.55]}
              gradientMap={gradientMap}
            />
            <ToonMesh
              geometry={geos.hijabTail}
              color="#66b3bd"
              position={[0.56, -0.62, -0.12]}
              rotation={[0, 0, 0.6]}
              gradientMap={gradientMap}
            />
            {/* Golden Crescent Emblem */}
            <mesh geometry={geos.crescent} position={[0, 0.45, 0.52]} rotation={[0, 0, 0.6]}>
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          </group>
        ) : (
          <group>
            {/* Neat Beard */}
            <ToonMesh
              geometry={geos.beard}
              color="#4a3123"
              position={[0, -0.1, 0.14]}
              rotation={[0.25, 0, Math.PI]}
              scale={[1.05, 1.15, 0.9]}
              gradientMap={gradientMap}
              noOutline
            />
            {/* Cream/Gold Ghutra */}
            <ToonMesh
              geometry={geos.hijabOuter}
              color="#f9f5eb"
              position={[0, 0.08, -0.09]}
              rotation={[-0.28, 0, 0]}
              scale={[1.1, 1.06, 1.05]}
              gradientMap={gradientMap}
            />
            {/* Side Ghutra drapes */}
            <ToonMesh
              geometry={geos.hijabTail}
              color="#f9f5eb"
              position={[-0.54, -0.35, -0.12]}
              rotation={[0, 0, -0.18]}
              scale={[1.0, 1.25, 0.6]}
              gradientMap={gradientMap}
            />
            <ToonMesh
              geometry={geos.hijabTail}
              color="#f9f5eb"
              position={[0.54, -0.35, -0.12]}
              rotation={[0, 0, 0.18]}
              scale={[1.0, 1.25, 0.6]}
              gradientMap={gradientMap}
            />
            {/* Emerald Green Double Agal */}
            <ToonMesh
              geometry={geos.agalRing}
              color="#145a38"
              position={[0, 0.38, -0.02]}
              rotation={[Math.PI / 2 - 0.15, 0, 0]}
              gradientMap={gradientMap}
            />
            <ToonMesh
              geometry={geos.agalRing}
              color="#196f45"
              position={[0, 0.46, -0.03]}
              rotation={[Math.PI / 2 - 0.15, 0, 0]}
              scale={[0.96, 0.96, 1]}
              gradientMap={gradientMap}
            />
            {/* Golden Crescent Accent */}
            <mesh geometry={geos.crescent} position={[0, 0.27, 0.54]} rotation={[0, 0, 0.6]} scale={0.75}>
              <meshBasicMaterial color="#eab308" />
            </mesh>
          </group>
        )}
      </group>

      {/* BODY / TORSO */}
      <group position={[0, -0.2, 0]}>
        <ToonMesh
          geometry={isAisyah ? geos.bodyDress : geos.bodyThobe}
          color={isAisyah ? '#9adbb5' : '#1e6e48'}
          gradientMap={gradientMap}
        />

        {/* Gold Trim for Aisyah Abaya */}
        {isAisyah && (
          <>
            <mesh geometry={geos.goldTrim} position={[-0.14, 0, 0.34]} rotation={[-0.22, 0, 0.12]}>
              <meshBasicMaterial color="#eab308" />
            </mesh>
            <mesh geometry={geos.goldTrim} position={[0.14, 0, 0.34]} rotation={[-0.22, 0, -0.12]}>
              <meshBasicMaterial color="#eab308" />
            </mesh>
          </>
        )}

        {/* Teal Placket for Ahmad Thobe */}
        {!isAisyah && (
          <mesh geometry={geos.goldTrim} position={[0, 0.2, 0.33]} scale={[0.9, 0.45, 0.8]}>
            <meshBasicMaterial color="#4db6ac" />
          </mesh>
        )}

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.36, 0.25, 0.05]}>
          <ToonMesh
            geometry={geos.arm}
            color={isAisyah ? '#9adbb5' : '#1e6e48'}
            position={[0, -0.18, 0]}
            gradientMap={gradientMap}
          />
          <ToonMesh geometry={geos.hand} color="#f8caa8" position={[0, -0.4, 0]} gradientMap={gradientMap} />
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.36, 0.25, 0.05]}>
          <ToonMesh
            geometry={geos.arm}
            color={isAisyah ? '#9adbb5' : '#1e6e48'}
            position={[0, -0.18, 0]}
            gradientMap={gradientMap}
          />
          <ToonMesh geometry={geos.hand} color="#f8caa8" position={[0, -0.4, 0]} gradientMap={gradientMap} />
        </group>

        {/* Shoes */}
        <ToonMesh
          geometry={geos.shoe}
          color="#5c3d2e"
          position={[-0.16, -0.52, 0.06]}
          scale={[1, 0.7, 1.3]}
          gradientMap={gradientMap}
        />
        <ToonMesh
          geometry={geos.shoe}
          color="#5c3d2e"
          position={[0.16, -0.52, 0.06]}
          scale={[1, 0.7, 1.3]}
          gradientMap={gradientMap}
        />
      </group>

      {/* FLOATING ENVELOPES FOR AISYAH */}
      {isAisyah && (
        <group ref={envelopesRef}>
          <ToonMesh
            geometry={geos.envelope}
            color="#facc15"
            position={[-0.78, 0.55, 0.25]}
            rotation={[0.2, 0.3, -0.3]}
            gradientMap={gradientMap}
          />
          <ToonMesh
            geometry={geos.envelope}
            color="#f472b6"
            position={[-0.65, 0.85, 0.1]}
            rotation={[-0.1, 0.2, 0.25]}
            gradientMap={gradientMap}
          />
          <ToonMesh
            geometry={geos.envelope}
            color="#34d399"
            position={[0.76, 0.45, 0.2]}
            rotation={[0.15, -0.3, 0.35]}
            gradientMap={gradientMap}
          />
        </group>
      )}
    </group>
  );
}
