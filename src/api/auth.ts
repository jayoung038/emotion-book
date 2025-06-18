import { auth } from '../firebase/firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const getCurrentUserId = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        const result = await signInAnonymously(auth);
        resolve(result.user.uid);
      }
    });
  });
};
