import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token || localStorage.getItem('wanderlust_token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('online_users_list', (usersList) => {
      setOnlineUsers(usersList);
    });

    newSocket.on('connection_request', (data) => {
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('connection_accepted', (data) => {
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('new_message_notification', (data) => {
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('online_users_list');
      newSocket.off('connection_request');
      newSocket.off('connection_accepted');
      newSocket.off('new_message_notification');
      newSocket.close();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        unreadCount,
        setUnreadCount,
        clearUnreadCount: () => setUnreadCount(0),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
