import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Devices
export const getDevices = async () => {
  const response = await api.get('/devices');
  return response.data;
};

export const assignUserToDevice = async (deviceId: string, userId: string) => {
  const response = await api.post(`/device/${deviceId}/assign-user`, { userId });
  return response.data;
};

// Sessions
export const getActiveSessions = async () => {
  const response = await api.get('/sessions/active');
  return response.data;
};

export const endSession = async (sessionId: string) => {
  const response = await api.post('/session/end', { sessionId });
  return response.data;
};

export default api;
