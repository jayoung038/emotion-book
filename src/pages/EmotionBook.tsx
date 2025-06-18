import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUserId } from '../api/auth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import sadAnimation from '../assets/sad.json';
import calendarAnimation from '../assets/calendar.json';
import chartAnimation from '../assets/chart.json';
import rightArrowAnimation from '../assets/right-arrow.json';
import '../styles/book.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LOTTIE_ANIMATIONS: Record<string, any> = {
  sad: sadAnimation,
};

interface EmotionRecord {
  id: string;
  emotion_type: string;
  character_name: string;
  reason: string;
  lottie_path: string;
  created_at: any;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: '#ffd93d',   // 노랑
  sad: '#79b8f3',     // 파랑
  angry: '#ff6b6b',   // 빨강
  fear: '#9b59b6',    // 보라
  surprise: '#feca57',// 오렌지
  disgust: '#6ab04c', // 녹색
  neutral: '#95a5a6', // 회색 등등 내가 알아서 지정해주면 됨
};

const EmotionBook = () => {
  const [allEmotions, setAllEmotions] = useState<EmotionRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const currentEmotion = allEmotions[currentPage] || null;

const emotionStats = Object.entries(
  allEmotions.reduce((acc, cur) => {
    acc[cur.emotion_type] = (acc[cur.emotion_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([key, value]) => ({ name: key, value }));


  useEffect(() => {
    const fetchEmotions = async () => {
      const uid = await getCurrentUserId();
      const q = query(
        collection(db, 'emotions'),
        where('user_id', '==', uid),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as EmotionRecord[];
      setAllEmotions(list);
    };
    fetchEmotions();
  }, []);

  // 날짜 선택 시, 해당 날짜 중 가장 최신 감정으로 이동
  useEffect(() => {
    if (selectedDate) {
      const filtered = allEmotions.filter((e) => {
        const date = new Date(e.created_at.seconds * 1000);
        return (
          date.getFullYear() === selectedDate.getFullYear() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getDate() === selectedDate.getDate()
        );
      });

      if (filtered.length > 0) {
        const latest = filtered.sort((a, b) => b.created_at.seconds - a.created_at.seconds)[0];
        const index = allEmotions.findIndex((e) => e.id === latest.id);
        if (index !== -1) {
          setCurrentPage(index);
        }
      }
    }
  }, [selectedDate, allEmotions]);

// 날짜와 시간 포맷
const formattedDateTime = currentEmotion
  ? new Date(currentEmotion.created_at.seconds * 1000)
  : null;

const formattedDate = formattedDateTime?.toLocaleDateString('ko-KR');
const formattedTime = formattedDateTime?.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});


  const renderEmotionCard = (emotion: EmotionRecord | null) => {
    if (!emotion) return <p className="text-gray-400">감정을 채워줘!</p>;
    return (
      <motion.div
        key={emotion.id}
        ref={cardRef}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4 }}
        className="emotion-card"
      >
        <Lottie
          animationData={LOTTIE_ANIMATIONS[emotion.emotion_type]}
          className="h-42"
          loop
          autoplay
        />
        <p className="italic text-sm mt-2 px-2">“{emotion.reason}”</p>
      </motion.div>
    );
  };
const toggleChart = () => {
  // 캘린더 열려있으면 차트 전환 금지
  if (showCalendar) return;

  setShowChart((prev) => !prev);
};

const toggleCalendar = () => {
  // 차트 열려있으면 캘린더 전환 금지
  if (showChart) return;

  setShowCalendar((prev) => !prev);
};


const getWeekRange = (today: Date) => {
  const start = new Date(today);
  const day = today.getDay(); // 0 (일) ~ 6 (토)
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
const today = new Date();
const { start, end } = getWeekRange(today);

const weeklyEmotions = allEmotions.filter((e) => {
  const d = new Date(e.created_at.seconds * 1000);
  return d >= start && d <= end;
});

const weeklyStats = weeklyEmotions.reduce((acc, cur) => {
  acc[cur.emotion_type] = (acc[cur.emotion_type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const mostFrequentEmotion = Object.entries(weeklyStats).sort((a, b) => b[1] - a[1])[0]?.[0];

const cardRef = useRef(null);

const downloadCard = async () => {
  if (cardRef.current) {
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null, // 투명 배경 유지
      scale: 2, // 고화질
    });
    const link = document.createElement('a');
    link.download = `emotion-${currentPage + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
};



  return (
    <div className="book-container mx-auto my-8">
      <div className="book shadow-xl">
        <div className="book-cover" />
        {/* 왼쪽 페이지 */}
        <div className="page left relative">
          {/* 차트 / 캘린더 버튼 */}
          <div className="absolute top-4 left-4 flex items-center gap-2 h-12">
            <button onClick={toggleChart} className="w-12 h-12 flex items-center justify-center">
              <Lottie animationData={chartAnimation} loop autoplay />
            </button>
            <button onClick={toggleCalendar} className="w-7 h-7 flex items-center justify-center">
              <Lottie animationData={calendarAnimation} loop autoplay />
            </button>
          </div>

          {/* 차트 */}
          {showChart && (
            <div className="w-full flex flex-col items-center justify-center mt-6">
              <div className="w-full px-4 max-w-[320px]">
              <ResponsiveContainer width="100%" height={380}>
                <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={emotionStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {emotionStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMOTION_COLORS[entry.name] || '#ccc'}  //기본값은 회색
                      />
                    ))}

                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fffaf4',
                      borderRadius: '12px',
                      fontFamily: 'BMJUA',
                      fontSize: '14px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: '#333' }}
                  />
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontFamily: 'BMJUA',
                      fontSize: '0.9rem',
                      marginTop: '4px',
                      textAlign: 'center',
                    }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
              {mostFrequentEmotion && (
                <div className="text-center">
                  <p className="text-sm font-handwriting text-gray-700 leading-snug">
                    The most frequent feeling this week was{' '}
                    <span style={{ color: EMOTION_COLORS[mostFrequentEmotion] }}>
                      ● {mostFrequentEmotion}
                    </span>
                    !
                  </p>
                </div>
              )}
              </div>
            </div>
          )}
          

          {/* 캘린더 */}
          {showCalendar && (
            <div className="mt-20 px-4">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                locale="en-US"
                tileContent={({ date, view }) =>
                  view === 'month' &&
                  allEmotions.some((e) => {
                    const d = new Date(e.created_at.seconds * 1000);
                    return (
                      d.getFullYear() === date.getFullYear() &&
                      d.getMonth() === date.getMonth() &&
                      d.getDate() === date.getDate()
                    );
                  }) ? (
                    <div className="mt-1 w-[4px] h-[4px] mx-auto rounded-full bg-pink-400" />
                  ) : null
                }
              />

            </div>
          )}

          {/* 쪽수 버튼 */}
          <div className="absolute bottom-5 left-7 text-xs">
            <button
              className="px-2 py-1 rounded shadow"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, allEmotions.length - 1))}
              disabled={currentPage >= allEmotions.length - 1}
            >
              {allEmotions.length - currentPage}
            </button>
          </div>
        </div>

        {/* 오른쪽 페이지 */}
        <div className="page right relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg ml-4 mt-4 font-handwriting">
              {formattedDate} {formattedTime}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {renderEmotionCard(currentEmotion)}
          </AnimatePresence>
          
          <button
            onClick={downloadCard}
            className="absolute top-4 right-4 text-xs bg-pink-200 text-white px-2 py-1 rounded shadow hover:bg-pink-300"
          >
            Save Card
          </button>

          <div className="absolute bottom-1 right-4 text-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage <= 0}
            >
              <Lottie animationData={rightArrowAnimation} loop autoplay className='h-10 w-10'/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionBook;
