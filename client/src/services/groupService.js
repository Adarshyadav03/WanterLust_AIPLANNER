import api from './api';

export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const inviteBuddyToGroup = async (groupId, target) => {
  const payload = typeof target === 'object' ? target : { targetUserId: target };
  const response = await api.post(`/groups/${groupId}/invite`, payload);
  return response.data;
};

export const acceptGroupInvite = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/invite/accept`);
  return response.data;
};

export const rejectGroupInvite = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/invite/reject`);
  return response.data;
};

export const respondGroupInvite = async (groupId, action) => {
  const endpoint = action === 'accept' ? `/groups/${groupId}/invite/accept` : `/groups/${groupId}/invite/reject`;
  const response = await api.post(endpoint, { action });
  return response.data;
};

export const getInvitableBuddies = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/invitable-buddies`);
  return response.data;
};

export const getMyGroupInvitations = async () => {
  const response = await api.get('/groups/invitations');
  return response.data;
};

export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getGroupByInviteCode = async (inviteCode) => {
  const response = await api.get(`/groups/join/${inviteCode}`);
  return response.data;
};

export const joinGroupByInviteCode = async (inviteCode) => {
  const response = await api.post(`/groups/join/${inviteCode}`);
  return response.data;
};

export const joinGroupByCode = async (inviteCode) => {
  const response = await api.post('/groups/join', { inviteCode });
  return response.data;
};

export const generateInviteCode = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/invite-code`);
  return response.data;
};

export const toggleInviteLink = async (groupId) => {
  const response = await api.put(`/groups/${groupId}/invite-toggle`);
  return response.data;
};

export const getGroupMessages = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/messages`);
  return response.data;
};

export const sendGroupMessage = async (groupId, messageData) => {
  const response = await api.post(`/groups/${groupId}/messages`, messageData);
  return response.data;
};

export default {
  getGroups,
  getGroupById,
  createGroup,
  inviteBuddyToGroup,
  acceptGroupInvite,
  rejectGroupInvite,
  respondGroupInvite,
  getInvitableBuddies,
  getMyGroupInvitations,
  getGroupMembers,
  searchUsers,
  getGroupByInviteCode,
  joinGroupByInviteCode,
  joinGroupByCode,
  generateInviteCode,
  toggleInviteLink,
  getGroupMessages,
  sendGroupMessage,
};
