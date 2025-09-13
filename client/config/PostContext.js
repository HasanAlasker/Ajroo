import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load posts from AsyncStorage on app start
  useEffect(() => {
    loadPosts();
  }, []);

  // Load posts from storage
  const loadPosts = async () => {
    try {
      setLoading(true);
      const storedPosts = await AsyncStorage.getItem("posts");
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save posts to storage
  const savePosts = async (postsToSave) => {
    try {
      await AsyncStorage.setItem("posts", JSON.stringify(postsToSave));
    } catch (error) {
      console.error("Error saving posts:", error);
    }
  };

  const addPost = async (postData) => {
    try {
      const newPost = {
        id: Date.now().toString(),
        userImageUri: postData.userImageUri,
        username: postData.username,
        userId: postData.userId || "Unknown User", // Add default if not provided
        image: postData.image,
        category: postData.category,
        item: postData.item,
        price: postData.price,
        city: postData.city,
        area: postData.area,
        condition: postData.condition,
        status: postData.status || "available",
        rating: postData.rating || null,
        requesterId: postData.requesterId || null,
        borrowerId: postData.borrowerId || null,
        requestDuration: postData.requestDuration || null,
        requestUnit: postData.requestUnit || null,
        requestPrice: postData.requestPrice || null,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
      return newPost;
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  };

  // Update post
  const updatePost = async (postId, newPostData) => {
    try {
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? { ...post, ...newPostData, updatedAt: new Date().toISOString() }
          : post
      );
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  };

  // editPost function (alias for updatePost for consistency)
  const editPost = async (postId, newPostData) => {
    return await updatePost(postId, newPostData);
  };

  // Update post status
  const updatePostStatus = async (postId, newStatus) => {
    try {
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? { ...post, status: newStatus, updatedAt: new Date().toISOString() }
          : post
      );
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
    } catch (error) {
      console.error("Error updating post status:", error);
      throw error;
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  // getPostById function
  const getPostById = (postId) => {
    return posts.find((post) => post.id === postId);
  };

  // Get posts by user
  const getPostsByUser = (userId) => {
    return posts.filter((post) => post.userId === userId);
  };

  // Get posts by status
  const getPostsByStatus = (status) => {
    return posts.filter((post) => post.status === status);
  };

  // Get posts by category
  const getPostsByCategory = (category) => {
    return posts.filter((post) => post.category === category);
  };

  // Search posts
  const searchPosts = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(
      (post) =>
        post.item.toLowerCase().includes(lowercaseQuery) ||
        post.category.toLowerCase().includes(lowercaseQuery) ||
        post.city.toLowerCase().includes(lowercaseQuery) ||
        post.area.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    posts,
    loading,
    addPost,
    updatePost,
    editPost, 
    updatePostStatus,
    deletePost,
    getPostById, 
    getPostsByUser,
    getPostsByStatus,
    getPostsByCategory,
    searchPosts,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
};

export default PostContext;