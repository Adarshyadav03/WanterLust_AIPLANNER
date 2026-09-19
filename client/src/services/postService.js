import api from './api';

export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

export const commentPost = async (postId, text) => {
  const response = await api.post(`/posts/${postId}/comment`, { text });
  return response.data;
};

export const savePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/save`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export default {
  getPosts,
  createPost,
  likePost,
  commentPost,
  savePost,
  deletePost,
};
