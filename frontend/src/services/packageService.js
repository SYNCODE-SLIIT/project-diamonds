import axios from 'axios';

const API_URL = 'http://localhost:4000/api/packages';

export const getPackages = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch packages' };
  }
};

export const getPackageById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch package' };
  }
};

export const createPackage = async (packageData) => {
  try {
    const formData = new FormData();

    for (const key in packageData) {
      const value = packageData[key];

      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        for (const nestedKey in value) {
          formData.append(`${key}[${nestedKey}]`, value[nestedKey]);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            for (const subKey in item) {
              formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
            }
          } else {
            formData.append(`${key}[]`, item);
          }
        });
      } else {
        formData.append(key, value);
      }
    }

    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create package' };
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const formData = new FormData();

    for (const key in packageData) {
      const value = packageData[key];

      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        for (const nestedKey in value) {
          formData.append(`${key}[${nestedKey}]`, value[nestedKey]);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            for (const subKey in item) {
              formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
            }
          } else {
            formData.append(`${key}[]`, item);
          }
        });
      } else {
        formData.append(key, value);
      }
    }

    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update package' };
  }
};

export const deletePackage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete package' };
  }
};