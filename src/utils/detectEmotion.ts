import { EMOTION_MAP } from '../data/emotionMap';

export const detectEmotionId = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  for (const [emotionId, data] of Object.entries(EMOTION_MAP)) {
    if (data.keywords.some(keyword => lowerText.includes(keyword))) {
      return emotionId;
    }
  }
  return null;
};
