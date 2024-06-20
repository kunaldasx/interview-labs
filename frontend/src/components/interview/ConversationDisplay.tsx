import { useRef, useEffect } from 'react';
import type { ChatResponse, ConnectionState } from '../../types/interview';

interface ConversationDisplayProps {
  messages: ChatResponse[];
  interimTranscript?: string;
  isCapturing?: boolean;
  isLoading: boolean;
  isConnected: boolean;
  isThinking?: boolean;
  connectionState?: ConnectionState;
  reconnectAttempt?: number;
}

export default function ConversationDisplay({
  messages,
  interimTranscript,
  isCapturing,
  isLoading,
  isConnected,
  isThinking,
  connectionState = isConnected ? 'connected' : 'disconnected',
  reconnectAttempt = 0,
}: ConversationDisplayProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isCapturing, isLoading, isThinking]);

  const statusColor = connectionState === 'connected'
    ? 'text-green-600'
    : connectionState === 'reconnecting'
    ? 'text-amber-500'
    : 'text-gray-400';

  const dotColor = connectionState === 'connected'
    ? 'bg-green-500'
    : connectionState === 'reconnecting'
    ? 'bg-amber-500 animate-pulse'
    : 'bg-gray-600';

  const statusLabel = connectionState === 'connected'
    ? 'Connected'
    : connectionState === 'reconnecting'
    ? `Reconnecting (${reconnectAttempt}/5)...`
    : connectionState === 'connecting'
    ? 'Connecting...'
    : 'Disconnected';

  return (
    <div className="flex flex-col h-full bg-white/[0.05] rounded-xl border border-white/[0.08]">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Conversation</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Reconnection banner */}
      {connectionState === 'reconnecting' && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <p className="text-xs text-amber-400 text-center">
            Connection lost. Attempting to reconnect... ({reconnectAttempt}/5)
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isAI = msg.type === 'response' || msg.type === 'greeting' || msg.type === 'stream_start';
          const isError = msg.type === 'error';
          const isStreamingMsg = msg.isStreaming;
          return (
            <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  isAI
                    ? 'bg-white/[0.08] text-gray-200'
                    : isError
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.content}
                {isStreamingMsg && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-text-bottom" />
                )}
              </div>
            </div>
          );
        })}

        {/* Live preview while recording (browser speech API for visual feedback) */}
        {isCapturing && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-lg px-4 py-2.5 text-sm bg-indigo-500/15 text-indigo-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-600">Recording...</span>
              </div>
              {interimTranscript && (
                <p className="mt-1 italic text-indigo-400">{interimTranscript}</p>
              )}
            </div>
          </div>
        )}

        {/* AI thinking indicator */}
        {isThinking && !isCapturing && (
          <div className="flex justify-start">
            <div className="bg-white/[0.08] rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Legacy loading indicator (fallback when not using streaming) */}
        {isLoading && !isCapturing && !isThinking && (
          <div className="flex justify-start">
            <div className="bg-white/[0.08] rounded-lg px-4 py-2.5">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-xs text-gray-400 text-center">
          Click <strong>Start Speaking</strong> to record your answer, then <strong>Stop &amp; Send</strong> when done
        </p>
      </div>
    </div>
  );
}
