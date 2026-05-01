import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../config/socket';
import useAuthStore from '../store/authStore';

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectSocket(accessToken);
    }
    return () => { if (!isAuthenticated) disconnectSocket(); };
  }, [isAuthenticated, accessToken]);

  return getSocket();
};

export const useSocketEvent = (event, handler) => {
  const socket = getSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);
};