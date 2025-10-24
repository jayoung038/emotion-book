import { useEffect, useState, useRef } from 'react';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getCurrentUserId } from '../api/auth';
import { db } from '../firebase/firebaseConfig';


import EmotionSpeechBubble from './EmotionSpeechBubble';
import type { EmotionRecord } from '../types/emotion';
import Lottie from 'lottie-react';

import admirationAnimation from '../assets/admiration.json';
import angryAnimation from '../assets/angry.json';
import amusementAnimation from '../assets/amusement.json';
import annoyanceAnimation from '../assets/annoyance.json';
import approvalAnimation from '../assets/approval.json';
import caringAnimation from '../assets/caring.json';
import confusedAnimation from '../assets/confused.json';
import curiosityAnimation from '../assets/curiosity.json';
import desireAnimation from '../assets/desire.json';
import disappointmentAnimation from '../assets/disappointment.json';
import disapprovalAnimation from '../assets/disapproval.json';
import disgustAnimation from '../assets/disgust.json';
import embarrassedAnimation from '../assets/embarrassed.json';
import excitedAnimation from '../assets/excited.json';
import fearAnimation from '../assets/fear.json';
import gratefulAnimation from '../assets/grateful.json';
import griefAnimation from '../assets/grief.json';
import happyAnimation from '../assets/happy.json';
import loveAnimation from '../assets/love.json';
import anxiousAnimation from '../assets/anxious.json';
import hopefulAnimation from '../assets/hopeful.json';
import prideAnimation from '../assets/pride.json';
import realizationAnimation from '../assets/realization.json';
import reliefAnimation from '../assets/relief.json';
import remorseAnimation from '../assets/remorse.json';
import sadAnimation from '../assets/sad.json';
import surprisedAnimation from '../assets/surprised.json';
import calmAnimation from '../assets/calm.json';

const LOTTIE_ANIMATIONS: Record<string, any> = {
  admiration: admirationAnimation,//감탄
  amusement: amusementAnimation,//즐거움
  angry: angryAnimation,
  annoyance: annoyanceAnimation,//성가심
  approval: approvalAnimation,
  caring: caringAnimation,
  confused: confusedAnimation,
  curiosity: curiosityAnimation,//호기심
  desire: desireAnimation,
  disappointment: disappointmentAnimation,
  disapproval: disapprovalAnimation,
  disgust: disgustAnimation,
  embarrassed: embarrassedAnimation,
  excited: excitedAnimation,
  fear: fearAnimation,
  grateful: gratefulAnimation,
  grief: griefAnimation,//큰슬픔
  happy: happyAnimation,
  love: loveAnimation,
  anxious: anxiousAnimation,
  hopeful: hopefulAnimation,
  pride: prideAnimation,
  realization: realizationAnimation,//인식
  relief: reliefAnimation,//안도
  remorse: remorseAnimation,//후회
  sad: sadAnimation,
  surprised: surprisedAnimation,
  calm: calmAnimation,
};

interface Props {
  emotion: EmotionRecord;
  position: { x: number; y: number };
  isSelf: boolean;
  bounds: { width: number; height: number }; // ⭐ 1. bounds prop 타입 추가
}
const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

const EmotionCreature = ({ emotion, position, isSelf, bounds }: Props) => {
  const [showBubble, setShowBubble] = useState(false);
  // 위치 상태로 변경
  const [pos, setPos] = useState(position);
  const ref = useRef<HTMLDivElement>(null);
  const [showLikePlusOne, setShowLikePlusOne] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const CHARACTER_WIDTH = 96;
  const CHARACTER_HEIGHT = 96;

  useEffect(() => {
    const checkLiked = async () => {
      const uid = await getCurrentUserId();
      const liked = Array.isArray(emotion.likes) && emotion.likes.includes(uid);
      setHasLiked(liked);
    };
    checkLiked();
  }, [emotion]);

// ⭐ 3. (추가) 위치 보정 Effect
  // position prop이나 bounds가 바뀔 때, 캐릭터가 숲 안에 있도록 위치를 보정합니다.
  useEffect(() => {
    // bounds가 유효할 때만 (0이 아닐 때) 위치 보정
    if (bounds.width > 0 && bounds.height > 0) {
      setPos({
        x: clamp(position.x, 0, bounds.width - CHARACTER_WIDTH),
        y: clamp(position.y, 0, bounds.height - CHARACTER_HEIGHT),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, bounds]); // position이나 bounds가 바뀌면 실행



  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      onClick={() => setShowBubble((prev) => !prev)}
    >
      <div className="w-24 h-24">
        <Lottie
          key={emotion.instanceId}
          animationData={LOTTIE_ANIMATIONS[emotion.emotion_type] || sadAnimation}
          loop
          autoplay
          className="w-full h-full"
        />
        {isSelf && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-yellow-500 font-semibold">
            나
          </span>
        )}

      </div>

      {showBubble && (
        <div className="flex flex-col items-center mt-1">
          <EmotionSpeechBubble emotion={emotion} isSelf={isSelf} />
        </div>
      )}
    </div>
  );
};

export default EmotionCreature;
