import { useState } from 'react';
import { KeyRound, X } from 'lucide-react';

interface GroqKeyModalProps {
  isOpen: boolean;
  initialKey: string;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function GroqKeyModal({
  isOpen,
  initialKey,
  onClose,
  onSave,
}: GroqKeyModalProps) {
  const [value, setValue] = useState(initialKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <KeyRound className="h-4 w-4 text-emerald-400" />
            <span>Groq API Configuration</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-zinc-400">
          Masukkan Groq API Key Anda (<code className="text-zinc-200">gsk_...</code>) untuk mengaktifkan{' '}
          <strong className="text-zinc-200">Smart Shi’ar LLM</strong>,{' '}
          <strong className="text-zinc-200">Whisper STT (Indonesia)</strong>, dan{' '}
          <strong className="text-zinc-200">Orpheus Human TTS (Arabic & English)</strong>. Key disimpan lokal di browser Anda.
        </p>

        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
          className="mb-4 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(value);
              onClose();
            }}
            className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white"
          >
            Simpan Key
          </button>
        </div>
      </div>
    </div>
  );
}
