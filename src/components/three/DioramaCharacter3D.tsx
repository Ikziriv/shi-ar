import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CHARACTERS, type CharacterId, type CharacterPose } from '../../data/shiarContent';
import { IslamicStar3D } from './IslamicCelestial3D';

interface DioramaCharacter3DProps {
  characterId: CharacterId;
  pose: CharacterPose;
  onClick?: () => void;
}

export function DioramaCharacter3D({
  characterId,
  pose,
  onClick,
}: DioramaCharacter3DProps) {
  const charGroupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const character = CHARACTERS[characterId];
  const texture = useTexture(character.image2D);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const isAisyah = characterId === 'aisyah';
  const aspect = isAisyah ? 740 / 727 : 472 / 853;
  const height = 2.05;
  const width = height * aspect;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (charGroupRef.current) {
      const targetY = pose === 'wave' ? Math.abs(Math.sin(t * 5)) * 0.08 : Math.sin(t * 2) * 0.03;
      const targetRotX = pose === 'salam' ? 0.12 : -state.pointer.y * 0.08;
      const targetRotY = state.pointer.x * 0.22;
      const targetScale = pose === 'wave' ? 1.04 : 1;

      charGroupRef.current.position.y = THREE.MathUtils.lerp(
        charGroupRef.current.position.y,
        0.1 + targetY,
        delta * 6
      );
      charGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        charGroupRef.current.rotation.x,
        targetRotX,
        delta * 5
      );
      charGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        charGroupRef.current.rotation.y,
        targetRotY,
        delta * 5
      );
      charGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(charGroupRef.current.scale.x, targetScale, delta * 6)
      );
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 0.45;
    }
  });

  return (
    <group position={[0, -0.15, 0]} onClick={onClick}>
      {/* 3D Islamic Collectible Pedestal */}
      <group position={[0, -0.92, 0]}>
        {/* Obsidian / Deep Emerald Base */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.92, 1.0, 0.12, 32]} />
          <meshStandardMaterial
            color={isAisyah ? '#18181b' : '#11221c'}
            metalness={0.45}
            roughness={0.32}
          />
        </mesh>
        {/* Brushed Champagne Gold Trim Ring */}
        <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.018, 16, 64]} />
          <meshStandardMaterial
            color="#e7c677"
            metalness={0.9}
            roughness={0.18}
            emissive="#926b22"
            emissiveIntensity={0.12}
          />
        </mesh>
        {/* Subtle Satin Top Disc */}
        <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.89, 48]} />
          <meshStandardMaterial
            color={isAisyah ? '#27272a' : '#092e24'}
            emissive={isAisyah ? '#3f3f46' : '#064e3b'}
            emissiveIntensity={0.18}
            roughness={0.45}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Main Character Standee Plane (Exact 2D Artwork in 3D Space) */}
      <group ref={charGroupRef} position={[0, 0.1, 0]}>
        <mesh castShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.08}
            side={THREE.DoubleSide}
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* 3D Islamic Backdrop Halo Ring */}
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.12}>
        <mesh position={[0, 0.25, -0.45]}>
          <torusGeometry args={[1.18, 0.014, 16, 72]} />
          <meshStandardMaterial
            color="#e7c677"
            metalness={0.9}
            roughness={0.2}
            emissive="#926b22"
            emissiveIntensity={0.18}
          />
        </mesh>
      </Float>

      {/* 3D Orbiting Sculpted Islamic Stars */}
      <group ref={orbitRef} position={[0, 0.2, 0]}>
        <IslamicStar3D
          points={8}
          position={[1.18, 0.35, 0.25]}
          scale={1.05}
          color="#f5c542"
          emissive="#b45309"
        />
        <IslamicStar3D
          points={5}
          position={[-1.16, 0.08, -0.22]}
          scale={0.95}
          color="#34d399"
          emissive="#047857"
        />
        <IslamicStar3D
          points={8}
          position={[0.2, 0.85, -1.02]}
          scale={0.9}
          color="#c4b5fd"
          emissive="#6d28d9"
        />
      </group>
    </group>
  );
}
