import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewsAPI } from '../../api/interviews';
import { useWebSocket } from '../../hooks/useWebSocket';
import ChatPanel from '../../components/interview/ChatPanel';
import VoicePanel from '../../components/interview/VoicePanel';
import VideoPanel from '../../components/interview/VideoPanel';
import InterviewTimer from '../../components/interview/InterviewTimer';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function InterviewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const interviewId = Number(id);
  const [isStarted, setIsStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<string | undefined>();

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsAPI.get(interviewId),
    enabled: !!id,
  });

  const { isConnected, messages, isLoading: wsLoading, connect, sendMessage, disconnect } = useWebSocket(interviewId);

  const isComplete = messages.some(m => m.type === 'complete' || m.type === 'ended');
  const lastAIMessage = [...messages].reverse().find(m => m.type === 'response' || m.type === 'greeting')?.content;

  const handleStart = () => {
    connect();
    setTimeout(() => {
      sendMessage({ type: 'start', content: '' });
      setIsStarted(true);
      setStartedAt(new Date().toISOString());
    }, 500);
  };

  const handleSendMessage = (content: string) => {
    sendMessage({ type: 'message', content });
  };

  const handleEnd = () => {
    sendMessage({ type: 'end', content: '' });
    toast.success('Interview ended');
  };

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!interview) return <div className="text-center py-20 text-gray-500">Interview not found</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Interview Room #{interview.id}</h1>
          <Badge status={isComplete ? 'completed' : isStarted ? 'in_progress' : interview.status} />
        </div>
        <div className="flex items-center gap-3">
          <InterviewTimer
            durationMin={interview.duration_limit_min}
            startedAt={startedAt}
            isActive={isStarted && !isComplete}
          />
          {!isStarted && !isComplete && (
            <Button onClick={handleStart} variant="primary">Start Interview</Button>
          )}
          {isStarted && !isComplete && (
            <Button onClick={handleEnd} variant="danger">End Interview</Button>
          )}
          {isComplete && (
            <Button onClick={() => navigate(`/interviews/${interview.id}`)} variant="outline">View Results</Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="min-h-0">
          <VideoPanel disabled={!isStarted || isComplete} />
        </div>
        <div className="lg:col-span-2 min-h-0">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={wsLoading}
            isConnected={isConnected}
            disabled={!isStarted || isComplete}
          />
        </div>
        <div className="space-y-4">
          {(interview.interview_type === 'ai_voice' || interview.interview_type === 'ai_both') && (
            <VoicePanel
              onAudioReady={() => {}}
              lastAIMessage={lastAIMessage}
              disabled={!isStarted || isComplete}
            />
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Interview Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 capitalize">{interview.interview_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-900">{interview.duration_limit_min} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Questions</span>
                <span className="text-gray-900">{interview.total_questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Language</span>
                <span className="text-gray-900 uppercase">{interview.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
