import api from "./api";

// Create a new plan
export async function createPlan(planData) {
  try {
    console.log('Creating plan with data:', planData);
    console.log('API base URL:', import.meta.env.VITE_API_BASE || 'http://localhost:8000');
    console.log('Full URL:', `${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/plans/create/`);
    
    const response = await api.post("/plans/create/", planData);
    console.log('Plan created successfully:', response);
    return response;
  } catch (error) {
    console.error("Create plan error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);
    throw error;
  }
}

// Get all plans
export async function getPlans(params = {}) {
  try {
    const response = await api.get("/homepage/list/", { params });
    return response;
  } catch (error) {
    console.error("Get plans error:", error);
    throw error;
  }
}

// Get plan by ID
export async function getPlanById(planId) {
  try {
    const response = await api.get(`/homepage/${planId}/`);
    return response;
  } catch (error) {
    console.error("Get plan by ID error:", error);
    throw error;
  }
}

// Update plan
export async function updatePlan(planId, planData) {
  try {
    const response = await api.put(`/plans/${planId}/`, planData);
    return response;
  } catch (error) {
    console.error("Update plan error:", error);
    throw error;
  }
}

// Delete plan
export async function deletePlan(planId) {
  try {
    const response = await api.delete(`/plans/${planId}/`);
    return response;
  } catch (error) {
    console.error("Delete plan error:", error);
    throw error;
  }
}

// Join a plan
export async function joinPlan(planId) {
  try {
    const response = await api.post(`/api/plans/${planId}/join/`);
    return response;
  } catch (error) {
    console.error("Join plan error:", error);
    throw error;
  }
}

// Leave a plan
export async function leavePlan(planId) {
  try {
    const response = await api.post(`/api/plans/${planId}/leave/`);
    return response;
  } catch (error) {
    console.error("Leave plan error:", error);
    throw error;
  }
}
