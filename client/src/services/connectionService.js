import API from './api';

export const sendRequest = async (userId) => {
  const res = await API.post(`/connections/request/${userId}`);
  return res.data;
};

export const getStatus = async (userId) => {
  const res = await API.get(`/connections/status/${userId}`);
  return res.data;
};

export const acceptRequest = async (connectionId) => {
  const res = await API.put(`/connections/${connectionId}/accept`);
  return res.data;
};

export const rejectRequest = async (connectionId) => {
  const res = await API.put(`/connections/${connectionId}/reject`);
  return res.data;
};

export const getRequests = async () => {
  const res = await API.get('/connections/requests');
  return res.data;
};

export const getFriends = async () => {
  const res = await API.get('/connections/friends');
  return res.data;
};

export const removeConnection = async (userId) => {
  const res = await API.delete(`/connections/${userId}`);
  return res.data;
};

export const connectionService = {
  sendRequest,
  getStatus,
  acceptRequest,
  rejectRequest,
  getRequests,
  getFriends,
  removeConnection,
};

export default connectionService;
