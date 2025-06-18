import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmotionInput from './pages/EmotionInput'; // 감정 분석
import EmotionBook from './pages/EmotionBook';
import EmotionForest from './pages/EmotionForest';
import NavBar from './components/NavBar';

function App() {
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
