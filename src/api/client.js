import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

const client = axios.create({
  baseURL: BASE_URL,
});

// Pasang token ke setiap request kalau ada di localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('swm_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau server bilang 401 (token invalid/expired), bersihkan sesi
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('swm_access_token');
      localStorage.removeItem('swm_user');
    }
    return Promise.reject(error);
  }
);

export default client;