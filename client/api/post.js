import { apiClient } from "./client";

const endPoint = "/api/posts";

export const getPosts = () => apiClient.get(endPoint); // ✅

export const availablePosts = () => apiClient.get(`${endPoint}/available`); // ✅

export const getUserPosts = (id) => apiClient.get(`${endPoint}/user/${id}`); // ✅

export const getPostById = (id) => apiClient.get(`${endPoint}/${id}`); // ✅

export const addPost = (data) => apiClient.post(`${endPoint}`, data); // ✅

export const editPost = (id, data) =>
  apiClient.put(`${endPoint}/edit/${id}`, data); // ✅

export const softDelete = (id) =>
  apiClient.put(`${endPoint}/soft-delete/${id}`); // ✅

export const getDeletedPosts = () => apiClient.get(`${endPoint}/deleted`);

export const unDelete = (id) => apiClient.put(`${endPoint}/un-delete/${id}`); // ✅

export const deletePost = (id) => apiClient.delete(`${endPoint}/delete/${id}`); // ✅

export const updateStatus = (id, data) =>
  apiClient.put(`${endPoint}/status/${id}`, data); // ✅

export const rateItem = (id, rating) =>
  apiClient.put(`${endPoint}/rate/${id}`, { rating }); // ✅

export const searchPosts = (filters = {}) => {
  // Build query string from filters object
  const queryParams = new URLSearchParams();

  // Only add parameters that have values
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.city) queryParams.append("city", filters.city);
  if (filters.area) queryParams.append("area", filters.area);
  if (filters.condition) queryParams.append("condition", filters.condition);
  if (filters.status) queryParams.append("status", filters.status);

  // Convert to string: "name=camera&city=Amman"
  const queryString = queryParams.toString();

  // Make request with query string
  return apiClient.get(
    `${endPoint}/search${queryString ? `?${queryString}` : ""}`
  );
};
