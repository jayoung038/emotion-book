import { useLottie } from 'lottie-react';
import { useEffect } from 'react';

interface HabitatLottieProps {
  animationData: any;
  className?: string;
  autoPlayOnce?: boolean;
}

const HabitatLottie = ({ animationData, className, autoPlayOnce = false }: HabitatLottieProps) => {
  const { View, animationItem } = useLottie({
    animationData,
    loop: false,
    autoplay: false,
  });

  // Lottie 로드 후 첫 프레임 수동 표시
useEffect(() => {
    if (animationItem) {
      if (autoPlayOnce) {
        animationItem.goToAndPlay(0, true); // 자동 재생
      } else {
        animationItem.goToAndStop(0, true); // 정지된 초기 프레임
      }
    }
  }, [animationItem, autoPlayOnce]);

  const handleClick = () => {
    if (!animationItem) return;
    console.log('애니메이션 재생됨');
    animationItem.goToAndStop(0, true); // 항상 처음으로 이동 후
    animationItem.play();               // 재생
  };

  return (
    <div
      onClick={handleClick}
      className={`absolute cursor-pointer ${className}`}
      style={{
        width: 300,
        height: 300,
        zIndex: 10,
        opacity: 1,
      }}
    >
      <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
        {View}
      </div>
    </div>
  );
};

export default HabitatLottie;
