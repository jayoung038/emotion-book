import { Link, useLocation, useNavigate } from 'react-router-dom';
import { deactivateEmotion } from '../api/emotion';
const isInForest = location.pathname === '/forest';
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emotion = location.state?.emotion; // 감정 숲 입장 시 넘긴 state

  const confirmExit = async (destination: string) => {
    if (location.pathname === '/forest') {
      const ok = window.confirm('감정 숲을 나가시겠습니까?');
      if (!ok) return;

      if (emotion?.id) {
        await deactivateEmotion(emotion.id); // ✅ Firestore에서 active: false
      }
    }

    navigate(destination);
  };
  return (
    <nav className="w-full px-4 py-2 bg-white flex justify-between items-center border-b shadow-sm">

      <div className="flex gap-4 items-center">
        <button
          onClick={() => confirmExit('/')}
          className="font-handwriting text-xl font-bold text-purple-600 hover:underline"
        >
          🏠 Home
        </button>
        <button
          onClick={() => confirmExit('/book')}
          className="text-blue-600 hover:underline"
        >
          📘 도감
        </button>
      </div>
      <Link to="/forest-loader" className="text-green-600 hover:underline">🌳 감정 숲</Link>
    </nav>
  );
};

export default NavBar;
