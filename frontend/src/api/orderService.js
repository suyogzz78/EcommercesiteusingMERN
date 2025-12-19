import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders/';


export const createOrder = async (orderData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(API_URL, orderData, config);
  return response.data;
};
