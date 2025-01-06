import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.60.114.24/',  // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
