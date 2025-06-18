import { EMOTION_MAP } from '../data/emotionMap';

const labelMap: Record<string, keyof typeof EMOTION_MAP> = {
  admiration: 'proud',
  amusement: 'amusement',
  anger: 'angry',
  annoyance: 'annoyance',
  approval: 'happy',
  caring: 'caring',
  confusion: 'confused',
  curiosity: 'curiosity',
  desire: 'love',
  disappointment: 'sad',
  disapproval: 'angry',
  disgust: 'angry',
  embarrassment: 'embarrassed',
  excitement: 'excited',
  fear: 'fear',
  gratitude: 'grateful',
  grief: 'sad',
  joy: 'happy',
  love: 'love',
  nervousness: 'anxious',
  optimism: 'hopeful',
  pride: 'proud',
  realization: 'calm',
  relief: 'calm',
  remorse: 'guilty',
  sadness: 'sad',
  surprise: 'surprised',
  neutral: 'calm'
};

/**
 * Hugging Face 감정 label을 emotionId로 매핑
 * @param label Hugging Face 모델이 반환한 감정 label (예: "remorse")
 * @returns 너의 감정 도감 emotionId (예: "guilty") or null
 */
export const mapLabelToEmotionId = (label: string): string | null => {
  return labelMap[label] ?? null;
};
