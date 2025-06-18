import { Link } from 'react-router-dom';
import startAnimation from '../assets/start.json';
import Lottie from 'lottie-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      <h1 
      className="text-5xl mb-8 font-handwriting">How are you feeling today?</h1>
      <Link
        to="/record"
      >
        <Lottie 
        animationData={startAnimation} 
        loop autoplay
        className='h-24 w-48' />
      </Link>
    </div>
  );
};

export default Home;
