// contexts/UserContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser, loginUser, updateUser } from "../api/user";

// Define action types for the reducer
const USER_ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  RESTORE_USER: "RESTORE_USER",
};

// Initial state for the user context
const initialState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true, // Start with true to check for stored auth
  error: null,
  token: null,
};

// Helper function to check if user is admin
const checkIsAdmin = (user) => {
  return user?.role === "admin";
};

// Reducer function to manage state changes
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case USER_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: checkIsAdmin(action.payload.user),
        isLoading: false,
        error: null,
      };

    case USER_ACTION_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: checkIsAdmin(action.payload.user),
        isLoading: false,
        error: null,
      };

    case USER_ACTION_TYPES.LOGIN_FAILURE:
    case USER_ACTION_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: action.payload,
      };

    case USER_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: null,
      };

    case USER_ACTION_TYPES.UPDATE_PROFILE:
      const updatedUser = { ...state.user, ...action.payload };
      return {
        ...state,
        user: updatedUser,
        isAdmin: checkIsAdmin(updatedUser),
        error: null,
      };

    case USER_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case USER_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case USER_ACTION_TYPES.RESTORE_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: checkIsAdmin(action.payload.user),
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create the context
const UserContext = createContext();

// UserProvider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Storage keys
  const STORAGE_KEYS = {
    USER: "@ajroo_user",
    TOKEN: "@ajroo_token",
  };

  // Helper function to store user data
  const storeUserData = async (user, token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  // Helper function to clear stored user data
  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  };

  // Function to restore user session on app start
  const restoreUser = async () => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const [storedUser, storedToken] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TOKEN,
      ]);

      const user = storedUser[1] ? JSON.parse(storedUser[1]) : null;
      const token = storedToken[1];

      if (user && token) {
        // Here you would typically validate the token with your backend
        // For now, we'll assume it's valid
        dispatch({
          type: USER_ACTION_TYPES.RESTORE_USER,
          payload: { user, token },
        });
      } else {
        dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Login function
  const login = async (email, password) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await loginUser({ email, password });

      if (!response || !response._id) {
        throw new Error("Invalid response from server");
      }

      const user = {
        id: response._id,
        name: response.name,
        email: email,
        phone: response.phone,
        gender: response.gender,
        avatar: response.image || null,
        isRated: response.isRated,
        rating: response.rating || null,
        ratingCount: response.ratingCount || 0,
        role: response.role || "user",
        createdAt: response.createdAt || new Date().toISOString(),
      };

      await storeUserData(user, response.token);

      dispatch({
        type: USER_ACTION_TYPES.LOGIN_SUCCESS,
        payload: {
          user: user,
          token: response.token,
        },
      });

      return { success: true };
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.message.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Please enter a valid email address")) {
        errorMessage = "Please enter a valid email address";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Check your connection";
      } else {
        errorMessage = error.message || "Something went wrong";
      }

      dispatch({
        type: USER_ACTION_TYPES.LOGIN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Add this debugging version to your UserContext register function:

  const register = async (userData) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await registerUser(userData);

      const user = {
        id: response._id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        gender: response.gender,
        avatar: response.image || null,
        isRated: response.isRated || false,
        rating: response.rating || null,
        ratingCount: response.ratingCount || 0,
        role: response.role || "user",
        createdAt: response.createdAt || new Date().toISOString(),
      };

      // Store user data
      await storeUserData(user, response.token);

      dispatch({
        type: USER_ACTION_TYPES.REGISTER_SUCCESS,
        payload: {
          user: user,
          token: response.token,
        },
      });

      // Add a small delay to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      return { success: true, user: user };
    } catch (error) {
      console.log("ERROR in register:", error);
      let errorMessage = "Registration failed";

      if (error.message.includes("already registered")) {
        errorMessage = "This email is already registered";
      } else if (error.message.includes("Please enter a valid email address")) {
        errorMessage = "Please enter a valid email address";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again later";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Check your connection";
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: USER_ACTION_TYPES.REGISTER_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Also add logs to your Signin handleSubmit:
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    console.log("=== SIGNIN SUBMIT START ===");
    setHasBeenSubmitted(true);

    const { confirmPassword, ...userData } = values;

    try {
      console.log("Calling register with:", userData);
      const result = await register(userData);
      console.log("Register returned:", result);

      if (result && result.success) {
        console.log("Registration successful! User:", result.user);
        // Check the user state here
        console.log("Current user context after register:", user);
      } else {
        console.log("Registration failed:", result?.error);
        setStatus({
          type: "error",
          message: result?.error || "Failed to register.",
        });
      }
    } catch (error) {
      console.error("Exception in handleSubmit:", error);
      setStatus({
        type: "error",
        message: error.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
      console.log("=== SIGNIN SUBMIT END ===");
    }
  };

  // Also check your reducer - add a log there:

  // Logout function
  const logout = async () => {
    try {
      await clearUserData();
      dispatch({ type: USER_ACTION_TYPES.LOGOUT });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Update profile function
  const updateProfile = async (id, updatedData) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      // const response = await updateUser(id, updatedData, state.token);

      dispatch({
        type: USER_ACTION_TYPES.UPDATE_PROFILE,
      });

      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      let errorMessage = "Failed to update profile";

      if (error.message.includes("Forbidden")) {
        errorMessage = "You can only edit your own profile";
      } else if (error.message.includes("404")) {
        errorMessage = "User not found";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again";
      } else {
        errorMessage = error.message || "Failed to update profile";
      }

      dispatch({
        type: USER_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });
  };

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    return state.isAuthenticated && state.user && state.token;
  };

  // Check if user is admin (fixed function)
  const isUserAdmin = () => {
    return state.isAuthenticated && state.isAdmin;
  };

  // Get user's full name
  const getUserDisplayName = () => {
    return state.user?.name || "User";
  };

  // Get user's id
  const getUserId = () => {
    return state.user?.id;
  };

  // Get user's role
  const getUserRole = () => {
    return state.user?.role || "user";
  };

  // Check if user has completed profile
  const isProfileComplete = () => {
    if (!state.user) return false;
    const requiredFields = ["name", "email", "phone", "gender"];
    return requiredFields.every((field) => state.user[field]);
  };

  // Restore user session when component mounts
  useEffect(() => {
    restoreUser();
  }, []);

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin, // Now exposed in context
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,

    // Utilities
    isUserAuthenticated,
    isUserAdmin,
    getUserDisplayName,
    getUserId,
    getUserRole, // New utility function
    isProfileComplete,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
