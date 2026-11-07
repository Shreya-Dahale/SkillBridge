import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type EventHandler = (data: unknown) => void;

export function useRealtime(eventHandlers: Record<string, EventHandler>) {
  const { token } = useAuth();
  const esRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  const connect = useCallback(() => {
    if (!token) return;
    if (esRef.current) {
      esRef.current.close();
    }

    // SSE with auth token via query param (EventSource doesn't support headers)
    const es = new EventSource(`/api/realtime/events?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.addEventListener('connected', (e: MessageEvent) => {
      console.log('[Realtime] Connected:', JSON.parse(e.data));
    });

    // Register all provided event handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          handler(JSON.parse(e.data));
        } catch {
          handler(e.data);
        }
      });
    });

    es.onerror = () => {
      // Auto-reconnect after 5s
      setTimeout(connect, 5000);
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);
}
