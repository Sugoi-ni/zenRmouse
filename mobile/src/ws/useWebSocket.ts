import { useRef, useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type MessageHandler = (data: any) => void;

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const queue = useRef<{ id: number; resolve: (v: any) => void; reject: (e: Error) => void }[]>([]);
  const idRef = useRef(0);
  const handlers = useRef<Map<string, MessageHandler>>(new Map());
  const connInfo = useRef<{ ip: string; port: number } | null>(null);
  const [status, setStatus] = useState<WSStatus>('disconnected');

  const doConnect = useCallback((ip: string, port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (ws.current) ws.current.close();

      const socket = new WebSocket(`ws://${ip}:${port}`);
      ws.current = socket;
      setStatus('connecting');

      socket.onopen = () => {
        setStatus('connected');
        resolve();
      };
      socket.onerror = () => {
        setStatus('error');
        reject(new Error('connection failed'));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          const job = queue.current.shift();
          if (job) {
            if (msg.ok) job.resolve(msg);
            else job.reject(new Error(msg.error || 'unknown'));
          }
        } catch {}
      };

      socket.onclose = () => {
        ws.current = null;
        setStatus('disconnected');
      };
    });
  }, []);

  const connect = useCallback((ip: string, port: number): Promise<void> => {
    connInfo.current = { ip, port };
    return doConnect(ip, port);
  }, [doConnect]);

  const reconnect = useCallback(async () => {
    if (!connInfo.current) return;
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;
    try {
      await doConnect(connInfo.current.ip, connInfo.current.port);
    } catch {}
  }, [doConnect]);

  const send = useCallback((msg: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        reject(new Error('not connected'));
        return;
      }
      const id = idRef.current++;
      queue.current.push({ id, resolve, reject });
      ws.current.send(JSON.stringify(msg));
    });
  }, []);

  const disconnect = useCallback(() => {
    connInfo.current = null;
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setStatus('disconnected');
  }, []);

  const isConnected = useCallback(() => {
    return ws.current !== null && ws.current.readyState === WebSocket.OPEN;
  }, []);

  // AppState: app ongeri dondugunde yeniden baglan
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && connInfo.current) {
        reconnect();
      }
    });
    return () => sub.remove();
  }, [reconnect]);

  return { connect, send, disconnect, isConnected, status, reconnect };
}
