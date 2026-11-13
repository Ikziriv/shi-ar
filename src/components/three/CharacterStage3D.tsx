import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { DioramaCharacter3D } from './DioramaCharacter3D';
import { GlbCharacterModel } from './GlbCharacterModel';
import { CrescentMoonWithStar3D } from './IslamicCelestial3D';
import type { CharacterId, CharacterPose } from '../../data/shiarContent';

interface CharacterStage3DProps {
  characterId: CharacterId;
  pose: CharacterPose;
  glbUrl?: string | null;
  onCharacterClick?: () => void;
  compact?: boolean;
}

export function CharacterStage3D({
  characterId,
  pose,
  glbUrl,
  onCharacterClick,
  compact = false,
}: CharacterStage3DProps) {
  return (
    <div className="relative h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ position: [0, 0.25, compact ? 3.8 : 3.4], fov: 42 }}
      >
        {/* Studio IBL Environment for Premium PBR Reflections */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 0]}>
            <Lightformer
              form="rect"
              intensity={2.4}
              color="#fff8eb"
              scale={[6, 4, 1]}
              position={[0, 4, 3]}
            />
            <Lightformer
              form="circle"
              intensity={1.6}
              color="#c4b5fd"
              scale={4}
              position={[-4, 1, -2]}
            />
            <Lightformer
              form="circle"
              intensity={1.4}
              color="#6ee7b7"
              scale={4}
              position={[4, 0, -2]}
            />
          </group>
        </Environment>

        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#e0f2fe', '#bbf7d0', 0.45]} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          {glbUrl ? (
            <GlbCharacterModel
              url={glbUrl}
              pose={pose}
              onClick={onCharacterClick}
            />
          ) : (
            <DioramaCharacter3D
              characterId={characterId}
              pose={pose}
              onClick={onCharacterClick}
            />
          )}
        </Suspense>

        <CrescentMoonWithStar3D position={[1.08, 0.96, -0.55]} scale={1} />

        <Sparkles
          count={16}
          scale={3.4}
          size={1.6}
          speed={0.25}
          opacity={0.45}
          color={characterId === 'aisyah' ? '#d4d4d8' : '#fde68a'}
        />

        <ContactShadows
          position={[0, -0.96, 0]}
          opacity={0.5}
          scale={4.2}
          blur={2.4}
          far={2}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2.3}
          maxDistance={5.0}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.85}
        />
      </Canvas>
    </div>
  );
}
