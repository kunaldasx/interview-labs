import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DepartmentBarChartProps {
  data: { status: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 rounded-xl shadow-lg border border-white/[0.1] px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-200">{payload[0].value}</p>
    </div>
  );
};

export default function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    label: d.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <YAxis tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
