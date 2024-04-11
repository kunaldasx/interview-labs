import { useState, useEffect } from 'react';

interface InterviewTimerProps {
  durationMin: number;
  startedAt?: string;
  isActive: boolean;
}

export default function InterviewTimer({ durationMin, startedAt, isActive }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);

  useEffect(() => {
    if (!isActive || !startedAt) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const remaining = Math.max(0, durationMin * 60 - elapsed);
      setTimeLeft(Math.floor(remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startedAt, durationMin]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft < 300; // less than 5 minutes

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-medium ${
      isLow ? 'bg-red-500/15 text-red-400' : 'bg-white/[0.08] text-gray-300'
    }`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
