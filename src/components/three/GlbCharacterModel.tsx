import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterPose } from '../../data/shiarContent';

interface GlbCharacterModelProps {
  url: string;
  pose: CharacterPose;
  onClick?: () => void;
}

export function GlbCharacterModel({ url, pose, onClick }: GlbCharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const { actions, names } = useAnimations(animations, groupRef);

  // Normalize scale and center the GLB model cleanly on the pedestal
  const { scaleFactor, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetHeight = 2.05;
    const s = targetHeight / maxDim;

    return {
      scaleFactor: s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s - 0.95, -center.z * s),
    };
  }, [clonedScene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.envMapIntensity = 1.15;
          mat.needsUpdate = true;
        }
      }
    });
  }, [clonedScene]);

  // Play embedded GLB animations if present
  useEffect(() => {
    if (!names.length) return;
    const match =
      names.find((n) => n.toLowerCase().includes(pose)) || names[0];
    const action = actions[match];
    if (action) {
      action.reset().fadeIn(0.3).play();
      return () => {
        action.fadeOut(0.3);
      };
    }
  }, [actions, names, pose]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Subtle studio breathing & cursor look-at if no skeletal animation overrides
    groupRef.current.position.y = Math.sin(t * 1.8) * 0.035;
    const targetRotY = state.pointer.x * 0.25;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      delta * 3.5
    );
  });

  return (
    <group ref={groupRef} onClick={onClick}>
      <primitive
        object={clonedScene}
        scale={scaleFactor}
        position={[offset.x, offset.y, offset.z]}
      />
    </group>
  );
}
