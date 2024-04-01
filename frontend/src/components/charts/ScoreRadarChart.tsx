import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ScoreRadarChartProps {
  scores: {
    communication: number;
    technical: number;
    confidence: number;
    domain_knowledge: number;
    problem_solving: number;
  };
}

export default function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const data = [
    { subject: 'Communication', score: scores.communication },
    { subject: 'Technical', score: scores.technical },
    { subject: 'Confidence', score: scores.confidence },
    { subject: 'Domain Knowledge', score: scores.domain_knowledge },
    { subject: 'Problem Solving', score: scores.problem_solving },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#818CF8" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6B7280' }} />
        <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#4F46E5"
          strokeWidth={2}
          fill="url(#radarGradient)"
          dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
