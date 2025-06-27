import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import type { EmotionRecord } from '../types/emotion';


const EmotionForestLoader = () => {
  const [todayEmotions, setTodayEmotions] = useState<EmotionRecord[]>([]);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const navigate = useNavigate();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  useEffect(() => {
    const fetchTodayEmotions = async () => {
      const uid = await getCurrentUserId();

      const q = query(
        collection(db, 'emotions'),
        where('user_id', '==', uid),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);

      const emotions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data()} as EmotionRecord))
        .filter((e) => {
          const d = new Date(e.created_at.seconds * 1000);
          return d >= todayStart && d <= todayEnd;
        });

      if (emotions.length === 0) {
        alert('오늘 감정을 아직 기록하지 않았어요.');
        navigate('/record');
        return;
      }

      if (emotions.length === 1) {
        navigate('/forest', { state: { emotion: emotions[0] } });
        return;
      }

      setTodayEmotions(emotions); // 여러 개면 모달 띄우기
      setShowSelectModal(true);
    };

    fetchTodayEmotions();
  }, [navigate]);

  const handleSelectEmotion = (e: EmotionRecord) => {
    navigate('/forest', { state: { emotion: e } });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {showSelectModal && (
        <div className="bg-white p-6 rounded shadow text-center max-w-md">
          <p className="mb-4">오늘의 감정 중 하나를 선택하세요.</p>
          <div className="grid grid-cols-1 gap-2">
            {todayEmotions.map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelectEmotion(e)}
                className="border rounded px-4 py-2 hover:bg-gray-100 text-sm"
              >
                {e.emotion_type} — “{e.reason}”
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionForestLoader;
