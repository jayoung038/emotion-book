import { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import type { EmotionRecord } from '../types/emotion';

const LikedEmotions = () => {
  const [likedEmotions, setLikedEmotions] = useState<EmotionRecord[]>([]);

  useEffect(() => {
    const fetchLikedEmotions = async () => {
      const ids = JSON.parse(localStorage.getItem('likedEmotions') || '[]');
      const results: EmotionRecord[] = [];

      for (const id of ids) {
        const ref = doc(db, 'emotions', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          results.push({ id: snap.id, ...snap.data() } as EmotionRecord);
        }
      }

      setLikedEmotions(results);
    };

    fetchLikedEmotions();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">💖 내가 공감한 감정들</h2>
      {likedEmotions.length === 0 ? (
        <p className="text-gray-500">아직 공감한 감정이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {likedEmotions.map((e) => (
            <li key={e.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <p className="font-semibold mb-1 text-pink-600">{e.emotion_type}</p>
              <p className="text-sm text-gray-700 italic">“{e.reason}”</p>
              <p className="text-xs text-gray-400 mt-2">👍 공감 {e.likes ?? 0}개</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LikedEmotions;
