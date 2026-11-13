import { useEffect, useRef, useState } from 'react';
import {
  CHARACTERS,
  SHIAR_MESSAGES,
  type CharacterId,
  type CharacterPose,
  type DimensionMode,
  type ShiarMessage,
} from './data/shiarContent';
import {
  generateSmartShiar,
  getStoredGroqApiKey,
  saveGroqApiKey,
} from './services/groqShiarService';
import {
  getEdgeNeuralVoiceName,
  speakWithEdgeTts,
  stopEdgeTtsAudio,
} from './services/edgeTtsService';
import { useAutoFrame } from './hooks/useAutoFrame';
import { StudioHeader } from './components/ui/StudioHeader';
import { SmartShiarBar } from './components/ui/SmartShiarBar';
import { GroqKeyModal } from './components/ui/GroqKeyModal';
import { DesktopFrame } from './components/frames/DesktopFrame';
import { MobileFrame } from './components/frames/MobileFrame';

type FullscreenTarget = 'none' | 'desktop' | 'mobile';

export function App() {
  const [characterId, setCharacterId] = useState<CharacterId>('aisyah');
  const [dimension, setDimension] = useState<DimensionMode>('3d');
  const [pose, setPose] = useState<CharacterPose>('idle');
  const [messages, setMessages] = useState<ShiarMessage[]>(SHIAR_MESSAGES);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [fullscreenTarget, setFullscreenTarget] = useState<FullscreenTarget>('none');
  const [glbUrls, setGlbUrls] = useState<Partial<Record<CharacterId, string>>>({});
  const [groqApiKey, setGroqApiKey] = useState<string>(() => getStoredGroqApiKey());
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selection: frameSelection,
    setSelection: setFrameSelection,
    detectedDevice,
    resolvedLayout,
  } = useAutoFrame('auto');

  const currentMessage = messages[msgIndex] ?? messages[0];
  const currentCharacter = CHARACTERS[characterId];
  const activeGlbUrl = glbUrls[characterId] ?? null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenTarget !== 'none') {
        setFullscreenTarget('none');
      }
    };
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenTarget('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [fullscreenTarget]);

  const toggleFullscreen = async (target: 'desktop' | 'mobile') => {
    if (fullscreenTarget === target) {
      setFullscreenTarget('none');
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } else {
      setFullscreenTarget(target);
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopEdgeTtsAudio();
      }
      return next;
    });
  };

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => {
      setToast((prev) => (prev === text ? null : prev));
    }, 3200);
  };

  const speakCard = async (msg: ShiarMessage) => {
    if (isMuted) return;
    const naturalScript = `Assalamu'alaikum. ${msg.title}. ${msg.translation}`;
    await speakWithEdgeTts(naturalScript, characterId, isMuted);
  };

  const handleSaveGroqKey = (key: string) => {
    saveGroqApiKey(key);
    setGroqApiKey(key.trim());
    showToast(
      key.trim()
        ? 'Groq API Key tersimpan. Smart Shi’ar & Orpheus TTS siap digunakan!'
        : 'Groq API Key dihapus.'
    );
  };

  const handleGenerateSmartShiar = async (prompt: string) => {
    if (!groqApiKey) {
      setIsGroqModalOpen(true);
      return;
    }
    setIsGenerating(true);
    setPose('salam');
    try {
      const smartCard = await generateSmartShiar(prompt, characterId, groqApiKey);
      setMessages((prev) => [smartCard, ...prev]);
      setMsgIndex(0);
      showToast(`Smart Shi’ar oleh ${currentCharacter.name}: “${smartCard.title}”`);
      await speakCard(smartCard);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat Smart Shi’ar.');
    } finally {
      setIsGenerating(false);
      setPose('idle');
    }
  };

  const handleGlbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setGlbUrls((prev) => {
      if (prev[characterId]) URL.revokeObjectURL(prev[characterId]!);
      return { ...prev, [characterId]: objectUrl };
    });
    setDimension('3d');
    showToast(`Model GLB "${file.name}" dimuat untuk ${currentCharacter.name}.`);
    e.target.value = '';
  };

  const handleResetGlb = () => {
    setGlbUrls((prev) => {
      if (prev[characterId]) URL.revokeObjectURL(prev[characterId]!);
      const next = { ...prev };
      delete next[characterId];
      return next;
    });
    showToast(`Kembali ke model 3D default untuk ${currentCharacter.name}.`);
  };

  const handleNextMessage = () => {
    const nextIdx = (msgIndex + 1) % messages.length;
    setMsgIndex(nextIdx);
    const nextMsg = messages[nextIdx];
    void speakCard(nextMsg);
  };

  const handlePlaySalam = () => {
    setPose('salam');
    showToast(`${currentCharacter.name}: “${currentCharacter.greeting}”`);
    void speakCard(currentMessage);
    window.setTimeout(() => setPose('idle'), 2600);
  };

  const handleCharacterClick = () => {
    const nextPose: CharacterPose = pose === 'wave' ? 'salam' : 'wave';
    setPose(nextPose);
    showToast(
      nextPose === 'wave'
        ? `${currentCharacter.name} melambaikan salam ukhuwah.`
        : `${currentCharacter.name} memberi hormat salam.`
    );
    void speakCard(currentMessage);
  };

  const activeVoiceLabel = `Edge Neural (${getEdgeNeuralVoiceName(characterId)})`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* Subtle Studio Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.07] blur-[140px]" />
        <div className="absolute right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-zinc-500/[0.06] blur-[140px]" />
      </div>

      {/* Hidden GLB File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleGlbUpload}
        className="hidden"
      />

      {/* Minimalist Professional Header */}
      <StudioHeader
        characterId={characterId}
        onSelectCharacter={setCharacterId}
        dimension={dimension}
        onSelectDimension={setDimension}
        frameSelection={frameSelection}
        detectedDevice={detectedDevice}
        onSelectFrame={setFrameSelection}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        hasCustomGlb={Boolean(activeGlbUrl)}
        onTriggerGlbUpload={() => fileInputRef.current?.click()}
        onResetGlb={handleResetGlb}
        hasGroqKey={Boolean(groqApiKey)}
        onOpenGroqModal={() => setIsGroqModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Quiet Context & Pose Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-200">{currentCharacter.name}</span>
            <span className="text-zinc-600">/</span>
            <span>{currentCharacter.role}</span>
            <span className="hidden text-zinc-600 sm:inline">·</span>
            <span className="hidden text-zinc-500 sm:inline">
              {frameSelection === 'auto'
                ? `Auto-detected ${detectedDevice} frame`
                : `Manual ${frameSelection} view`}
            </span>
            <span className="hidden text-zinc-600 md:inline">·</span>
            <span className="hidden text-zinc-500 md:inline">
              Voice ({characterId === 'aisyah' ? 'Women' : 'Men'}):{' '}
              <span className="text-zinc-300">{activeVoiceLabel}</span>
            </span>
          </div>

          <div className="inline-flex items-center rounded-lg border border-white/[0.08] bg-zinc-900/70 p-0.5">
            {(['idle', 'salam', 'wave'] as CharacterPose[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPose(p)}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  pose === p
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p === 'idle' ? 'Standby' : p === 'salam' ? 'Salam' : 'Wave'}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Shi'ar Prompt + Whisper STT Bar */}
        <SmartShiarBar
          hasApiKey={Boolean(groqApiKey)}
          isGenerating={isGenerating}
          onOpenKeyModal={() => setIsGroqModalOpen(true)}
          onGenerate={handleGenerateSmartShiar}
        />

        {/* Frames Showcase Grid */}
        <main
          className={`grid items-center gap-8 ${
            resolvedLayout === 'both' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {(resolvedLayout === 'both' || resolvedLayout === 'desktop') && (
            <section
              className={
                resolvedLayout === 'both' ? 'xl:col-span-8' : 'mx-auto w-full max-w-5xl'
              }
            >
              <DesktopFrame
                characterId={characterId}
                dimension={dimension}
                pose={pose}
                glbUrl={activeGlbUrl}
                message={currentMessage}
                messageIndex={msgIndex}
                totalMessages={messages.length}
                isMuted={isMuted}
                isFullscreen={fullscreenTarget === 'desktop'}
                onToggleFullscreen={() => toggleFullscreen('desktop')}
                onNextMessage={handleNextMessage}
                onPlaySalam={handlePlaySalam}
                onCharacterClick={handleCharacterClick}
              />
            </section>
          )}

          {(resolvedLayout === 'both' || resolvedLayout === 'mobile') && (
            <section
              className={
                resolvedLayout === 'both'
                  ? 'xl:col-span-4'
                  : 'mx-auto flex w-full justify-center'
              }
            >
              <MobileFrame
                characterId={characterId}
                dimension={dimension}
                pose={pose}
                glbUrl={activeGlbUrl}
                message={currentMessage}
                messageIndex={msgIndex}
                totalMessages={messages.length}
                isMuted={isMuted}
                isFullscreen={fullscreenTarget === 'mobile'}
                onToggleFullscreen={() => toggleFullscreen('mobile')}
                onNextMessage={handleNextMessage}
                onPlaySalam={handlePlaySalam}
                onCharacterClick={handleCharacterClick}
              />
            </section>
          )}
        </main>
      </div>

      {/* Groq API Key Modal */}
      <GroqKeyModal
        isOpen={isGroqModalOpen}
        initialKey={groqApiKey}
        onClose={() => setIsGroqModalOpen(false)}
        onSave={handleSaveGroqKey}
      />

      {/* Minimalist Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-2.5 text-xs font-medium text-zinc-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
