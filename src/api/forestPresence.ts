import { db } from '../firebase/firebaseConfig';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import type { EmotionRecord } from '../types/emotion';
// ⭐ 이 함수를 파일 하단(export 전)에 새로 추가하세요.
/**
 * 플레이어의 실시간 위치(x, y)를 Firestore에 업데이트합니다.
 */
export const updatePlayerPosition = async (
  roomId: string,
  userId: string,
  newPosition: { x: number; y: number }
) => {
  // rooms/{roomId}/players/{userId} 문서의 참조를 가져옵니다.
  const playerRef = doc(db, 'rooms', roomId, 'players', userId);
  try {
    // 'x'와 'y' 필드만 업데이트합니다.
    await updateDoc(playerRef, {
      x: newPosition.x,
      y: newPosition.y,
    });
  } catch (error) {
    console.error('Error updating player position:', error);
  }
};
/** 캐릭터(플레이어) 타입 */
export type PlayerData = {
  userId: string;
  avatar: string;
  x: number;
  y: number;
  joinedAt?: any;
  emotion?: EmotionRecord;
};

/**
 * 숲 방에 입장 (내 캐릭터 등록)
 */
export async function joinForestRoom(
  roomId: string,
  userId: string,
  initialData: Omit<PlayerData, 'userId' | 'joinedAt'>
) {
  const ref = doc(db, 'rooms', roomId, 'players', userId);
  await setDoc(
    ref,
    {
      userId,
      ...initialData,
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * 숲 방에서 퇴장 (내 캐릭터 삭제)
 */
export async function leaveForestRoom(roomId: string, userId: string) {
  const ref = doc(db, 'rooms', roomId, 'players', userId);
  await deleteDoc(ref);
}

/**
 * 숲에 참여 중인 모든 플레이어를 실시간 구독
 */
export function subscribeForestPlayers(
  roomId: string,
  callback: (players: PlayerData[]) => void
) {
  const colRef = collection(db, 'rooms', roomId, 'players');
  const unsub = onSnapshot(colRef, (snapshot) => {
    const result: PlayerData[] = [];
    snapshot.forEach((docSnap) => {
      result.push(docSnap.data() as PlayerData);
    });
    callback(result);
  });
  return unsub; // 언마운트 시 unsubscribe() 호출
}
