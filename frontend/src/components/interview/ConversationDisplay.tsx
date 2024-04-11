import { useRef, useEffect } from 'react';
import type { ChatResponse } from '../../types/interview';

interface ConversationDisplayProps {
  messages: ChatResponse[];
  interimTranscript?: string;
  isCapturing?: boolean;
  isLoading: boolean;
  isConnected: boolean;
}

export default function ConversationDisplay({
  messages,
  interimTranscript,
  isCapturing,
  isLoading,
  isConnected,
}: ConversationDisplayProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isCapturing, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Conversation</h3>
          <span className={`inline-flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isAI = msg.type === 'response' || msg.type === 'greeting';
          const isError = msg.type === 'error';
          return (
            <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  isAI
                    ? 'bg-gray-100 text-gray-900'
                    : isError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Live preview while recording (browser speech API for visual feedback) */}
        {isCapturing && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-lg px-4 py-2.5 text-sm bg-indigo-100 text-indigo-700">
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

        {isLoading && !isCapturing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5">
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

      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Click <strong>Start Speaking</strong> to record your answer, then <strong>Stop &amp; Send</strong> when done
        </p>
      </div>
    </div>
  );
}
