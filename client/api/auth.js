import { BASE_URL } from "../constants/baseUrl";

const endPoint = "/api/auth";

export const sendOtp = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}${endPoint}/send-otp`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (err) {
    console.error("Send OTP error:", err);
    throw err;
  }
};

// api/auth.js - Update these functions
export const verifyOtp = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}${endPoint}/verify-otp`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = response.headers.get("x-auth-token");

    if (!response.ok) {
      // Parse error as JSON
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const responseData = await response.json();

    return {
      ...responseData,
      token: token,
    };
  } catch (err) {
    console.error("Verify OTP error:", err);
    throw err;
  }
};

export const resendOtp = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}${endPoint}/resend-otp`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (err) {
    console.error("Resend OTP error:", err);
    throw err;
  }
};