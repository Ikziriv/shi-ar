import type { CharacterId } from '../data/shiarContent';
import { speakHumanized, stopHumanizedSpeech } from '../utils/voiceEngine';

let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

export function stopEdgeTtsAudio(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (activeUrl) {
    URL.revokeObjectURL(activeUrl);
    activeUrl = null;
  }
  stopHumanizedSpeech();
}

export function getEdgeNeuralVoiceName(characterId: CharacterId): string {
  return characterId === 'aisyah' ? 'id-ID-GadisNeural' : 'id-ID-ArdiNeural';
}

export async function speakWithEdgeTts(
  text: string,
  characterId: CharacterId,
  isMuted: boolean
): Promise<'edge-tts' | 'browser'> {
  if (isMuted) return 'edge-tts';

  stopEdgeTtsAudio();
  const voice = getEdgeNeuralVoiceName(characterId);

  try {
    const res = await fetch('/api/edge-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        rate: '-4%',
      }),
    });

    if (!res.ok) {
      throw new Error(`Edge TTS HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    activeUrl = url;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        stopEdgeTtsAudio();
        resolve();
      };
      audio.onerror = () => {
        stopEdgeTtsAudio();
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch((err) => {
        stopEdgeTtsAudio();
        reject(err);
      });
    });

    return 'edge-tts';
  } catch {
    // Fallback to Browser Web Speech API (window.speechSynthesis)
    speakHumanized(text, characterId, isMuted);
    return 'browser';
  }
}
