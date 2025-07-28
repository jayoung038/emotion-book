import React, { useState } from 'react';
import Lottie from 'lottie-react';
import { EMOTION_MAP } from '../data/emotionMap';
import { analyzeEmotion } from '../api/huggingFace';
import { getCurrentUserId } from '../api/auth';
import { saveEmotion } from '../api/emotion';
import { mapLabelToEmotionId } from '../utils/mapLabelToEmotionId';
import loadingAnimation from '../assets/loading.json';


const EmotionInput = () => {
  const [text, setText] = useState('');
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
 
  const handleAnalyze = async () => {
    setIsLoading(true); 
    const huggingLabel = await analyzeEmotion(text); // ex: "remorse"
    if (!huggingLabel) {
      console.warn('감정 분석 실패');
      setAnimationData(null);
      return;
    }

    const mappedEmotionId = mapLabelToEmotionId(huggingLabel);

    if (!mappedEmotionId || !(mappedEmotionId in EMOTION_MAP)) {
      console.warn('매핑된 감정 없음');
      setAnimationData(null);
      return;
    }

    const emotionKey = mappedEmotionId as keyof typeof EMOTION_MAP;
    const { character_name, lottie_path } = EMOTION_MAP[emotionKey];
    setCharacterName(character_name);
    try {
      const res = await fetch(lottie_path);
      const json = await res.json();
      console.log("🎬 애니메이션 데이터:", json);
      console.log("🎯 레이어 개수:", json?.layers?.length);
      
      setAnimationData(json);
    } catch (err) {
      console.error('애니메이션 로드 실패:', err);
      setAnimationData(null);
    }


    const user_id = await getCurrentUserId();

    await saveEmotion({
      user_id,
      emotion_type: mappedEmotionId,
      reason: text,
      character_name,
      lottie_path,
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6">
      <div className="text-center w-full">
        <h1 className="text-3xl mb-6 font-handwriting">how are you today?</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px] w-full">
            <Lottie animationData={loadingAnimation} loop autoplay className="h-[300px]" />
          </div>
        ) : (
        animationData && characterName &&  (
          <div>
            <div className="flex justify-center items-center w-full mt-4">
              <Lottie animationData={animationData} loop className="h-[500px] w-auto" />
            </div>
            <p className="text-lg font-medium mb-4">
            {characterName}
            </p>
          </div>
        )
        )}
      </div>

      <div className="flex justify-center items-center mt-6 w-full">
        <div className="relative w-full max-w-3xl">
        <textarea
          placeholder="예: 친구가 나를 무시했어"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter'&& !e.shiftKey) {
              e.preventDefault();
              handleAnalyze();
            }
          }}
          rows={2}
          className="w-full border p-3 pr-14 rounded-2xl resize-none overflow-y-auto focus:outline-none shadow-sm"
          style={{ maxHeight: '160px' }}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
      {isLoading && loadingAnimation ? (
          <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          className="w-15 h-15"
        />
      ) : (
        <button onClick={handleAnalyze} className="text-blue-500 hover:text-blue-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionInput;
