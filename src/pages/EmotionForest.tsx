import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmotionCreature from '../components/EmotionCreature';
import { getEmotionPosition } from '../utils/getEmotionPosition';
import type { EmotionRecord, EmotionType } from '../types/emotion';
import { onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import { getAuth } from 'firebase/auth';
import MiniMapChart from '../components/MiniMapChart';

const EmotionForest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emotion = location.state?.emotion as EmotionRecord;
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [otherEmotions, setOtherEmotions] = useState<EmotionRecord[]>([]);

  const [likedEmotions, setLikedEmotions] = useState<EmotionRecord[]>([]);
  const [showLikedModal, setShowLikedModal] = useState(false);

  const fetchLikedEmotions = async () => {
    const uid = await getCurrentUserId();
    const q = query(collection(db, 'emotions'), where('likes', 'array-contains', uid));
    const snapshot = await getDocs(q);
    const liked = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmotionRecord[];
    setLikedEmotions(liked);
  };
  const [emotionStats, setEmotionStats] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const counts: Record<string, number> = {};

    otherEmotions.forEach((em) => {
      const key = em.emotion_type;
      counts[key] = (counts[key] || 0) + 1;
    });

    const statsArray = Object.entries(counts).map(([name, value]) => ({ name, value }));
    setEmotionStats(statsArray);
  }, [otherEmotions]);


  useEffect(() => {
    const auth = getAuth();
    console.log('현재 UID:', auth.currentUser?.uid);
  }, []);
  // 감정 없이 직접 진입한 경우 차단
  useEffect(() => {
    if (!location.state?.emotion) {
      alert('감정 숲에는 감정을 선택한 후에만 입장할 수 있어요.');
      navigate('/record'); // Strict Mode라서 일단 개발중에는 무시해도 됨
    }
  }, [location.state, navigate]);

  // 본인 감정 위치 계산
  useEffect(() => {
    if (emotion) {
      const pos = getEmotionPosition(emotion.emotion_type as EmotionType);
      setPosition(pos);
    }
  }, [emotion]);

  // 다른 유저 감정 불러오기
useEffect(() => {
  const fetchRealTimeOtherEmotions = async () => {
    const uid = await getCurrentUserId();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'emotions'),
      where('created_at', '>=', todayStart),
      where('created_at', '<=', todayEnd),
      where('active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emotions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmotionRecord[];

      const filtered = emotions.filter(
        (e) => !(e.user_id === uid && e.id === emotion.id)
      );

      setOtherEmotions(filtered);
    });

    return unsubscribe;
  };

  const unsubscribePromise = fetchRealTimeOtherEmotions();

  return () => {
    // 비동기 함수 내의 unsubscribe 정리
    unsubscribePromise.then((unsubscribe) => {
      if (unsubscribe) unsubscribe();
    });
  };
}, []);

  // 로딩 중이면 안내
  if (!emotion || !position) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-gray-400 text-sm">
        감정 숲을 불러오는 중입니다...
      </div>
    );
  }

return (
  <div className="relative w-screen h-screen overflow-visible">
    {/* 배경 및 캐릭터 */}
    <div
  className="absolute inset-0 -z-10"
  style={{
    backgroundColor: '#a4d97e',
    backgroundImage: "src/background/background.jpg",
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat',
    opacity: 0.9,
  }}
></div>
    <div className="relative bg-[url('/forest-bg.png')] bg-cover h-full w-full" style={{ transformOrigin: 'top left' }}>
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={async () => {
            await fetchLikedEmotions();
            setShowLikedModal(true);
          }}
          className="bg-white px-4 py-2 rounded-full shadow text-blue-500 text-sm hover:underline"
        >
          💖 내가 공감한 감정 보기
        </button>
      </div>

      <EmotionCreature emotion={emotion} position={position} isSelf={true} />
      {otherEmotions.map((em) => {
        const pos = getEmotionPosition(em.emotion_type as EmotionType);
        return (
          <EmotionCreature key={em.id} emotion={em} position={pos} isSelf={false} />
        );
      })}
      <MiniMapChart data={emotionStats} />
    </div>

    {/* ✅ 모달은 가장 마지막에, 배경 div 밖에서 렌더링 */}
    {showLikedModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto relative">
          <button
            onClick={() => setShowLikedModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4">💖 내가 공감한 감정들</h2>
          {likedEmotions.length === 0 ? (
            <p className="text-sm text-gray-500">공감한 감정이 없어요.</p>
          ) : (
            <ul className="space-y-3">
              {likedEmotions.map((em) => (
                <li key={em.id} className="border p-2 rounded text-sm text-gray-700">
                  <span className="font-bold">[{em.emotion_type}]</span> – {em.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )}
    
  </div>
);

};

export default EmotionForest;
