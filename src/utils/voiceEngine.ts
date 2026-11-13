import type { CharacterId } from '../data/shiarContent';

export type VoiceGender = 'female' | 'male';

export interface DetectedVoiceInfo {
  readonly voiceName: string;
  readonly lang: string;
  readonly isNaturalNeural: boolean;
  readonly genderMatched: boolean;
}

const FEMALE_VOICE_KEYWORDS: readonly string[] = [
  'gadis',
  'damayanti',
  'putri',
  'siti',
  'female',
  'woman',
  'samantha',
  'victoria',
  'karen',
  'serena',
  'jenny',
  'aria',
  'sonia',
  'libby',
  'ava',
  'emma',
  'claire',
  'zira',
  'hazel',
  'susan',
  'google bahasa indonesia',
];

const MALE_VOICE_KEYWORDS: readonly string[] = [
  'ardi',
  'budi',
  'andika',
  'male',
  'man',
  'guy',
  'ryan',
  'daniel',
  'george',
  'alex',
  'aaron',
  'rishi',
  'oliver',
  'christopher',
  'eric',
  'andrew',
  'brian',
  'arthur',
  'fred',
  'david',
  'mark',
];

const ROBOTIC_VOICE_KEYWORDS: readonly string[] = [
  'espeak',
  'festival',
  'mbrola',
  'compact',
  'pico',
  'microsoft david',
  'microsoft zira',
  'microsoft mark',
];

function scoreVoice(voice: SpeechSynthesisVoice, targetGender: VoiceGender): {
  score: number;
  isNatural: boolean;
  genderMatched: boolean;
} {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  const isNatural = /natural|neural|online|wavenet|studio|chirp/i.test(name);
  if (isNatural) score += 120;
  else if (name.includes('google')) score += 75;
  else if (!voice.localService) score += 60;

  if (ROBOTIC_VOICE_KEYWORDS.some((kw) => name.includes(kw))) {
    score -= 100;
  }

  const targetKeywords =
    targetGender === 'female' ? FEMALE_VOICE_KEYWORDS : MALE_VOICE_KEYWORDS;
  const oppositeKeywords =
    targetGender === 'female' ? MALE_VOICE_KEYWORDS : FEMALE_VOICE_KEYWORDS;

  const matchesTarget = targetKeywords.some((kw) => name.includes(kw));
  const matchesOpposite = oppositeKeywords.some((kw) => name.includes(kw));

  if (matchesTarget) score += 95;
  if (matchesOpposite) score -= 140;

  if (lang.startsWith('id')) score += 55;
  else if (lang.startsWith('ms')) score += 30;
  else if (lang.startsWith('en')) score += 15;

  return {
    score,
    isNatural,
    genderMatched: matchesTarget && !matchesOpposite,
  };
}

export function pickBestHumanVoice(
  voices: readonly SpeechSynthesisVoice[],
  characterId: CharacterId
): { voice: SpeechSynthesisVoice | null; info: DetectedVoiceInfo | null } {
  if (!voices.length) return { voice: null, info: null };

  const targetGender: VoiceGender = characterId === 'aisyah' ? 'female' : 'male';

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  let bestMeta = { isNatural: false, genderMatched: false };

  for (const voice of voices) {
    const result = scoreVoice(voice, targetGender);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestVoice = voice;
      bestMeta = {
        isNatural: result.isNatural,
        genderMatched: result.genderMatched,
      };
    }
  }

  if (!bestVoice) return { voice: null, info: null };

  return {
    voice: bestVoice,
    info: {
      voiceName: bestVoice.name,
      lang: bestVoice.lang,
      isNaturalNeural: bestMeta.isNatural,
      genderMatched: bestMeta.genderMatched,
    },
  };
}

/**
 * Splits text into natural phrase chunks so speech synthesis breathes at punctuation
 * instead of rushing monotonically like a robot.
 */
function splitNaturalPhrases(text: string): string[] {
  return text
    .split(/(?<=[.!?,;])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function speakHumanized(
  text: string,
  characterId: CharacterId,
  isMuted: boolean,
  onVoiceDetected?: (info: DetectedVoiceInfo) => void
): void {
  if (isMuted) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const run = () => {
      const voices = synth.getVoices();
      const { voice, info } = pickBestHumanVoice(voices, characterId);
      if (info && onVoiceDetected) onVoiceDetected(info);

      const phrases = splitNaturalPhrases(text);
      const isAisyah = characterId === 'aisyah';

      phrases.forEach((phrase, index) => {
        const utterance = new SpeechSynthesisUtterance(phrase);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = 'id-ID';
        }

        // Subtle, natural human pitch & cadence (avoid extreme robotic pitch shifts)
        const pitchBase = isAisyah
          ? info?.genderMatched
            ? 1.03
            : 1.12
          : info?.genderMatched
          ? 0.96
          : 0.84;

        utterance.pitch = pitchBase;
        utterance.rate = index === 0 ? 0.94 : 0.96;
        utterance.volume = 1.0;

        synth.speak(utterance);
      });
    };

    if (synth.getVoices().length === 0) {
      synth.addEventListener('voiceschanged', run, { once: true });
    } else {
      run();
    }
  } catch {
    // Ignore browser autoplay/speech synthesis restrictions
  }
}

export function stopHumanizedSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
