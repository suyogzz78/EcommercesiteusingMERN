import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products/';


export const fetchProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data.data; 
};


export const fetchProductById = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data.data;
};
