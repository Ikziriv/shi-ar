import { useRef, useState } from 'react';
import { Loader2, Mic, Send, Sparkles, Square } from 'lucide-react';
import { getStoredGroqApiKey, transcribeWithGroqWhisper } from '../../services/groqShiarService';

interface SmartShiarBarProps {
  hasApiKey: boolean;
  isGenerating: boolean;
  onOpenKeyModal: () => void;
  onGenerate: (prompt: string) => void;
}

const QUICK_TOPICS = [
  'Doa pagi pembuka rezeki',
  'Adab berbicara lembut',
  'Keutamaan sedekah subuh',
  'Sabar dan syukur',
];

export function SmartShiarBar({
  hasApiKey,
  isGenerating,
  onOpenKeyModal,
  onGenerate,
}: SmartShiarBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    if (!hasApiKey) {
      onOpenKeyModal();
      return;
    }
    onGenerate(prompt.trim());
    setPrompt('');
  };

  const handleMicToggle = async () => {
    if (!hasApiKey) {
      onOpenKeyModal();
      return;
    }

    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const apiKey = getStoredGroqApiKey();
          const text = await transcribeWithGroqWhisper(blob, apiKey);
          if (text) {
            setPrompt(text);
            onGenerate(text);
          }
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-3 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-950/90 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              hasApiKey
                ? 'Tulis topik syi’ar (mis. Keutamaan senyum, Doa belajar)...'
                : 'Klik untuk atur Groq API Key & buat Smart Shi’ar...'
            }
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleMicToggle}
          disabled={isTranscribing || isGenerating}
          title="Bicara dalam Bahasa Indonesia (Groq Whisper STT)"
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
            isRecording
              ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
              : 'border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20 hover:text-white'
          }`}
        >
          {isTranscribing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isRecording ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {isTranscribing ? 'Memproses...' : isRecording ? 'Stop' : 'Bicara'}
          </span>
        </button>

        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>{isGenerating ? 'Merangkai...' : 'Smart Shi’ar'}</span>
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-zinc-500">Topik cepat:</span>
        {QUICK_TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            disabled={isGenerating}
            onClick={() => {
              if (!hasApiKey) {
                onOpenKeyModal();
                return;
              }
              onGenerate(topic);
            }}
            className="cursor-pointer rounded-md border border-white/[0.06] bg-zinc-950/70 px-2 py-0.5 text-[11px] text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
