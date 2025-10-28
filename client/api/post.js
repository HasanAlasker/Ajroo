import { apiClient } from "./client";

const endPoint = "/posts"

export const getPosts = () => apiClient.get(endPoint)