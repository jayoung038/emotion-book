export const EMOTION_TYPES = [
  'admiration',
  'amusement',
  'anger',
  'annoyance',
  'approval',
  'caring',
  'confusion',
  'curiosity',
  'desire',
  'disappointment',
  'disapproval',
  'disgust',
  'embarrassment',
  'excitement',
  'fear',
  'gratitude',
  'grief',
  'joy',
  'love',
  'nervousness',
  'optimism',
  'pride',
  'realization',
  'relief',
  'remorse',
  'sadness',
  'surprise',
  'neutral'
] as const;

export type EmotionType = typeof EMOTION_TYPES[number];



export interface EmotionRecord {
  id: string;
  user_id: string;
  emotion_type: EmotionType;
  reason: string;
  created_at: any;
  likes?: string[];
  gifts?: any[];
  positionX?: number;
  positionY?: number;
  instanceId?: number;
  character_name?: string;
}
