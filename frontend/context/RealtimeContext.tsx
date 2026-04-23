'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
});

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
