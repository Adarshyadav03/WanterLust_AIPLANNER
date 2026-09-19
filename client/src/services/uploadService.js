import api from './api';

export const uploadImage = async (imageData) => {
  // imageData can be { image: base64Str } or { images: [base64Str1, base64Str2] }
  const response = await api.post('/upload/image', imageData);
  return response.data;
};

export default {
  uploadImage,
};
