// Basic API utility for making requests
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Helper function to handle token expiration
const handleTokenExpiration = () => {
  // Clear token and user data
  localStorage.removeItem('kh_token');
  
  // Redirect to login if not already there
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

const api = {
  async get(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('kh_token');
      
      // Build URL with query parameters
      let url = `${BASE_URL}${endpoint}`;
      if (options.params && Object.keys(options.params).length > 0) {
        const queryString = new URLSearchParams(options.params).toString();
        url += `?${queryString}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
      });

      // Handle token expiration (401 Unauthorized) - check before parsing JSON
      if (response.status === 401 || response.status === 403) {
        // Try to get error message, but don't fail if response is not JSON
        let errorMessage = 'Session expired. Please login again.';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData?.detail || errorMessage;
        } catch (e) {
          // Response is not JSON, use default message
        }
        handleTokenExpiration();
        throw new Error(errorMessage);
      }

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

      // Handle token expiration (401 Unauthorized) - check before parsing JSON
      if (response.status === 401 || response.status === 403) {
        // Try to get error message, but don't fail if response is not JSON
        let errorMessage = 'Session expired. Please login again.';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData?.detail || errorMessage;
        } catch (e) {
          // Response is not JSON, use default message
        }
        handleTokenExpiration();
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data?.detail || `POST ${endpoint} failed with status ${response.status}`);
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (err) {
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

      // Handle token expiration (401 Unauthorized) - check before parsing JSON
      if (response.status === 401 || response.status === 403) {
        // Try to get error message, but don't fail if response is not JSON
        let errorMessage = 'Session expired. Please login again.';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData?.detail || errorMessage;
        } catch (e) {
          // Response is not JSON, use default message
        }
        handleTokenExpiration();
        throw new Error(errorMessage);
      }

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

      // Handle token expiration (401 Unauthorized) - check before parsing JSON
      if (response.status === 401 || response.status === 403) {
        // Try to get error message, but don't fail if response is not JSON
        let errorMessage = 'Session expired. Please login again.';
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData?.detail || errorMessage;
        } catch (e) {
          // Response is not JSON, use default message
        }
        handleTokenExpiration();
        throw new Error(errorMessage);
      }

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