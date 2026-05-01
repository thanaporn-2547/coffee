import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { disconnectSocket } from '../config/socket';
import api from '../services/api';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: () => { toast.success('Registration successful! Please login.'); navigate('/login'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      logout();
      disconnectSocket();
      qc.clear();
      navigate('/login');
      toast.success('Logged out successfully');
    },
  });
};