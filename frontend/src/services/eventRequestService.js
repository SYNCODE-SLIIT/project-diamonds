import axios from 'axios';

const API = 'http://localhost:4000/api/event-requests';

export const submitEventRequest = async (data) => {
  try {
    const response = await axios.post('/api/event-requests', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit event request' };
  }
};

export const fetchRequestsByOrganizer = (organizerID) =>
  axios.get(`${API}/organizer/${organizerID}`).then(res => res.data);

export const fetchAllRequests = (status) =>
  axios.get(`${API}${status ? `?status=${status}` : ''}`).then(res => res.data);

export const updateRequest = (id, data) =>
  axios.put(`${API}/${id}`, data).then(res => res.data);

export const deleteRequest = (id) =>
  axios.delete(`${API}/${id}`).then(res => res.data);

export const updateStatus = (id, status, reviewedBy, rejectionReason) =>
  axios.patch(`${API}/${id}/status`, { 
    status, 
    reviewedBy, 
    rejectionReason 
  }).then(res => res.data);