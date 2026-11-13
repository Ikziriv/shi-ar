import {
  Columns2,
  KeyRound,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CHARACTERS,
  type CharacterId,
  type DimensionMode,
} from '../../data/shiarContent';
import type { DetectedDevice, FrameSelection } from '../../hooks/useAutoFrame';

interface StudioHeaderProps {
  characterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  dimension: DimensionMode;
  onSelectDimension: (mode: DimensionMode) => void;
  frameSelection: FrameSelection;
  detectedDevice: DetectedDevice;
  onSelectFrame: (selection: FrameSelection) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasCustomGlb: boolean;
  onTriggerGlbUpload: () => void;
  onResetGlb: () => void;
  hasGroqKey: boolean;
  onOpenGroqModal: () => void;
}

export function StudioHeader({
  characterId,
  onSelectCharacter,
  dimension,
  onSelectDimension,
  frameSelection,
  detectedDevice,
  onSelectFrame,
  isMuted,
  onToggleMute,
  hasCustomGlb,
  onTriggerGlbUpload,
  onResetGlb,
  hasGroqKey,
  onOpenGroqModal,
}: StudioHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-zinc-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
              Shi’ar
            </span>
          </div>
          <span className="h-3.5 w-px bg-white/10" />
          <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
            Studio
          </span>
        </div>

        {/* Unified Single-Row Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Character Segmented Control */}
          <div
            role="group"
            aria-label="Character"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-zinc-900/70 p-0.5"
          >
            {(['aisyah', 'ahmad'] as CharacterId[]).map((id) => {
              const active = characterId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectCharacter(id)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                    active
                      ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {CHARACTERS[id].name}
                </button>
              );
            })}
          </div>

          {/* Dimension Segmented Control */}
          <div
            role="group"
            aria-label="Dimension"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-zinc-900/70 p-0.5"
          >
            {(['3d', '2d'] as DimensionMode[]).map((mode) => {
              const active = dimension === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectDimension(mode)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                    active
                      ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          {/* Frame Auto-Detection & Layout Control */}
          <div
            role="group"
            aria-label="Display Frame"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-zinc-900/70 p-0.5"
          >
            <button
              type="button"
              onClick={() => onSelectFrame('auto')}
              title={`Auto-detected: ${detectedDevice}`}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                frameSelection === 'auto'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Auto</span>
              <span
                className={`hidden text-[10px] sm:inline ${
                  frameSelection === 'auto' ? 'text-zinc-600' : 'text-zinc-500'
                }`}
              >
                · {detectedDevice === 'desktop' ? 'Desktop' : 'Mobile'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectFrame('desktop')}
              title="Desktop Frame"
              aria-label="Desktop Frame"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                frameSelection === 'desktop'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectFrame('mobile')}
              title="Mobile Frame"
              aria-label="Mobile Frame"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                frameSelection === 'mobile'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectFrame('both')}
              title="Tampilkan Desktop & Mobile"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                frameSelection === 'both'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Both</span>
            </button>
          </div>

          <span className="hidden h-4 w-px bg-white/[0.08] sm:inline-block" />

          {/* Groq API, GLB Upload & Voice */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenGroqModal}
              title="Atur Groq API Key untuk Smart Shi'ar & Orpheus TTS"
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                hasGroqKey
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-white/[0.1] bg-zinc-900/90 text-zinc-300 hover:border-white/25 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{hasGroqKey ? 'Groq Active' : 'Groq Key'}</span>
            </button>

            <button
              type="button"
              onClick={onTriggerGlbUpload}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-zinc-800/80 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              <Upload className="h-3.5 w-3.5 text-zinc-400" />
              <span>{hasCustomGlb ? 'Ganti GLB' : 'Load GLB'}</span>
            </button>

            {hasCustomGlb && (
              <button
                type="button"
                onClick={onResetGlb}
                title="Reset model default"
                aria-label="Reset model default"
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/70 p-1.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              aria-label={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              className={`inline-flex cursor-pointer items-center justify-center rounded-lg border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                isMuted
                  ? 'border-white/[0.08] bg-zinc-900/70 text-zinc-500 hover:text-zinc-300'
                  : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
              }`}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
