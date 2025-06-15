import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const saveEmotion = async ({
  user_id,
  emotion_type,
  reason,
  character_name,
  lottie_path
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
    });
    console.log('✅ 감정 저장 성공');
  } catch (err) {
    console.error('❌ 감정 저장 실패:', err);
  }
};
