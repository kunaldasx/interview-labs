import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HiringTrendChartProps {
  data: { date: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 rounded-xl shadow-lg border border-white/[0.1] px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-200">{payload[0].value} candidates</p>
    </div>
  );
};

export default function HiringTrendChart({ data }: HiringTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <YAxis tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#0a0a0f' }}
          activeDot={{ r: 6, fill: '#4F46E5', strokeWidth: 3, stroke: '#0a0a0f' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
