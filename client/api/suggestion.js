import { apiClient } from "./client";

const endpoint = "/api/suggestions";

export const makeSuggestion = (data) => apiClient.post(endpoint, data);

export const getSuggestions = () => apiClient.post(endpoint);

export const deleteSuggestion = (id) =>
  apiClient.post(`${endpoint}/delete/${id}`);
