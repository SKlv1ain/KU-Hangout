import api from "./api";

// Get current user profile
export async function getCurrentUserProfile() {
  const data = await api.get("/api/users/me");
  return data;
}

// Get user profile by ID
export async function getUserProfile(userId) {
  const data = await api.get(`/users/${userId}/`);
  return data;
}

// Update current user profile
export async function updateUserProfile(userId, profileData) {
  // Handle both regular form data and FormData for file uploads
  const data = await api.patch(`/users/${userId}/`, profileData);
  return data;
}

// Update profile picture only
export async function updateProfilePicture(userId, imageFile) {
  const formData = new FormData();
  formData.append('profile_picture', imageFile);
  
  const data = await api.patch(`/users/${userId}/`, formData);
  return data;
}

// Get all users (for admin or directory purposes)
export async function getAllUsers() {
  const data = await api.get("/users/list/");
  return data;
}

// Create a new user profile
export async function createUserProfile(profileData) {
  const data = await api.post("/users/create/", profileData);
  return data;
}
