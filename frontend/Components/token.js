// token.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      await AsyncStorage.setItem('userToken', token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    
    try {
      await AsyncStorage.removeItem('userToken');
      console.log('Token removed successfully');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
};

export const loadAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    if (token) {
      setAuthToken(token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error loading token:', error);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    
    delete api.defaults.headers.common['Authorization'];
    
    console.log('Token cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing token:', error);
    return false;
  }
};

export default api;
