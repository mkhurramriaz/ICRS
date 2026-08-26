import api from './api';

export const AuthService = {
  /**
   * Logs in a user via the backend API.
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data; // Expected format: { success: true, token, user: { name, email, role, avatarUrl } }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Login credentials invalid.';
      throw new Error(errorMsg);
    }
  },

  /**
   * Registers a new citizen via the backend API.
   */
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data; // Expected format: { success: true, token, user: { name, email, role, avatarUrl } }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Registration process failed.';
      throw new Error(errorMsg);
    }
  },

  /**
   * Logs out the user session.
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('API Logout error:', error);
      return { success: true };
    }
  }
};
