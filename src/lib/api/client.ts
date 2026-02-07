import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Relative path to Next.js API routes
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
