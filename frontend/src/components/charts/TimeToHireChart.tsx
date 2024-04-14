import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeToHireData {
  job_title: string;
  avg_days: number;
  hire_count: number;
}

interface TimeToHireChartProps {
  data: TimeToHireData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 rounded-xl shadow-lg border border-white/[0.1] px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-200">{payload[0].value} days avg</p>
      <p className="text-xs text-gray-400">{payload[0].payload.hire_count} hires</p>
    </div>
  );
};

export default function TimeToHireChart({ data }: TimeToHireChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <defs>
          <linearGradient id="tthBarGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <YAxis dataKey="job_title" type="category" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} width={120} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_days" fill="url(#tthBarGradient)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
