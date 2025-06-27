// 기존 좌표 기준 위치 + 랜덤 보정
const BASE_POSITIONS: Record<string, { x: number; y: number }> = {
  happy: { x: 500, y: 300 },
  sad: { x: 800, y: 600 },
  angry: { x: 1200, y: 400 },
  fear: { x: 1000, y: 800 },
  surprise: { x: 600, y: 900 },
  neutral: { x: 1400, y: 500 },
};

const usedPositions: { x: number; y: number }[] = [];

export const getEmotionPosition = (emotionType: string): { x: number; y: number } => {
  const base = BASE_POSITIONS[emotionType] || { x: 1000, y: 500 };

  let tries = 0;
  while (tries < 10) {
    const offsetX = Math.floor(Math.random() * 150 - 75); // -75 ~ +75
    const offsetY = Math.floor(Math.random() * 150 - 75);
    const x = base.x + offsetX;
    const y = base.y + offsetY;

    const tooClose = usedPositions.some(
      (pos) => Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 80
    );

    if (!tooClose) {
      usedPositions.push({ x, y });
      return { x, y };
    }

    tries++;
  }

  // 실패 시 마지막 시도 좌표라도 반환
  const fallbackX = base.x + Math.floor(Math.random() * 100 - 50);
  const fallbackY = base.y + Math.floor(Math.random() * 100 - 50);
  usedPositions.push({ x: fallbackX, y: fallbackY });
  return { x: fallbackX, y: fallbackY };
};
