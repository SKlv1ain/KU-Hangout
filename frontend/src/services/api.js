// Basic API utility for making requests
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = {
  async get(endpoint) {
    try {
      const token = localStorage.getItem('kh_token');
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `GET ${endpoint} failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      // Ensure we always throw an Error object
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  },

  async post(endpoint, payload) {
    try {
      const token = localStorage.getItem('kh_token');
      const isFormData = payload instanceof FormData;

      const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `POST ${endpoint} failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  },
};

export default api;
