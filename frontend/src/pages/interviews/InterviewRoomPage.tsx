import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewsAPI } from '../../api/interviews';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useWebcam } from '../../hooks/useWebcam';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import ConversationDisplay from '../../components/interview/ConversationDisplay';
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
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const hasUploadedRef = useRef(false);

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsAPI.get(interviewId),
    enabled: !!id,
  });

  const { isConnected, messages, isLoading: wsLoading, connect, sendMessage, disconnect } = useWebSocket(interviewId);
  const { videoRef, streamRef, isActive: cameraActive, error: cameraError, startCamera, stopCamera } = useWebcam(true);
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();
  const { isRecording, recordingBlob, startRecording, stopRecording } = useMediaRecorder();
  const { startCapture, stopCapture } = useAudioCapture();

  const isComplete = messages.some(m => m.type === 'complete' || m.type === 'ended');

  // Browser speech recognition — used only for live interim preview while speaking
  const {
    isListening,
    interimTranscript,
    isSupported: speechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({});

  // Start capturing candidate's answer (audio + interim preview)
  const handleStartSpeaking = () => {
    if (isSpeaking) stopSpeaking();
    setIsCapturing(true);
    // Start audio capture for Whisper
    if (streamRef.current) {
      startCapture(streamRef.current);
    }
    // Start browser speech recognition for interim preview only
    startListening();
  };

  // Stop capturing, transcribe with Whisper, and send
  const handleStopSpeaking = async () => {
    stopListening();
    setIsCapturing(false);

    // Get the recorded audio blob
    const audioBlob = await stopCapture();
    console.log('Audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);

    if (audioBlob.size < 100) {
      toast.error('No audio captured. Check your microphone permissions.');
      return;
    }

    // Transcribe with Whisper
    setIsTranscribing(true);
    try {
      const { text } = await interviewsAPI.transcribe(audioBlob);
      if (text.trim()) {
        sendMessage({ type: 'message', content: text.trim() });
      } else {
        toast.error('No speech detected. Please try again.');
      }
    } catch (err) {
      console.error('Whisper transcription failed:', err);
      toast.error('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-speak AI responses
  const lastMessageRef = useRef<number>(0);
  useEffect(() => {
    if (messages.length > lastMessageRef.current) {
      const newMessages = messages.slice(lastMessageRef.current);
      lastMessageRef.current = messages.length;
      for (const msg of newMessages) {
        if (msg.type === 'response' || msg.type === 'greeting') {
          speak(msg.content);
        }
      }
    }
  }, [messages, speak]);

  // Start interview flow
  const handleStart = async () => {
    await startCamera();
    connect();
    setTimeout(() => {
      sendMessage({ type: 'start', content: '' });
      setIsStarted(true);
      setStartedAt(new Date().toISOString());
      if (streamRef.current) {
        startRecording(streamRef.current);
      }
    }, 500);
  };

  // End interview flow
  const handleEnd = () => {
    if (isCapturing) {
      stopListening();
      stopCapture();
      setIsCapturing(false);
    }
    stopSpeaking();
    sendMessage({ type: 'end', content: '' });
    stopRecording();
    toast.success('Interview ended');
  };

  // Upload recording when blob is ready
  useEffect(() => {
    if (recordingBlob && isComplete && !hasUploadedRef.current) {
      hasUploadedRef.current = true;
      setIsUploading(true);
      interviewsAPI.uploadRecording(interviewId, recordingBlob)
        .then(() => toast.success('Recording saved'))
        .catch(() => toast.error('Failed to save recording'))
        .finally(() => setIsUploading(false));
    }
  }, [recordingBlob, isComplete, interviewId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      stopListening();
      stopSpeaking();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!interview) return <div className="text-center py-20 text-gray-500">Interview not found</div>;

  const isBusy = wsLoading || isTranscribing;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Interview Room #{interview.id}</h1>
          <Badge status={isComplete ? 'completed' : isStarted ? 'in_progress' : interview.status} />
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording
            </span>
          )}
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
            <Button
              onClick={() => navigate(`/interviews/${interview.id}`)}
              variant="outline"
              disabled={isUploading}
            >
              {isUploading ? 'Saving Recording...' : 'View Results'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout: Video (60%) | Conversation + Info (40%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* Left: Video Panel */}
        <div className="lg:col-span-3 min-h-0">
          <div className="h-full bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Camera</h3>
              <div className="flex items-center gap-3">
                {isListening && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Listening
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    AI Speaking
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Camera will start when you begin the interview</span>
                </div>
              )}

              {/* Recording overlay indicator */}
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/80 text-white px-2.5 py-1 rounded-full text-xs">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-red-500 mt-2">{cameraError}</p>
            )}

            {!speechSupported && (
              <p className="text-xs text-amber-600 mt-2">
                Speech recognition not supported in this browser. Please use Chrome or Edge.
              </p>
            )}

            {/* Start / Stop Speaking Controls */}
            {isStarted && !isComplete && (
              <div className="mt-3 flex items-center justify-center gap-4">
                {!isCapturing ? (
                  <button
                    onClick={handleStartSpeaking}
                    disabled={isBusy || isSpeaking}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                    Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors shadow-lg animate-pulse"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop &amp; Send
                  </button>
                )}
                {isTranscribing && (
                  <span className="text-xs text-amber-600 italic">Transcribing with AI...</span>
                )}
                {isSpeaking && !isCapturing && (
                  <span className="text-xs text-blue-600 italic">AI is speaking, please wait...</span>
                )}
                {wsLoading && !isSpeaking && !isTranscribing && (
                  <span className="text-xs text-gray-500 italic">Waiting for AI response...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Conversation + Info */}
        <div className="lg:col-span-2 min-h-0 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <ConversationDisplay
              messages={messages}
              interimTranscript={isCapturing ? interimTranscript : undefined}
              isCapturing={isCapturing}
              isLoading={isBusy}
              isConnected={isConnected}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 flex-shrink-0">
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
