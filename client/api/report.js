import { apiClient } from "./client";

const endPoint = "/api/reports";

export const reportedPosts = () => apiClient.get(`${endPoint}/posts`) // ✅

export const reportedUsers = () => apiClient.get(`${endPoint}/users`) 

export const reportPost = (id, data) =>
  apiClient.post(`${endPoint}/post/${id}`, data);

export const reportUser = (id, data) =>
  apiClient.post(`${endPoint}/user/${id}`, data); // ✅

export const deleteReport = (id) =>  
  apiClient.delete(`${endPoint}/delete/${id}`);  // ✅
