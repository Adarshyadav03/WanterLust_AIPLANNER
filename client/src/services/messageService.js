import API from './api';

export const getConversations = async () => {
  const res = await API.get('/messages/conversations');
  return res.data;
};

export const getPrivateChatHistory = async (userId) => {
  const res = await API.get(`/messages/private/${userId}`);
  return res.data;
};

export const sendPrivateMessage = async (userId, message) => {
  const res = await API.post(`/messages/private/${userId}`, { message });
  return res.data;
};

export const messageService = {
  getConversations,
  getPrivateChatHistory,
  sendPrivateMessage,
};

export default messageService;
