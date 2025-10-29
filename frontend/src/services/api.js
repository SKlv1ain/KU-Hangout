// Basic API utility for making requests
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

console.log('API Base URL:', BASE_URL);

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
      const fullUrl = `${BASE_URL}${endpoint}`;

      console.log('POST Request Details:');
      console.log('- Full URL:', fullUrl);
      console.log('- Payload:', payload);
      console.log('- Token:', token ? 'Present' : 'Missing');

      const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      console.log('- Headers:', headers);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: isFormData ? payload : JSON.stringify(payload),
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data?.detail || `POST ${endpoint} failed with status ${response.status}`);
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (err) {
      console.error('POST Error:', err);
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  },

  async put(endpoint, payload) {
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
        method: 'PUT',
        headers,
        credentials: 'include',
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `PUT ${endpoint} failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  },

  async patch(endpoint, payload) {
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
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `PATCH ${endpoint} failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  },
};

export default api;