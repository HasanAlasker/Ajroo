import { apiClient } from "./client";

const endPoint = "/api/news";

export const getAllNews = () => apiClient.get(`${endPoint}/`);

export const getActiveNews = () => apiClient.get(`${endPoint}/active`);

export const createNews = (data) => apiClient.post(`${endPoint}/create`, data);

export const editNews = (id, data) => apiClient.put(`${endPoint}/edit/${id}`, data);

export const deactivateNews = (id) =>
  apiClient.put(`${endPoint}/deactivate/${id}`);

export const activateNews = (id) => apiClient.put(`${endPoint}/activate/${id}`);

export const deleteNews = (id) => apiClient.delete(`${endPoint}/delete/${id}`);
