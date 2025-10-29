import { apiClient } from "./client";

const endPoint = "/api/reports";

export const reportPost = (id, data) =>
  apiClient.post(`${endPoint}/post/${id}`, data);

export const reportUser = (id, data) =>
  apiClient.post(`${endPoint}/user/${id}`, data);

export const deleteReport = (id) =>
  apiClient.delete(`${endPoint}/delete/${id}`);
