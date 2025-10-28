import { apiClient } from "./client";

const endPoint = "/api/posts"

export const getPosts = () => apiClient.get(endPoint)