export type EmotionType = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'neutral';

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
}
