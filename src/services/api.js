import axios from 'axios';

const api = axios.create({
  baseURL: 'https://findmydoctor.xyz/',  // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
