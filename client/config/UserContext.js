// contexts/UserContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  return user?.role === 'admin';
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
      // TODO: Replace with actual API call
      // const response = await fetch('your-api-endpoint/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // Mock API response - check for admin email
      const isAdminUser = email === 'admin@ajroo.com'; // Example admin check
      
      const mockResponse = {
        success: true,
        user: {
          id: "1",
          name: isAdminUser ? "Admin User" : "Default User",
          email: email,
          phone: "0776252987",
          gender: "male",
          avatar: null,
          rating: null,
          role: isAdminUser ? "admin" : "user", // Set role based on email
          createdAt: new Date().toISOString(),
        },
        token: "mock-jwt-token-" + Date.now(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mockResponse.success) {
        await storeUserData(mockResponse.user, mockResponse.token);
        dispatch({
          type: USER_ACTION_TYPES.LOGIN_SUCCESS,
          payload: {
            user: mockResponse.user,
            token: mockResponse.token,
          },
        });
        return { success: true };
      } else {
        dispatch({
          type: USER_ACTION_TYPES.LOGIN_FAILURE,
          payload: mockResponse.message || "Login failed",
        });
        return { success: false, error: mockResponse.message };
      }
    } catch (error) {
      dispatch({
        type: USER_ACTION_TYPES.LOGIN_FAILURE,
        payload: error.message || "Network error occurred",
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('your-api-endpoint/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userData),
      // });
      // const data = await response.json();

      // Mock API response for now - new users are regular users by default
      const mockResponse = {
        success: true,
        user: {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          avatar: null,
          rating: null,
          role: "user", // Default role for new registrations
          createdAt: new Date().toISOString(),
        },
        token: "mock-jwt-token-" + Date.now(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (mockResponse.success) {
        await storeUserData(mockResponse.user, mockResponse.token);
        dispatch({
          type: USER_ACTION_TYPES.REGISTER_SUCCESS,
          payload: {
            user: mockResponse.user,
            token: mockResponse.token,
          },
        });
        return { success: true };
      } else {
        dispatch({
          type: USER_ACTION_TYPES.REGISTER_FAILURE,
          payload: mockResponse.message || "Registration failed",
        });
        return { success: false, error: mockResponse.message };
      }
    } catch (error) {
      dispatch({
        type: USER_ACTION_TYPES.REGISTER_FAILURE,
        payload: error.message || "Network error occurred",
      });
      return { success: false, error: error.message };
    }
  };

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
  const updateProfile = async (updatedData) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('your-api-endpoint/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${state.token}`,
      //   },
      //   body: JSON.stringify(updatedData),
      // });

      // Mock successful update
      const updatedUser = { ...state.user, ...updatedData };
      await storeUserData(updatedUser, state.token);

      dispatch({
        type: USER_ACTION_TYPES.UPDATE_PROFILE,
        payload: updatedData,
      });

      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({
        type: USER_ACTION_TYPES.SET_ERROR,
        payload: error.message || "Failed to update profile",
      });
      return { success: false, error: error.message };
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