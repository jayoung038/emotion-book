import axios from 'axios';

// Hugging Face API 키
const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// 사용할 감정 분석 모델
const HUGGING_FACE_MODEL = 'bhadresh-savani/distilbert-base-uncased-emotion';

const HUGGING_FACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL}`;

const headers = {
  Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
};

const labelMap: Record<string, string> = {
  joy: 'happy',
  sadness: 'sad',
  anger: 'angry',
  fear: 'fear',
  love: 'love',
  surprise: 'surprised',
};

export const analyzeEmotion = async (text: string): Promise<string | null> => {
  try {
    const res = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: text },
      { headers }
    );

    const results = res.data[0]; // [{ label: 'joy', score: 0.98 }, ...]
    if (!Array.isArray(results)) return null;

    const top = results.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
    return labelMap[top.label] || null;
  } catch (err) {
    console.error('❌ Hugging Face 감정 분석 실패:', err);
    return null;
  }
};
