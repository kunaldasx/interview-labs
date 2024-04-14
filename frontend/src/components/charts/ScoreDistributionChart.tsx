import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreDistributionChartProps {
  data: { overall_score: number }[];
}

const BINS = ['0-2', '2-4', '4-6', '6-8', '8-10'];

function buildHistogram(scores: number[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const s of scores) {
    if (s <= 2) counts[0]++;
    else if (s <= 4) counts[1]++;
    else if (s <= 6) counts[2]++;
    else if (s <= 8) counts[3]++;
    else counts[4]++;
  }
  return BINS.map((bin, i) => ({ range: bin, count: counts[i] }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 rounded-xl shadow-lg border border-white/[0.1] px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">Score {label}</p>
      <p className="text-sm font-semibold text-gray-200">{payload[0].value} candidates</p>
    </div>
  );
};

export default function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const histogram = buildHistogram(data.map(d => d.overall_score));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={histogram}>
        <defs>
          <linearGradient id="scoreBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="url(#scoreBarGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
