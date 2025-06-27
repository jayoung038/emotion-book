import { db } from '../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';



/**
 * 감정 저장
 */
export const saveEmotion = async ({
  user_id,
  emotion_type,
  reason,
  character_name,
  lottie_path,
}: {
  user_id: string;
  emotion_type: string;
  reason: string;
  character_name: string;
  lottie_path: string;
}) => {
  try {
    await addDoc(collection(db, 'emotions'), {
      user_id,
      emotion_type,
      reason,
      character_name,
      lottie_path,
      created_at: serverTimestamp(),
      active: true,
    });
    console.log('감정 저장 성공');
  } catch (err) {
    console.error('감정 저장 실패:', err);
  }
};

/**
 * 감정 숲 퇴장 처리: active → false
 */
export const deactivateEmotion = async (emotionId: string) => {
  try {
    await updateDoc(doc(db, 'emotions', emotionId), {
      active: false,
    });
    console.log('감정 퇴장 처리 완료');
  } catch (err) {
    console.error('감정 퇴장 처리 실패:', err);
  }
};

/**
 * 내 감정 기록 불러오기 (최신순 정렬)
 */
export const getMyEmotions = async (user_id: string) => {
  try {
    const q = query(
      collection(db, 'emotions'),
      where('user_id', '==', user_id),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('감정 불러오기 실패:', err);
    return [];
  }
};
