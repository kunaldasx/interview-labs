import { useRef, useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatResponse } from '../types/interview';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`;

export function useWebSocket(interviewId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(() => {
    if (!interviewId || wsRef.current) return;

    const ws = new WebSocket(`${WS_URL}/api/v1/ws/interview/${interviewId}`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: ChatResponse = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
      setIsLoading(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [interviewId]);

  const sendMessage = useCallback((message: ChatMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      // Show candidate's message in the conversation
      if (message.type === 'message' && message.content) {
        setMessages(prev => [...prev, {
          type: 'candidate',
          content: message.content,
        }]);
      }
      setIsLoading(true);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { isConnected, messages, isLoading, connect, sendMessage, disconnect };
}
