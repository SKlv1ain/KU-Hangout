// Basic API utility for making requests
const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = {
  async get(endpoint) {
    const token = localStorage.getItem('kh_token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    });
    return { data: await response.json() };
  },

  async post(endpoint, payload) {
    const token = localStorage.getItem('kh_token');
    
    // Check if payload is FormData
    const isFormData = payload instanceof FormData;
    
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    // Don't set Content-Type for FormData (browser sets it automatically with boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: isFormData ? payload : JSON.stringify(payload)
    });
    return { data: await response.json() };
  }
};

export default api;
