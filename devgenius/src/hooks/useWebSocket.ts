'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected';

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      socketRef.current = new WebSocket(url);
      setConnectionStatus('Connecting');

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
      };

      socketRef.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const message = JSON.parse(event.data);
        setLastMessage(message);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Disconnected');
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('Disconnected');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    const send = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending WebSocket message:', message);
        socketRef.current.send(JSON.stringify(message));
      } else {
        console.log('WebSocket not open, retrying in 1 second...');
        setTimeout(send, 1000);
      }
    };
    send();
  }, []);

  // Heartbeat mechanism
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, []);

  return { lastMessage, sendMessage, connectionStatus };
};