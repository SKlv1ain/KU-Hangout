import api from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:8000'

export interface User {
  id: number;
  username: string;
  display_name?: string;
  role: string;
  avg_rating: number;
  review_count: number;
  contact?: string;
  profile_picture?: string;
  bio?: string;
}

export interface UpdateUserPayload {
  username?: string;
  display_name?: string;
  contact?: string;
  profile_picture?: File;
  bio?: string;
}

// Get user by ID
export async function getUserById(userId: number): Promise<User> {
  const response = await fetch(`${BASE_URL}/users/${userId}/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('kh_token')}`
    }
  });
  return response.json();
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  payload: UpdateUserPayload
): Promise<User> {
  const formData = new FormData();

  if (payload.username) {
    formData.append("username", payload.username);
  }
  if (payload.display_name) {
    formData.append("display_name", payload.display_name);
  }
  if (payload.contact) {
    formData.append("contact", payload.contact);
  }
  if (payload.bio) {
    formData.append("bio", payload.bio);
  }
  if (payload.profile_picture) {
    formData.append("profile_picture", payload.profile_picture);
  }

  const response = await fetch(`${BASE_URL}/users/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('kh_token')}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.detail || 'Failed to update profile');
  }
  
  return response.json();
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/users/list/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('kh_token')}`
    }
  });
  return response.json();
}
