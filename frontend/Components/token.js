// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from './config'
const api = axios.create({
  baseURL: {API_URL}, // Replace with your actual backend
  withCredentials: true, // if using cookies
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loadAuthToken = async () => {
  const token = await AsyncStorage.getItem('token');
  setAuthToken(token);
};

export default api;
