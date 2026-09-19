import API from './api';

const reviewService = {
  // Destination Reviews
  getDestinationReviews: async (destinationId, { page = 1, limit = 10, sort = 'newest' } = {}) => {
    const res = await API.get(`/destinations/${destinationId}/reviews`, {
      params: { page, limit, sort },
    });
    return res.data;
  },

  getDestinationRatingSummary: async (destinationId) => {
    const res = await API.get(`/destinations/${destinationId}/rating`);
    return res.data;
  },

  createDestinationReview: async (destinationId, data) => {
    const res = await API.post(`/destinations/${destinationId}/reviews`, data);
    return res.data;
  },

  updateDestinationReview: async (destinationId, reviewId, data) => {
    const res = await API.put(`/destinations/${destinationId}/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteDestinationReview: async (destinationId, reviewId) => {
    const res = await API.delete(`/destinations/${destinationId}/reviews/${reviewId}`);
    return res.data;
  },

  // Hotel Reviews
  getHotelReviews: async (hotelId, { page = 1, limit = 10, sort = 'newest' } = {}) => {
    const res = await API.get(`/hotels/${encodeURIComponent(hotelId)}/reviews`, {
      params: { page, limit, sort },
    });
    return res.data;
  },

  getHotelRatingSummary: async (hotelId) => {
    const res = await API.get(`/hotels/${encodeURIComponent(hotelId)}/rating`);
    return res.data;
  },

  createHotelReview: async (hotelId, data) => {
    const res = await API.post(`/hotels/${encodeURIComponent(hotelId)}/reviews`, data);
    return res.data;
  },

  updateHotelReview: async (hotelId, reviewId, data) => {
    const res = await API.put(`/hotels/${encodeURIComponent(hotelId)}/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteHotelReview: async (hotelId, reviewId) => {
    const res = await API.delete(`/hotels/${encodeURIComponent(hotelId)}/reviews/${reviewId}`);
    return res.data;
  },

  // Actions
  toggleHelpful: async (reviewId, reviewType = 'destination') => {
    const res = await API.post(`/reviews/${reviewId}/helpful`, { reviewType });
    return res.data;
  },

  reportReview: async (reviewId, { reviewType = 'destination', reason = 'Spam' } = {}) => {
    const res = await API.post(`/reviews/${reviewId}/report`, { reviewType, reason });
    return res.data;
  },

  getAdminReportedReviews: async () => {
    const res = await API.get('/reviews/admin/reports');
    return res.data;
  },
};

export default reviewService;
