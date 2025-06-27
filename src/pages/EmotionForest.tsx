import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EmotionCreature from '../components/EmotionCreature';
import { getEmotionPosition } from '../utils/getEmotionPosition';
import type { EmotionRecord, EmotionType } from '../types/emotion';
import { onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import { getAuth } from 'firebase/auth';

const EmotionForest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emotion = location.state?.emotion as EmotionRecord;
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [otherEmotions, setOtherEmotions] = useState<EmotionRecord[]>([]);
useEffect(() => {
  const auth = getAuth();
  console.log('현재 UID:', auth.currentUser?.uid);
}, []);
  // 감정 없이 직접 진입한 경우 차단
  useEffect(() => {
    if (!location.state?.emotion) {
      alert('감정 숲에는 감정을 선택한 후에만 입장할 수 있어요.');
      navigate('/record'); // 또는 '/emotion-book' 등 다른 경로
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
    <div className="w-screen h-screen">
      <div
        className="relative bg-[url('/forest-bg.png')] bg-cover"
        style={{ transformOrigin: 'top left' }}
      >
        <div className="absolute top-6 right-6 z-50">
          <Link
            to="/liked"
            className="bg-white px-4 py-2 rounded-full shadow text-blue-500 text-sm hover:underline"
          >
            💖 내가 공감한 감정 보기
          </Link>
        </div>
        

        <EmotionCreature emotion={emotion} position={position} isSelf={true} />

        {otherEmotions.map((em) => {
          const pos = getEmotionPosition(em.emotion_type as EmotionType);
          return (
            <EmotionCreature
              key={em.id}
              emotion={em}
              position={pos}
              isSelf={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EmotionForest;
