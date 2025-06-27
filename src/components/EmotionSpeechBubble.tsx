import { increment, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { EmotionRecord } from '../types/emotion';

const EmotionSpeechBubble = ({ emotion }: { emotion: EmotionRecord }) => {
  const handleLike = async () => {
  if (hasLiked(emotion.id)) return; // 중복 방지

  try {
    const ref = doc(db, 'emotions', emotion.id);
    await updateDoc(ref, {
      likes: increment(1),
    });

    // localStorage에 저장
    const liked = localStorage.getItem('likedEmotions');
    const list = liked ? JSON.parse(liked) : [];
    list.push(emotion.id);
    localStorage.setItem('likedEmotions', JSON.stringify(list));
  } catch (err) {
    console.error('공감 실패:', err);
  }
};


  const hasLiked = (emotionId: string): boolean => {
  const liked = localStorage.getItem('likedEmotions');
  if (!liked) return false;

  const list = JSON.parse(liked);
  return list.includes(emotionId);
};


  return (
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white border rounded-xl shadow px-3 py-2 max-w-xs z-10">
      <p className="text-sm font-handwriting text-gray-700">“{emotion.reason}”</p>
      <div className="flex justify-between items-center mt-2 text-xs">
        <button
            onClick={handleLike}
            disabled={hasLiked(emotion.id)}
            className={`text-pink-500 hover:underline ${
                hasLiked(emotion.id) ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            >
            🫶 {emotion.likes ?? 0}
        </button>
        {/* 🎁 선물 버튼은 다음 단계에서 추가 예정 */}
      </div>
    </div>
  );
};

export default EmotionSpeechBubble;
