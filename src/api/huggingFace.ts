import axios from 'axios';

// Hugging Face API 키
const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const HUGGING_FACE_API_URL =
  'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
};

/**
 * 감정 분석: 여러 감정 중 상위 감정 하나 반환
 */
export const analyzeEmotion = async (text: string): Promise<string | null> => {
  try {
    const res = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: text },
      { headers }
    );

    const results = res.data;
    const resultArray = results[0]; // ✅ 고정된 배열 구조
    if (!Array.isArray(resultArray)) return null;

    const top = resultArray.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    console.log("🔥 감정 분석 결과 전체:", resultArray);
    console.log("🔥 top.label:", top.label);

    return top.label;
  } catch (err) {
    console.error('❌ 감정 분석 실패:', err);
    return null;
  }
};
