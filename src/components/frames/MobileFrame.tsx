import { ArrowRight, Battery, Maximize2, Minimize2, Signal, Volume2, VolumeX, Wifi } from 'lucide-react';
import {
  CHARACTERS,
  type CharacterId,
  type CharacterPose,
  type DimensionMode,
  type ShiarMessage,
} from '../../data/shiarContent';
import { CharacterStage3D } from '../three/CharacterStage3D';
import { Character2DStage } from '../character/Character2DStage';

interface MobileFrameProps {
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

export function MobileFrame({
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
}: MobileFrameProps) {
  const character = CHARACTERS[characterId];
  const formattedIndex = String(messageIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalMessages).padStart(2, '0');

  const phoneShell = (
    <div
      className={
        isFullscreen
          ? 'mx-auto flex h-[92vh] w-[calc(92vh*0.52)] max-w-[94vw] flex-col'
          : 'mx-auto w-[310px] sm:w-[325px]'
      }
    >
      {/* Titanium / Obsidian Device Bezel */}
      <div
        className={`relative flex flex-col rounded-[44px] border-[5px] border-zinc-800/90 bg-zinc-950 p-2 shadow-[0_32px_72px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.12] ${
          isFullscreen ? 'h-full' : ''
        }`}
      >
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 z-30 flex h-5 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-emerald-500/30" />
        </div>

        {/* Screen Container */}
        <div
          className={`studio-grid-bg relative flex flex-col overflow-hidden rounded-[34px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 ${
            isFullscreen ? 'flex-1' : 'h-[590px]'
          }`}
        >
          {/* Status Bar */}
          <div className="z-20 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-zinc-300">
            <span className="tabular-nums">15:00</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>

          {/* App Header */}
          <div className="z-20 flex items-center justify-between px-4 pt-2">
            <div>
              <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                Shi’ar Mobile
              </p>
              <h4 className="text-sm font-semibold tracking-tight text-zinc-100">
                {character.name}
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                {dimension === '3d' ? '3D' : '2D'}
              </span>
              <button
                type="button"
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen Mobile'}
                aria-label={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen Mobile'}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] p-1.5 text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Character Viewport inside Mobile Screen */}
          <div className="relative flex-1">
            {dimension === '3d' ? (
              <CharacterStage3D
                characterId={characterId}
                pose={pose}
                glbUrl={glbUrl}
                onCharacterClick={onCharacterClick}
                compact={!isFullscreen}
              />
            ) : (
              <Character2DStage
                characterId={characterId}
                pose={pose}
                onCharacterClick={onCharacterClick}
                compact={!isFullscreen}
              />
            )}
          </div>

          {/* Bottom Sheet Shi'ar Card */}
          <div className="z-20 mx-3 mb-3.5 rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-3.5 backdrop-blur-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                {message.category}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-500">
                {formattedIndex}/{formattedTotal}
              </span>
            </div>

            <p
              dir="rtl"
              className="font-arabic mb-1.5 text-right text-base leading-relaxed font-bold text-amber-100/95"
            >
              {message.arabic}
            </p>
            <p className="mb-3 line-clamp-2 text-[11px] leading-snug text-zinc-400">
              {message.translation}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPlaySalam}
                title={isMuted ? 'Suara Nonaktif' : 'Putar Salam'}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-zinc-500" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isMuted ? 'Mute' : 'Salam'}</span>
              </button>
              <button
                type="button"
                onClick={onNextMessage}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2 text-[11px] font-semibold text-zinc-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span>Pesan Lainnya</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="mx-auto mb-2 h-1 w-24 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 p-4 backdrop-blur-2xl">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="fixed top-5 right-5 z-50 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.1] bg-zinc-900/90 px-3 py-2 text-xs font-medium text-zinc-200 shadow-xl transition-colors hover:border-white/20 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          <span>Exit (Esc)</span>
        </button>
        {phoneShell}
      </div>
    );
  }

  return phoneShell;
}
