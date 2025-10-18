import { BASE_URL } from "../constants/baseUrl";

export const registerUser = async (data) => {
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

export const loginUser = async ({ email, password }) => {
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
