import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import Button from '../ui/Button';

interface VoicePanelProps {
  onAudioReady: (blob: Blob) => void;
  lastAIMessage?: string;
  disabled?: boolean;
}

export default function VoicePanel({ onAudioReady, lastAIMessage, disabled }: VoicePanelProps) {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  const handleSend = () => {
    if (audioBlob) {
      onAudioReady(audioBlob);
      clearRecording();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Voice Controls</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} disabled={disabled} variant="primary" size="md">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="danger" size="md">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop Recording
            </Button>
          )}

          {isRecording && (
            <span className="flex items-center gap-2 text-sm text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </span>
          )}
        </div>

        {audioBlob && (
          <div className="flex items-center gap-3">
            <audio src={URL.createObjectURL(audioBlob)} controls className="h-8" />
            <Button onClick={handleSend} variant="primary" size="sm">Send</Button>
            <Button onClick={clearRecording} variant="ghost" size="sm">Clear</Button>
          </div>
        )}

        {lastAIMessage && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {!isSpeaking ? (
                <Button onClick={() => speak(lastAIMessage)} variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Play AI Response
                </Button>
              ) : (
                <Button onClick={stop} variant="outline" size="sm">Stop Playback</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
