import { EMOTION_MAP } from '../data/emotionMap';

const labelMap: Record<string, keyof typeof EMOTION_MAP> = {
  admiration: 'admiration',//감탄
  amusement: 'amusement',//즐거움
  anger: 'angry',
  annoyance: 'annoyance',//성가심
  approval: 'approval',
  caring: 'caring',
  confusion: 'confused',
  curiosity: 'curiosity',//호기심
  desire: 'desire',
  disappointment: 'disappointment',
  disapproval: 'disapproval',
  disgust: 'disgust',
  embarrassment: 'embarrassed',
  excitement: 'excited',
  fear: 'fear',
  gratitude: 'grateful',
  grief: 'grief',//큰슬픔
  joy: 'happy',
  love: 'love',
  nervousness: 'anxious',
  optimism: 'hopeful',
  pride: 'pride',
  realization: 'realization',//인식
  relief: 'relief',//안도
  remorse: 'remorse',//후회
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
