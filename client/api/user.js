import { apiClient } from "./client";
import { BASE_URL } from "../constants/baseUrl";

const endPoint = '/api/users'

export const registerUser = async (data) => {  // ✅
  try {
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = response.headers.get("x-auth-token");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const responseData = await response.json();

    return {
      ...responseData,
      token: token, // Add token to response
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loginUser = async ({ email, password }) => {  // ✅
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = response.headers.get("x-auth-token");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const responseData = await response.json();

    return {
      ...responseData,
      token: token, // Add token to response
    };
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
};

// export const loginUser = (email, password) => apiClient.post(`${endPoint}/login`, {email, password})

export const updateUser = (id, data) => apiClient.put(`${endPoint}/edit/${id}`, data) // ✅

export const getAllusers = () => apiClient.get(endPoint)  

export const getUserById = (id) => apiClient.get(`${endPoint}/${id}`) // ✅

export const deleteUser = (id) => apiClient.delete(`${endPoint}/delete/${id}`)

export const rateUser = (id, rating) => apiClient.put(`${endPoint}/rate/${id}`, {rating})

export const blockUser = (id) => apiClient.put(`${endPoint}/block/${id}`)

export const getBlockedUsers = () => apiClient.get(`${endPoint}/blocked`)



