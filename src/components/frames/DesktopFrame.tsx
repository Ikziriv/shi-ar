import { ArrowRight, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import {
  CHARACTERS,
  type CharacterId,
  type CharacterPose,
  type DimensionMode,
  type ShiarMessage,
} from '../../data/shiarContent';
import { CharacterStage3D } from '../three/CharacterStage3D';
import { Character2DStage } from '../character/Character2DStage';

interface DesktopFrameProps {
  characterId: CharacterId;
  dimension: DimensionMode;
  pose: CharacterPose;
  glbUrl?: string | null;
  message: ShiarMessage;
  messageIndex: number;
  totalMessages: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onNextMessage: () => void;
  onPlaySalam: () => void;
  onCharacterClick: () => void;
}

export function DesktopFrame({
  characterId,
  dimension,
  pose,
  glbUrl,
  message,
  messageIndex,
  totalMessages,
  isMuted,
  isFullscreen,
  onToggleFullscreen,
  onNextMessage,
  onPlaySalam,
  onCharacterClick,
}: DesktopFrameProps) {
  const character = CHARACTERS[characterId];
  const formattedIndex = String(messageIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalMessages).padStart(2, '0');

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-zinc-950'
          : 'group relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/50 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-colors duration-300 hover:border-white/[0.14]'
      }
    >
      {/* Minimalist Studio Viewport Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-zinc-950/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700/80" />
          <span className="ml-2 text-[11px] font-medium tracking-wide text-zinc-500">
            Desktop Viewport
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-[11px] font-medium text-zinc-400 sm:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            <span>{dimension === '3d' ? 'WebGL 3D' : '2.5D Parallax'}</span>
          </div>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Fullscreen Desktop'}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3 w-3" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Viewport Content */}
      <div
        className={`studio-grid-bg relative grid grid-cols-1 md:grid-cols-12 ${
          isFullscreen ? 'flex-1' : 'min-h-[440px]'
        }`}
      >
        {/* Left: Character Stage */}
        <div
          className={`relative flex items-center justify-center border-b border-white/[0.06] md:col-span-7 md:border-r md:border-b-0 ${
            isFullscreen ? 'min-h-[55vh] md:h-full' : 'min-h-[340px]'
          }`}
        >
          <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/[0.07] bg-zinc-950/60 px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
            <span className="text-zinc-500">Stage</span>
            <span className="text-zinc-600">/</span>
            <span>{character.name}</span>
          </div>

          {dimension === '3d' ? (
            <CharacterStage3D
              characterId={characterId}
              pose={pose}
              glbUrl={glbUrl}
              onCharacterClick={onCharacterClick}
            />
          ) : (
            <Character2DStage
              characterId={characterId}
              pose={pose}
              onCharacterClick={onCharacterClick}
            />
          )}

          {!isFullscreen && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.06] bg-zinc-950/70 px-3 py-1 text-[11px] text-zinc-400 backdrop-blur-md">
              {dimension === '3d'
                ? 'Drag to orbit · Scroll to zoom · Click character'
                : 'Move cursor for parallax · Click character'}
            </div>
          )}
        </div>

        {/* Right: Editorial Shi'ar Card Panel */}
        <div
          className={`flex flex-col justify-between bg-zinc-950/50 md:col-span-5 ${
            isFullscreen ? 'p-8 md:p-12' : 'p-6 md:p-7'
          }`}
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                {message.category}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                {formattedIndex} / {formattedTotal}
              </span>
            </div>

            <p
              dir="rtl"
              className={`font-arabic mb-5 text-right leading-[1.85] font-bold text-amber-100/95 ${
                isFullscreen ? 'text-3xl md:text-4xl' : 'text-2xl'
              }`}
            >
              {message.arabic}
            </p>

            <h3
              className={`mb-2.5 font-semibold tracking-tight text-zinc-100 ${
                isFullscreen ? 'text-xl md:text-2xl' : 'text-[17px]'
              }`}
            >
              {message.title}
            </h3>
            <p
              className={`mb-3 leading-relaxed text-zinc-300 italic ${
                isFullscreen ? 'text-sm md:text-base' : 'text-[13px]'
              }`}
            >
              “{message.translation}”
            </p>
            <p
              className={`leading-relaxed text-zinc-400 ${
                isFullscreen ? 'text-sm md:text-base' : 'text-xs'
              }`}
            >
              {message.meaning}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onPlaySalam}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span>{isMuted ? 'Suara Nonaktif' : 'Putar Salam'}</span>
            </button>
            <button
              type="button"
              onClick={onNextMessage}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              <span>Pesan Lainnya</span>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
