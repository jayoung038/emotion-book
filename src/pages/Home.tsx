import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { detectEmotionId } from '../utils/detectEmotion';
import { EMOTION_MAP } from '../data/emotionMap';
import { analyzeEmotion } from '../api/huggingFace';

const Home = () => {
  const [text, setText] = useState('');
  const [emotionId, setEmotionId] = useState<string | null>(null);
  const [animationData, setAnimationData] = useState(null);
  const handleAnalyze = async () => {
    const detected = await analyzeEmotion(text);
    setEmotionId(detected);

    if (detected && detected in EMOTION_MAP) {
      const res = await fetch(EMOTION_MAP[detected as keyof typeof EMOTION_MAP].lottie_path);
      const json = await res.json();
      setAnimationData(json);
    } else {
      setAnimationData(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold mb-6">오늘 어땠어?</h1>

        {emotionId && (
          <div className="mt-4">
            <p className="text-lg font-semibold">감정: {emotionId}</p>
            <p>캐릭터: {EMOTION_MAP[emotionId as keyof typeof EMOTION_MAP].character_name}</p>
            {animationData && (
              <div className="max-w-xs mx-auto mt-4">
                <Lottie animationData={animationData} loop />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ 항상 아래에 고정된 입력창 + 버튼 */}
      <div className="mt-6 flex justify-center items-center gap-2 flex-wrap w-full max-w-md">
        <input
          type="text"
          placeholder="예: 친구가 나를 무시했어"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 w-72 rounded"
        />
        <button
          onClick={handleAnalyze}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          감정 분석
        </button>
      </div>
    </div>
  );
};

export default Home;
