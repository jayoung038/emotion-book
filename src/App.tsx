import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmotionInput from './pages/EmotionInput'; // 감정 분석
import EmotionBook from './pages/EmotionBook';
import EmotionForest from './pages/EmotionForest';
import NavBar from './components/NavBar';
import LikedEmotions from './pages/LikedEmotion';
import EmotionForestLoader from './components/EmotionForestLoader';
import { getAuth, signInAnonymously } from 'firebase/auth';

function App() {
    useEffect(() => {
    const auth = getAuth();

    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then(() => {
          console.log('익명 로그인 성공!');
          console.log('UID:', auth.currentUser?.uid);
        })
        .catch((err) => {
          console.error('로그인 실패:', err);
        });
    } else {
      console.log('이미 로그인됨 → UID:', auth.currentUser?.uid);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record" element={<EmotionInput />} />
            <Route path="/book" element={<EmotionBook />} />
            <Route path="/forest" element={<EmotionForest />} />
            <Route path="/forest-loader" element={<EmotionForestLoader />} />
            <Route path="/liked" element={<LikedEmotions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
