import { useState } from 'react';
import { CHARACTERS, type CharacterId, type CharacterPose } from '../../data/shiarContent';

interface Character2DStageProps {
  characterId: CharacterId;
  pose: CharacterPose;
  onCharacterClick?: () => void;
  compact?: boolean;
}

export function Character2DStage({
  characterId,
  pose,
  onCharacterClick,
  compact = false,
}: Character2DStageProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const character = CHARACTERS[characterId];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 12, y: nx * 14 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const poseTransform =
    pose === 'salam'
      ? 'scale(1.03) translateY(3px)'
      : pose === 'wave'
      ? 'scale(1.05) rotate(-1.5deg) translateY(-5px)'
      : 'scale(1)';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCharacterClick}
      className="relative flex h-full w-full cursor-pointer select-none items-center justify-center overflow-hidden"
      style={{ perspective: '900px' }}
    >
      {/* Subtle Studio Spotlight Aura */}
      <div
        className="pointer-events-none absolute h-64 w-64 rounded-full blur-3xl transition-colors duration-500"
        style={{
          background:
            characterId === 'aisyah'
              ? 'radial-gradient(circle, rgba(212,212,216,0.16), rgba(16,185,129,0.08), transparent 72%)'
              : 'radial-gradient(circle, rgba(52,211,153,0.18), rgba(253,230,138,0.08), transparent 72%)',
        }}
      />

      {/* Interactive 2.5D Parallax Character Sprite */}
      <div
        className="animate-breathe relative flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <img
          src={character.image2D}
          alt={character.name}
          draggable={false}
          className={`drop-shadow-[0_24px_32px_rgba(0,0,0,0.55)] transition-all duration-300 ${
            compact ? 'max-h-[220px] sm:max-h-[250px]' : 'max-h-[280px] sm:max-h-[320px]'
          } w-auto object-contain`}
          style={{ transform: poseTransform }}
        />
      </div>

      {/* Subtle Ground Shadow */}
      <div className="pointer-events-none absolute bottom-6 h-3.5 w-32 rounded-full bg-black/45 blur-md" />
    </div>
  );
}
