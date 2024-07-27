import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatScore, getScreeningRecommendationLabel, formatDateTime } from '../../lib/formatters';
import type { ResumeScreening } from '../../types/screening';

interface ScreeningResultCardProps {
  screening: ResumeScreening;
}

function scoreColor(score: number): string {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6) return 'bg-green-500';
  if (score >= 4) return 'bg-yellow-500';
  if (score >= 2) return 'bg-orange-500';
  return 'bg-red-500';
}

function overallScoreRingColor(score: number): string {
  if (score >= 8) return 'text-emerald-500';
  if (score >= 6) return 'text-green-500';
  if (score >= 4) return 'text-yellow-500';
  if (score >= 2) return 'text-orange-500';
  return 'text-red-500';
}

const SCORE_FIELDS = [
  { key: 'keyword_match_score', label: 'Keyword Match' },
  { key: 'skill_relevance_score', label: 'Skill Relevance' },
  { key: 'experience_match_score', label: 'Experience Match' },
  { key: 'education_match_score', label: 'Education Match' },
] as const;

export default function ScreeningResultCard({ screening }: ScreeningResultCardProps) {
  const pct = (screening.overall_score / 10) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Overall Score + Recommendation */}
      <Card title="AI Screening Result" action={
        <Badge
          status={screening.recommendation}
          label={getScreeningRecommendationLabel(screening.recommendation)}
          size="md"
        />
      }>
        <div className="flex items-center gap-8">
          {/* Circular score */}
          <div className="relative flex-shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                className="text-white/[0.08]" />
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                stroke="currentColor"
                className={overallScoreRingColor(screening.overall_score)}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{formatScore(screening.overall_score)}</span>
              <span className="text-[10px] text-gray-400">/ 10</span>
            </div>
          </div>

          {/* Score bars */}
          <div className="flex-1 space-y-3">
            {SCORE_FIELDS.map(({ key, label }) => {
              const value = screening[key];
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 w-36">{label}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreColor(value)}`} style={{ width: `${(value / 10) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-white w-8 text-right">{formatScore(value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">Screened {formatDateTime(screening.screened_at)}</p>
      </Card>

      {/* Skills */}
      {(screening.matched_skills?.skills?.length || screening.missing_skills?.skills?.length) && (
        <Card title="Skills Analysis">
          <div className="space-y-4">
            {screening.matched_skills?.skills && screening.matched_skills.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {screening.matched_skills.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {screening.missing_skills?.skills && screening.missing_skills.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {screening.missing_skills.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {screening.strengths?.items && screening.strengths.items.length > 0 && (
          <Card title="Strengths">
            <ul className="space-y-1.5">
              {screening.strengths.items.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span> {s}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {screening.concerns?.items && screening.concerns.items.length > 0 && (
          <Card title="Concerns">
            <ul className="space-y-1.5">
              {screening.concerns.items.map((c, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">!</span> {c}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Summary */}
      {screening.summary && (
        <Card title="AI Summary">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{screening.summary}</p>
        </Card>
      )}
    </div>
  );
}
