import axios from 'axios';

const API_URL = '/api';

export const addProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/products`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};


export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};