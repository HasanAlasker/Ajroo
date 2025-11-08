import { apiClient } from "./client";

const endpoint = "/api/suggestions";

export const makeSuggestion = (data) => apiClient.post(endpoint, data);

export const getSuggestions = () => apiClient.get(endpoint);

export const deleteSuggestion = (id) =>
  apiClient.delete(`${endpoint}/delete/${id}`);
