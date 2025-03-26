import axios from 'axios';

const API_URL = 'http://localhost:4000/api/services';

export const getAdditionalServices = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch additional services' };
  }
};