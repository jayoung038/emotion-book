import { useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import type { EmotionRecord } from '../types/emotion';

const EmotionSpeechBubble = ({ emotion, isSelf, }: { emotion: EmotionRecord; isSelf: boolean; }) => {
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const checkLiked = async () => {
      const uid = await getCurrentUserId();
      const liked = Array.isArray(emotion.likes) && emotion.likes.includes(uid);
      setHasLiked(liked);
    };
    checkLiked();
  }, [emotion]);

  const handleLike = async () => {
    const uid = await getCurrentUserId();
    if (hasLiked) return;

    await updateDoc(doc(db, 'emotions', emotion.id), {
      likes: arrayUnion(uid),
    });
    setHasLiked(true);
  };

  const handleUnlike = async () => {
    const uid = await getCurrentUserId();
    if (!hasLiked) return;

    await updateDoc(doc(db, 'emotions', emotion.id), {
      likes: arrayRemove(uid),
    });
    setHasLiked(false);
  };

  return (
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white border rounded-xl shadow px-3 py-2 max-w-xs z-10">
      <p className="text-sm font-handwriting text-gray-700 text-center">“{emotion.reason}”</p>
      {!isSelf && (
        <div className="flex justify-center items-center mt-2 text-xs text-pink-400">
          <button
            onClick={hasLiked ? handleUnlike : handleLike}
            className="flex items-center gap-1 hover:underline disabled:cursor-not-allowed"
          >
            {hasLiked ? '💖' : '🤍'} {emotion.likes?.length ?? 0}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmotionSpeechBubble;
