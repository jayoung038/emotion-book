import { useEffect, useState, useRef } from 'react';
import EmotionSpeechBubble from './EmotionSpeechBubble';
import type { EmotionRecord } from '../types/emotion';
import Lottie from 'lottie-react';
import sadAnimation from '../assets/sad.json';

const LOTTIE_ANIMATIONS: Record<string, any> = {
  sad: sadAnimation,
};

interface Props {
  emotion: EmotionRecord;
  position: { x: number; y: number };
  isSelf: boolean;
}
const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

const EmotionCreature = ({ emotion, position, isSelf }: Props) => {
  const [showBubble, setShowBubble] = useState(false);

  // 위치 상태로 변경
  const [pos, setPos] = useState(position);
const ref = useRef<HTMLDivElement>(null);

  // 방향키 입력 이벤트
useEffect(() => {
  if (!isSelf) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    const CHARACTER_WIDTH = 96;
const CHARACTER_HEIGHT = 96;



    setPos((prev) => {
          const step = 20;
const maxX = window.innerWidth - CHARACTER_WIDTH;// 우측 여유공간
const maxY = window.innerWidth - CHARACTER_HEIGHT;
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          return { ...prev, y: clamp(prev.y - step, 0, maxY) };
        case 'arrowdown':
        case 's':
          return { ...prev, y: clamp(prev.y + step, 0, maxY) };
        case 'arrowleft':
        case 'a':
          return { ...prev, x: clamp(prev.x - step, 0, maxX) };
        case 'arrowright':
        case 'd':
          return { ...prev, x: clamp(prev.x + step, 0, maxX) };
        default:
          return prev;
      }
    });
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isSelf]);


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
          animationData={LOTTIE_ANIMATIONS[emotion.emotion_type] || sadAnimation}
          loop
          autoplay
          className="w-full h-full"
        />
      </div>

      {showBubble && <EmotionSpeechBubble emotion={emotion} />}
    </div>
  );
};

export default EmotionCreature;
