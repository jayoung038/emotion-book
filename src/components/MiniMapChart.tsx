import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#FFB6C1', '#FFD700', '#87CEEB', '#90EE90',
  '#FFA07A', '#9370DB', '#00CED1', '#FA8072'
];

interface Props {
  data: { name: string; value: number }[];
}

const MiniMapChart = ({ data }: Props) => {
  return (
    <div className="fixed bottom-4 right-4 w-40 h-40 bg-white bg-opacity-80 rounded-lg shadow z-50 p-2">
    <h3 className="text-xs text-center mb-1 font-semibold">감정 분포</h3>
    <ResponsiveContainer width="100%" height="90%">
        <PieChart>
        <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={60}
            fill="#8884d8"
        >
            {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Tooltip />
        </PieChart>
    </ResponsiveContainer>
    </div>
  );
};

export default MiniMapChart;
