import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import EmotionCreature from '../components/EmotionCreature';
import { getEmotionPosition } from '../utils/getEmotionPosition';
import type { EmotionRecord, EmotionType } from '../types/emotion';
import { onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import { getAuth } from 'firebase/auth';
import MiniMapChart from '../components/MiniMapChart';

// ⭐ 추가: 실시간 접속자(presence) 관리용
import {
  joinForestRoom,
  leaveForestRoom,
  subscribeForestPlayers,
  PlayerData,
} from '../api/forestPresence';

const ROOM_ID = 'forest';

const EmotionForest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emotion = location.state?.emotion as EmotionRecord;

// ⭐ 1. 숲 배경의 ref와 크기(bounds) state 추가
  const forestRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  // ⭐ 2. 숲 배경의 크기를 측정하는 effect 추가
  // (useEffect 대신 useLayoutEffect를 사용하면 렌더링 직전에 크기를 알아내어 깜박임이 없습니다)
  useLayoutEffect(() => {
    const updateBounds = () => {
      if (forestRef.current) {
        setBounds({
          width: forestRef.current.clientWidth,
          height: forestRef.current.clientHeight,
        });
      }
    };

    updateBounds(); // 최초 1회 실행
    window.addEventListener('resize', updateBounds); // 창 크기 변경 시에도 대응
    return () => window.removeEventListener('resize', updateBounds);
  }, []); // 빈 배열로 마운트 시 1회만 실행

  // 내 감정 위치
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // 오늘 활성화된 감정들(네가 기존에 otherEmotions로 쓰던 애들)
  const [otherEmotions, setOtherEmotions] = useState<EmotionRecord[]>([]);

  // 내가 공감한 감정 모달 관련
  const [likedEmotions, setLikedEmotions] = useState<EmotionRecord[]>([]);
  const [showLikedModal, setShowLikedModal] = useState(false);

  // 미니맵 통계
  const [emotionStats, setEmotionStats] = useState<{ name: string; value: number }[]>([]);

  // ⭐ 추가: 현재 숲에 접속중인 플레이어들 (실시간 presence)
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // ---------------------------------------
  // (1) 내가 좋아요한 감정 불러오기
  // ---------------------------------------
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

  // ---------------------------------------
  // (2) 미니맵 통계 계산 (기존 로직 유지)
  // ---------------------------------------
  useEffect(() => {
    const counts: Record<string, number> = {};
    otherEmotions.forEach((em) => {
      const key = em.emotion_type;
      counts[key] = (counts[key] || 0) + 1;
    });
    const statsArray = Object.entries(counts).map(([name, value]) => ({ name, value }));
    setEmotionStats(statsArray);
  }, [otherEmotions]);

  // ---------------------------------------
  // (3) 디버그용: 현재 uid 콘솔 출력 (기존 유지)
  // ---------------------------------------
  useEffect(() => {
    const auth = getAuth();
    console.log('현재 UID:', auth.currentUser?.uid);
  }, []);

  // ---------------------------------------
  // (4) 감정 없이 직접 진입 차단 (기존 유지)
  // ---------------------------------------
  useEffect(() => {
    if (!location.state?.emotion) {
      alert('감정 숲에는 감정을 선택한 후에만 입장할 수 있어요.');
      navigate('/record');
    }
  }, [location.state, navigate]);

  // ---------------------------------------
  // (5) 본인 감정 위치 계산 (기존 유지)
  // ---------------------------------------
  useEffect(() => {
    if (emotion) {
      const pos = getEmotionPosition(emotion.emotion_type as EmotionType);
      setPosition(pos);
    }
  }, [emotion]);

  // ---------------------------------------
  // (6) "오늘 활성화된 감정"을 실시간 구독 (기존 로직)
  //     -> 이건 지금까지 otherEmotions를 채우던 부분
  // ---------------------------------------
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

        // 나 자신의 감정을 otherEmotions에서 빼는 필터
        const filtered = emotions.filter(
          (e) => !(e.user_id === uid && e.id === emotion.id)
        );

        setOtherEmotions(filtered);
      });

      return unsubscribe;
    };

    const unsubscribePromise = fetchRealTimeOtherEmotions();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [emotion?.id]);

  // ---------------------------------------
  // (7) ⭐ 새로운 부분: 실시간 Presence 처리
  //
  // 1) 익명 uid 얻는다
  // 2) joinForestRoom()으로 나(내 캐릭터)를 rooms/{roomId}/players/{myUid}에 등록
  // 3) subscribeForestPlayers()로 전체 players를 실시간 구독(setPlayers)
  // 4) 컴포넌트 unmount 시 / 탭 닫을 때 leaveForestRoom()
  // ---------------------------------------
  useEffect(() => {
    let mounted = true;
    let cleanupLeave: (() => void) | null = null;

    (async () => {
      // 내 uid 확보
      const uid = await getCurrentUserId();
      if (!mounted) return;
      setMyUserId(uid);

      // 방에 나 등록
      // avatar / x / y 는 네 실제 캐릭터 정보에 맞춰서 바꿔도 돼
      // 여기서는 내 현재 감정 기반 좌표(position)로 반영해주면 "내가 여기 있다" 느낌이 더 진해짐
      const initX = position?.x ?? 200;
      const initY = position?.y ?? 150;

      await joinForestRoom(ROOM_ID, uid, {
        avatar: emotion?.character_name || 'fox',
        x: initX,
        y: initY,
      });

      // 모든 플레이어 구독
      const unsubPlayers = subscribeForestPlayers(ROOM_ID, (list) => {
        setPlayers(list);
      });

      // 나갈 때 호출할 함수 미리 준비
      cleanupLeave = () => {
        leaveForestRoom(ROOM_ID, uid);
        unsubPlayers();
      };

      // 탭 닫히는 순간(브라우저 종료 등)에도 최대한 정리 시도
      const handleBeforeUnload = () => {
        leaveForestRoom(ROOM_ID, uid);
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // effect cleanup에서 이벤트 제거 + 퇴장
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    })();

    return () => {
      mounted = false;
      if (cleanupLeave) {
        cleanupLeave();
      }
    };
    // position, emotion 등은 초기 최초 진입 기준으로만 넣고 싶으니까 dependency는 비우는게 좋아
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ---------------------------------------
  //  (8) 로딩 가드
  // ---------------------------------------
  if (!emotion || !position) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-gray-400 text-sm">
        감정 숲을 불러오는 중입니다...
      </div>
    );
  }

  // ---------------------------------------
  //  (9) 렌더링
  // ---------------------------------------
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 배경 */}
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

<div
        // ⭐ 3. 숲 컨테이너에 ref 추가
        ref={forestRef}
        className="relative bg-[url('/forest-bg.png')] bg-cover h-full w-full"
        style={{ transformOrigin: 'top left' }}
      >


        {/* 💖 내가 공감한 감정 버튼 */}
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

        {/* 내 캐릭터 */}
        <EmotionCreature emotion={emotion} position={position} isSelf={true} bounds={bounds} />

        {/* 오늘의 다른 사람 감정(기존 기능) */}
        {otherEmotions.map((em) => {
          const pos = getEmotionPosition(em.emotion_type as EmotionType);
          return (
            <EmotionCreature
              key={em.id}
              emotion={em}
              position={pos}
              isSelf={false}
              bounds={bounds}
            />
          );
        })}

        {/* ⭐ 5. (수정됨) 실시간 현재 접속 중인 사용자들 */}
        {players
          .filter((p) => p.userId !== myUserId) // 내 캐릭터는 이미 위에서 그렸으므로 제외
          .map((p) => {
            // PlayerData에 emotion 객체가 없다면 렌더링 불가
            if (!p.emotion) return null;

            return (
              <EmotionCreature
                key={p.userId}
                emotion={p.emotion}
                position={{ x: p.x, y: p.y }} // 실시간 위치(x, y) 사용
                isSelf={false}
                bounds={bounds} // ⭐ 4. bounds prop 전달
              />
            );
          })}

        {/* ⭐ 실시간 현재 접속 중인 사용자들 시각화 (option)
            players 배열에는 나도 포함돼.
            만약 이미 EmotionCreature로 비슷하게 그리고 있다면
            이 블록은 UI 데모용으로만 잠깐 써도 돼.
        */}

        {/*players.map((p) => (
          <div
            key={p.userId}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '6px',
              padding: '2px 4px',
              border: '1px solid #333',
            }}
          >
            {p.avatar ?? '???'}
          </div>
        ))*/}

        <MiniMapChart data={emotionStats} />
      </div>

      {/* 공감 모달 */}
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
                  <li
                    key={em.id}
                    className="border p-2 rounded text-sm text-gray-700"
                  >
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
