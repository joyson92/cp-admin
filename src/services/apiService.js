import axios from 'axios';

const API = axios.create({
  baseURL: 'https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include the auth token in every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth'); // Get token from storage/state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
