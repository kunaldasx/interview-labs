import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface InterviewCompletionData {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  completion_rate: number;
}

interface InterviewCompletionChartProps {
  data: InterviewCompletionData;
}

const COLORS: Record<string, string> = {
  Completed: '#10B981',
  Scheduled: '#3B82F6',
  Cancelled: '#EF4444',
  Other: '#6B7280',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 rounded-xl shadow-lg border border-white/[0.1] px-4 py-3">
      <p className="text-sm font-semibold text-gray-200">{payload[0].name}: {payload[0].value}</p>
    </div>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function InterviewCompletionChart({ data }: InterviewCompletionChartProps) {
  const other = data.total - data.completed - data.scheduled - data.cancelled;
  const chartData = [
    { name: 'Completed', value: data.completed },
    { name: 'Scheduled', value: data.scheduled },
    { name: 'Cancelled', value: data.cancelled },
    ...(other > 0 ? [{ name: 'Other', value: other }] : []),
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={100}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
        <text x="50%" y="42%" textAnchor="middle" className="fill-white text-2xl font-bold">
          {data.completion_rate}%
        </text>
        <text x="50%" y="52%" textAnchor="middle" className="fill-gray-400 text-xs">
          Completion
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
