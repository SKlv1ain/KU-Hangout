import api from "./api.js";

// สร้างโพสต์ใหม่
export async function createPost(payload) {
  // payload: { title, description, location, event_time, max_people, tags }
  
  // Create FormData for post creation
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('location', payload.location);
  formData.append('event_time', payload.event_time);
  formData.append('max_people', payload.max_people.toString());
  formData.append('tags', payload.tags);
  
  const { data } = await api.post("/api/plans/create/", formData);
  return data;
}
