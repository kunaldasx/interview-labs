import { useRef, useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatResponse, ConnectionState } from '../types/interview';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`;

const HEARTBEAT_INTERVAL_MS = 25_000;
const HEARTBEAT_TIMEOUT_MS = 10_000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(interviewId: number | null, token?: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingContentRef = useRef('');
  const shouldReconnectRef = useRef(false);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', content: '' }));
        // Set timeout — if no pong within 10s, consider connection dead
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn('Heartbeat timeout — closing WebSocket');
          wsRef.current?.close();
        }, HEARTBEAT_TIMEOUT_MS);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, [stopHeartbeat]);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data: ChatResponse = JSON.parse(event.data);

    switch (data.type) {
      case 'pong':
        // Reset heartbeat timeout
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }
        break;

      case 'thinking':
        setIsThinking(true);
        setIsLoading(true);
        break;

      case 'stream_start':
        setIsThinking(false);
        setIsStreaming(true);
        streamingContentRef.current = '';
        setMessages(prev => [...prev, { type: 'stream_start', content: '', isStreaming: true }]);
        break;

      case 'stream_chunk':
        streamingContentRef.current += data.content;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: streamingContentRef.current,
            };
          }
          return updated;
        });
        break;

      case 'stream_end':
        setIsStreaming(false);
        setIsLoading(false);
        streamingContentRef.current = '';
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
            updated[lastIdx] = {
              ...data,
              type: data.is_complete ? 'complete' : 'response',
              isStreaming: false,
            };
          }
          return updated;
        });
        break;

      case 'reconnected':
        // Rebuild messages from conversation history
        if (data.conversation_history) {
          const restored: ChatResponse[] = data.conversation_history.map((entry) => ({
            type: entry.role === 'assistant' ? 'response' : 'candidate',
            content: entry.content,
          }));
          setMessages(restored);
        }
        setIsLoading(false);
        break;

      default:
        // All other message types: greeting, response, complete, ended, error, candidate
        setMessages(prev => [...prev, data]);
        setIsLoading(false);
        break;
    }
  }, []);

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!interviewId) { reject(new Error('No interview ID')); return; }
      if (wsRef.current?.readyState === WebSocket.OPEN) { resolve(); return; }

      // Clean up existing connection
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      setConnectionState('connecting');

      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const ws = new WebSocket(`${WS_URL}/api/v1/ws/interview/${interviewId}${tokenParam}`);

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 10_000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setConnectionState('connected');
        setReconnectAttempt(0);
        shouldReconnectRef.current = true;
        startHeartbeat();
        resolve();
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        clearTimeout(timeout);
        stopHeartbeat();
        wsRef.current = null;

        // Don't reconnect on auth failure or normal close
        if (event.code === 4001 || event.code === 4004 || event.code === 1000) {
          setConnectionState('disconnected');
          shouldReconnectRef.current = false;
          return;
        }

        // Abnormal close (1006) or server-initiated — attempt reconnect
        if (shouldReconnectRef.current) {
          attemptReconnect();
        } else {
          setConnectionState('disconnected');
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setConnectionState('disconnected');
        reject(new Error('WebSocket connection failed'));
      };

      wsRef.current = ws;
    });
  }, [interviewId, token, handleMessage, startHeartbeat, stopHeartbeat]);

  const attemptReconnect = useCallback(() => {
    setReconnectAttempt(prev => {
      const attempt = prev + 1;
      if (attempt > MAX_RECONNECT_ATTEMPTS) {
        setConnectionState('disconnected');
        shouldReconnectRef.current = false;
        return prev;
      }

      setConnectionState('reconnecting');
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 16_000);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
          .then(() => {
            // Request conversation history restore
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'reconnect', content: '' }));
            }
          })
          .catch(() => {
            // connect() failure will trigger onclose → attemptReconnect again
          });
      }, delay);

      return attempt;
    });
  }, [connect]);

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
    shouldReconnectRef.current = false;
    stopHeartbeat();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setConnectionState('disconnected');
  }, [stopHeartbeat]);

  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      stopHeartbeat();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [stopHeartbeat]);

  const isConnected = connectionState === 'connected';

  return {
    isConnected,
    connectionState,
    messages,
    isLoading,
    isStreaming,
    isThinking,
    reconnectAttempt,
    connect,
    sendMessage,
    disconnect,
  };
}
