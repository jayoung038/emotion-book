import { db } from '../firebase/firebaseConfig';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from 'firebase/firestore';

/** 캐릭터(플레이어) 타입 */
export type PlayerData = {
  userId: string;
  avatar: string;
  x: number;
  y: number;
  joinedAt?: any;
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
