import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        auth: { token }
      });

      // Connection success
      newSocket.on('connect', () => {
        console.log(`[✅ SOCKET] Connected to server (ID: ${newSocket.id})`);
      });

      // Connection error
      newSocket.on('connect_error', (err) => {
        console.error(`[❌ SOCKET] Connection error: ${err.message}`);
      });

      // Disconnect
      newSocket.on('disconnect', (reason) => {
        console.warn(`[⚠️ SOCKET] Disconnected: ${reason}`);
      });

      // Reconnect attempt
      newSocket.io.on('reconnect_attempt', (attempt) => {
        console.log(`[🔄 SOCKET] Reconnect attempt #${attempt}`);
      });

      // Online users handling
      newSocket.on('userOnline', (userData) => {
        console.log(`[👤 SOCKET] User online: ${userData.username || userData.userId}`);
        setOnlineUsers(prev => {
          if (!prev.find(u => u.userId === userData.userId)) {
            return [...prev, userData];
          }
          return prev;
        });
      });

      // Offline users handling
      newSocket.on('userOffline', (userData) => {
        console.log(`[🚪 SOCKET] User offline: ${userData.username || userData.userId}`);
        setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
      });

      setSocket(newSocket);

      return () => {
        console.log("[🛑 SOCKET] Closing connection...");
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
