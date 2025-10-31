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

export const updateUser = async (id, updatedData, token) => {  // ✅
  try {
    const response = await fetch(`${BASE_URL}/api/users/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const responseData = await response.json();

    return responseData
    
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
};

export const getAllusers = () => apiClient.get(endPoint)  

export const getMyProfile = () => apiClient.get(`${endPoint}/me`)

export const getOthersProfile = (id) => apiClient.get(`${endPoint}/${id}`)

export const deleteUser = (id) => apiClient.delete(`${endPoint}/delete/${id}`)


