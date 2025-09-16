// API utility functions with the same styling and error handling as login

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PostRequestOptions {
  endpoint: string;
  data: Record<string, any>;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
}

// Get CSRF token from cookies (for Django)
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.substring(0, name.length + 1) === (name + '=')) {
        return decodeURIComponent(trimmedCookie.substring(name.length + 1));
      }
    }
  }
  return null;
}

// Generic POST request function
export async function makePostRequest<T = any>({
  endpoint,
  data,
  method = 'POST',
  headers = {}
}: PostRequestOptions): Promise<ApiResponse<T>> {
  try {
    const formData = new FormData();
    
    // Convert data object to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    const csrfToken = getCsrfToken();
    const requestHeaders: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
      ...headers
    };

    // Add CSRF token if available
    if (csrfToken) {
      requestHeaders['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(endpoint, {
      method,
      body: formData,
      credentials: 'include',
      headers: requestHeaders,
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: responseData
      };
    } else {
      return {
        success: false,
        error: responseData.error || `Request failed with status ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

// Specific API functions for your models

// Plans API
export const plansApi = {
  create: (planData: {
    title: string;
    description: string;
    location: string;
    event_time: string;
    max_people: number;
    lat?: string;
    lng?: string;
  }) => makePostRequest({
    endpoint: '/api/plans/create/',
    data: planData
  }),

  update: (planId: string | number, planData: Partial<{
    title: string;
    description: string;
    location: string;
    event_time: string;
    max_people: number;
    lat?: string;
    lng?: string;
  }>) => makePostRequest({
    endpoint: `/api/plans/${planId}/update/`,
    data: planData,
    method: 'PUT'
  }),

  join: (planId: string | number) => makePostRequest({
    endpoint: `/api/plans/${planId}/join/`,
    data: {}
  }),

  leave: (planId: string | number) => makePostRequest({
    endpoint: `/api/plans/${planId}/leave/`,
    data: {}
  })
};

// Chat API
export const chatApi = {
  sendMessage: (threadId: string | number, message: string) => makePostRequest({
    endpoint: `/api/chat/threads/${threadId}/messages/`,
    data: {
      body: message,
      thread_id: threadId
    }
  }),

  createThread: (planId: string | number, title: string) => makePostRequest({
    endpoint: '/api/chat/threads/create/',
    data: {
      title,
      plan: planId
    }
  }),

  joinThread: (threadId: string | number) => makePostRequest({
    endpoint: `/api/chat/threads/${threadId}/join/`,
    data: {}
  })
};

// Users API 
export const usersApi = {
  register: (userData: {
    username: string;
    password: string;
    email?: string;
  }) => makePostRequest({
    endpoint: '/api/users/register/',
    data: userData
  }),

  login: (credentials: {
    username: string;
    password: string;
  }) => makePostRequest({
    endpoint: '/api/users/login/',
    data: credentials
  }),

  updateProfile: (profileData: Record<string, any>) => makePostRequest({
    endpoint: '/api/users/profile/update/',
    data: profileData,
    method: 'PUT'
  })
};

// Reviews API
export const reviewsApi = {
  create: (reviewData: {
    plan_id: string | number;
    rating: number;
    comment?: string;
  }) => makePostRequest({
    endpoint: '/api/reviews/create/',
    data: reviewData
  }),

  update: (reviewId: string | number, reviewData: {
    rating: number;
    comment?: string;
  }) => makePostRequest({
    endpoint: `/api/reviews/${reviewId}/update/`,
    data: reviewData,
    method: 'PUT'
  })
};

// Generic form submission with the same error handling as login
export async function submitForm(
  endpoint: string,
  formData: Record<string, any>,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH';
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
  }
): Promise<ApiResponse> {
  const response = await makePostRequest({
    endpoint,
    data: formData,
    method: options?.method
  });

  if (response.success && options?.onSuccess) {
    options.onSuccess(response.data);
  } else if (!response.success && options?.onError) {
    options.onError(response.error || 'An error occurred');
  }

  return response;
}
