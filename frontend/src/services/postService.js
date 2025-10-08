import api from "./api.js";

// Create a new plan
export async function createPost(payload) {
  // payload.tags must be an array of objects: [{name:"tag1"}, {name:"tag2"}]
  const postData = {
    title: payload.title,
    description: payload.description,
    location: payload.location,
    event_time: payload.event_time,
    max_people: payload.max_people,
    tags: payload.tags
  };

  // Send JSON directly
  const { data } = await api.post("/plans/create/", postData);
  return data;
}