import { apiClient } from "./client";

const endPoint = "/api/ad";

// Public/User endpoints
export const getAllAds = () => apiClient.get(`${endPoint}/`);

export const getMyAds = () => apiClient.get(`${endPoint}/my-ads`);

export const createAd = (adData) => apiClient.post(`${endPoint}/create`, adData);

// Admin endpoints
export const getInactiveAds = () => apiClient.get(`${endPoint}/inactive`);

export const getNotApprovedAds = () => apiClient.get(`${endPoint}/notApproved`);

export const approveAd = (id) => apiClient.put(`${endPoint}/approve/${id}`);

export const activateAd = (id) => apiClient.put(`${endPoint}/activate/${id}`);

export const deactivateAd = (id) => apiClient.put(`${endPoint}/deactivate/${id}`);

export const editAd = (id, adData) => apiClient.put(`${endPoint}/edit/${id}`, adData);

export const deleteAd = (id) => apiClient.delete(`${endPoint}/delete/${id}`);