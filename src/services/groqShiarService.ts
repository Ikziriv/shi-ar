import type { CharacterId, ShiarMessage } from '../data/shiarContent';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const STORAGE_KEY = 'shiar_groq_api_key';

export type GroqTtsLanguage = 'ar' | 'en';

export interface SmartShiarResponse extends ShiarMessage {
  englishSpeech: string;
}

export function getStoredGroqApiKey(): string {
  if (typeof __GROQ_ENV_KEY__ === 'string' && __GROQ_ENV_KEY__.trim().length > 0) {
    return __GROQ_ENV_KEY__.trim();
  }
  const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(STORAGE_KEY)?.trim() ?? '';
}

export function saveGroqApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const cleaned = key.trim();
  if (cleaned) {
    window.localStorage.setItem(STORAGE_KEY, cleaned);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function getGroqVoiceConfig(characterId: CharacterId, lang: GroqTtsLanguage) {
  if (lang === 'ar') {
    return {
      model: 'canopylabs/orpheus-arabic-saudi',
      voice: characterId === 'aisyah' ? 'aisha' : 'abdullah',
    };
  }
  return {
    model: 'canopylabs/orpheus-v1-english',
    voice: characterId === 'aisyah' ? 'diana' : 'austin',
  };
}

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export function stopGroqAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

export async function synthesizeGroqSpeech(
  text: string,
  characterId: CharacterId,
  lang: GroqTtsLanguage,
  apiKey: string
): Promise<Blob> {
  const { model, voice } = getGroqVoiceConfig(characterId, lang);

  // Orpheus input limit is 200 chars per request; trim cleanly at word boundary
  const trimmed =
    text.length > 195 ? `${text.slice(0, 192).replace(/\s+\S*$/, '')}...` : text;

  const res = await fetch(`${GROQ_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input: trimmed,
      response_format: 'wav',
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    try {
      const parsed = JSON.parse(errText) as {
        error?: { code?: string; message?: string };
      };
      if (parsed.error?.code === 'model_terms_required') {
        throw new Error(
          `MODEL_TERMS_REQUIRED:${model}:Aktifkan persetujuan model "${model}" di Groq Console Playground.`
        );
      }
      if (parsed.error?.message) {
        throw new Error(`Groq TTS (${res.status}): ${parsed.error.message}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('MODEL_TERMS_REQUIRED:')) {
        throw e;
      }
    }
    throw new Error(`Groq TTS error (${res.status}): ${errText}`);
  }

  return await res.blob();
}

export function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    stopGroqAudio();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    currentAudioUrl = url;

    audio.onended = () => {
      stopGroqAudio();
      resolve();
    };
    audio.onerror = () => {
      stopGroqAudio();
      reject(new Error('Gagal memutar audio Groq.'));
    };

    audio.play().catch((err) => {
      stopGroqAudio();
      reject(err);
    });
  });
}

export async function speakWithGroqSequence(
  arabicText: string,
  englishText: string,
  characterId: CharacterId,
  apiKey: string
): Promise<void> {
  stopGroqAudio();
  let lastTermsError: Error | null = null;
  let playedAny = false;

  if (arabicText.trim()) {
    try {
      const arBlob = await synthesizeGroqSpeech(arabicText, characterId, 'ar', apiKey);
      await playAudioBlob(arBlob);
      playedAny = true;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('MODEL_TERMS_REQUIRED:')) {
        lastTermsError = err;
      } else {
        throw err;
      }
    }
  }

  if (englishText.trim()) {
    const cleaned = englishText.trim().replace(/^\[warm\]\s*/i, '[cheerful] ');
    const taggedEnglish = cleaned.startsWith('[')
      ? cleaned
      : `[cheerful] ${cleaned}`;
    try {
      const enBlob = await synthesizeGroqSpeech(taggedEnglish, characterId, 'en', apiKey);
      await playAudioBlob(enBlob);
      playedAny = true;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('MODEL_TERMS_REQUIRED:')) {
        lastTermsError = err;
      } else {
        throw err;
      }
    }
  }

  if (!playedAny && lastTermsError) {
    throw lastTermsError;
  }
}

const PREFERRED_CHAT_MODELS: readonly string[] = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

async function resolveAvailableChatModel(apiKey: string): Promise<string> {
  try {
    const res = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return 'llama-3.1-8b-instant';

    const data = (await res.json()) as { data?: Array<{ id: string }> };
    const availableIds = (data.data ?? [])
      .map((m) => m.id)
      .filter(
        (id) =>
          !/whisper|orpheus|tts|guard|safeguard|prompt-guard/i.test(id)
      );

    for (const preferred of PREFERRED_CHAT_MODELS) {
      if (availableIds.includes(preferred)) return preferred;
    }
    if (availableIds.length > 0) return availableIds[0];
  } catch {
    // Fallback below
  }
  return 'llama-3.1-8b-instant';
}

export async function generateSmartShiar(
  prompt: string,
  characterId: CharacterId,
  apiKey: string
): Promise<SmartShiarResponse> {
  const persona =
    characterId === 'aisyah'
      ? 'Aisyah (warm, gentle Muslimah sharing Islamic kindness and daily prayers)'
      : 'Ahmad (calm, respectful Muslim brother sharing Islamic adab and wisdom)';

  const systemPrompt = `You are ${persona}.
The user will give a topic or question in Indonesian, English, or Arabic.
Respond ONLY with valid JSON matching this exact schema (no markdown fences):
{
  "category": "short Indonesian category like Syi'ar Adab / Doa Harian / Mutiara Hikmah",
  "arabic": "authentic short Arabic phrase, du'a, or greeting with harakat (under 150 characters)",
  "title": "concise Indonesian title",
  "translation": "natural Indonesian translation or key message",
  "meaning": "1-2 sentences of warm Indonesian Islamic reflection",
  "englishSpeech": "natural, conversational spoken English (under 170 chars) starting with [warm] or [cheerful], using natural pauses like '...' and commas so TTS sounds human, not robotic"
}`;

  const model = await resolveAvailableChatModel(apiKey);

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Groq LLM error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Respons Groq kosong.');

  const parsed = JSON.parse(raw) as Omit<SmartShiarResponse, 'id' | 'badgeColor'>;
  return {
    id: `smart-${Date.now()}`,
    badgeColor: 'emerald',
    category: parsed.category || 'Smart Syi’ar',
    arabic: parsed.arabic || 'السَّلَامُ عَلَيْكُمْ',
    title: parsed.title || 'Pesan Kebaikan',
    translation: parsed.translation || '',
    meaning: parsed.meaning || '',
    englishSpeech:
      parsed.englishSpeech ||
      'Peace be upon you. May Allah bless your day with goodness.',
  };
}

export async function transcribeWithGroqWhisper(
  audioBlob: Blob,
  apiKey: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'id');

  const res = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Groq Whisper error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text?.trim() ?? '';
}
