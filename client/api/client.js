import { create } from "apisauce";
import { BASE_URL } from "../constants/baseUrl";

export const apiClient = create({
  baseURL: BASE_URL,
});

