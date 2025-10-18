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

    if (!response.ok) {
      throw new Error(response.status);
    }

    return await response.json();

  } catch (err) {
    console.error(err);
    throw err;
  }
};
