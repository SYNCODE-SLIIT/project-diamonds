import axios from 'axios';

export const fetchAllEvents = async () => {
  const response = await axios.get('/api/admin/events');
  return response.data;
};