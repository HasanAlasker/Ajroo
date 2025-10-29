import { apiClient } from "./client";

const endPoint = "/api/posts";

export const getPosts = () => apiClient.get(endPoint); // admin

export const availablePosts = () => apiClient.get(`${endPoint}/available`);

export const getUserPosts = (id) => apiClient.get(`${endPoint}/user/${id}`);

export const getPostById = (id) => apiClient.get(`${endPoint}/${id}`);

export const addPost = (data) => apiClient.post(`${endPoint}`, data);

export const editPost = (id, data) =>
  apiClient.put(`${endPoint}/edit/${id}`, data);

export const softDelete = (id) =>
  apiClient.put(`${endPoint}/soft-delete/${id}`);

export const unDelete = (id) => apiClient.put(`${endPoint}/un-delete/${id}`);

export const deletePost = (id) => apiClient.delete(`${endPoint}/delete/${id}`);

export const updateStatus = (id, data) =>
  apiClient.put(`${endPoint}/status/${id}`, data);
