import API from './api';

export const getNotifications = async () => {
  const res = await API.get('/notifications');
  return res.data;
};

export const markAllRead = async () => {
  const res = await API.put('/notifications/read-all');
  return res.data;
};

export const notificationService = {
  getNotifications,
  markAllRead,
};

export default notificationService;
