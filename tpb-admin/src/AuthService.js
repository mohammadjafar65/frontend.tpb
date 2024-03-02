import axios from 'axios';

const API_URL = 'https://api.thepilgrimbeez.com'; // Your API URL

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw new Error('Invalid username or password');
    }
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export default AuthService;
