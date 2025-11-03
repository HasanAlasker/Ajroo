import { apiClient } from "./client";

const endPoint = "/api/requests";

export const getRequestById = (id) => apiClient.get(`${endPoint}/${id}`)  // ✅

export const createRequest = (id, data) =>
  apiClient.post(`${endPoint}/${id}`, data);  // ✅

export const deleteRequest = (id) => apiClient.delete(`${endPoint}/${id}`);  // ✅

export const confirmRequest = (id, data) =>
  apiClient.post(`${endPoint}/borrow/${id}`, data);

export const gotRequests = () => apiClient.get(`${endPoint}/got`); // ✅

export const sentRequests = () => apiClient.get(`${endPoint}/sent`); // ✅
