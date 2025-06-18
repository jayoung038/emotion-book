import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="w-full px-4 py-2 bg-white flex justify-between items-center border-b shadow-sm">
      <Link to="/" className="font-handwriting text-xl font-bold text-purple-600 hover:underline">
        🏠 Home
      </Link>
      <div className="flex gap-4">
        <Link to="/book" className="text-blue-600 hover:underline">📖 도감</Link>
        <Link to="/forest" className="text-green-600 hover:underline">🌳 감정 숲</Link>
      </div>
    </nav>
  );
};

export default NavBar;
