/*
 * our axios instance - all API calls go through this
 * baseURL is empty because vite proxies /api to localhost:3001
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

export default api;
