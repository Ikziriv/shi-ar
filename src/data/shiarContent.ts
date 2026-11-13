export type CharacterId = 'aisyah' | 'ahmad';
export type DimensionMode = '3d' | '2d';
export type FrameLayout = 'both' | 'desktop' | 'mobile';
export type CharacterPose = 'idle' | 'salam' | 'wave';

export interface ShiarMessage {
  id: string;
  category: string;
  arabic: string;
  title: string;
  translation: string;
  meaning: string;
  englishSpeech?: string;
  badgeColor: string;
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  role: string;
  image2D: string;
  accentColor: string;
  secondaryColor: string;
  greeting: string;
}

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  aisyah: {
    id: 'aisyah',
    name: 'Aisyah',
    role: 'Pembawa Pesan Kebaikan & Ukhuwah',
    image2D: '/assets/characters/aisyah-2d.png',
    accentColor: '#c4b5fd',
    secondaryColor: '#6ee7b7',
    greeting: 'Assalamu alaikum! Ada surat kebaikan dan doa spesial untukmu hari ini.',
  },
  ahmad: {
    id: 'ahmad',
    name: 'Ahmad',
    role: 'Sahabat Adab & Penjaga Sunnah',
    image2D: '/assets/characters/ahmad-2d.png',
    accentColor: '#34d399',
    secondaryColor: '#fde68a',
    greeting: 'Assalamu alaikum warahmatullah! Mari hiasi hari dengan senyum dan adab mulia.',
  },
};

export const SHIAR_MESSAGES: ShiarMessage[] = [
  {
    id: 'salam',
    category: 'Syi’ar Salam',
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    title: 'Sebarkan Salam & Kedamaian',
    translation: 'Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu.',
    meaning: 'Menyapa sesama Muslim dengan salam menumbuhkan kasih sayang dan keberkahan dalam ukhuwah.',
    englishSpeech: '[warm] Peace, mercy, and the blessings of Allah... be upon you today.',
    badgeColor: 'emerald',
  },
  {
    id: 'smile',
    category: 'Adab & Akhlak',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    title: 'Senyummu Adalah Sedekah',
    translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu. (HR. Tirmidzi)',
    meaning: 'Kebaikan paling sederhana yang membawa kebahagiaan dan cahaya bagi hati orang lain.',
    englishSpeech: '[cheerful] Remember, your warm smile to someone else... is a beautiful charity.',
    badgeColor: 'violet',
  },
  {
    id: 'bismillah',
    category: 'Doa Harian',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    title: 'Awali Segalanya dengan Bismillah',
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
    meaning: 'Setiap aktivitas baik yang diawali dengan nama Allah akan bernilai ibadah dan penuh berkah.',
    englishSpeech: '[warm] Let’s begin every good deed in the name of Allah, the Most Merciful.',
    badgeColor: 'amber',
  },
  {
    id: 'syukur',
    category: 'Mutiara Al-Qur’an',
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    title: 'Nikmat Bertambah dengan Syukur',
    translation: 'Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu. (QS. Ibrahim: 7)',
    meaning: 'Hati yang pandai bersyukur selalu menemukan ketenangan dan kelapangan rezeki.',
    englishSpeech: '[warm] When we’re truly grateful... Allah will surely increase His blessings upon us.',
    badgeColor: 'teal',
  },
];

export {
  speakHumanized as speakShiarHumanized,
  stopHumanizedSpeech as stopShiarAudio,
  pickBestHumanVoice,
  type DetectedVoiceInfo,
} from '../utils/voiceEngine';
