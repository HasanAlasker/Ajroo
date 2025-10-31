import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import WelcomeCard from "../../components/WelcomeCard";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import SearchBar from "../../components/general/SearchBar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { getPosts } from "../../api/post";
import { useUser } from "../../config/UserContext";

function Search(props) {
  const {user} = useUser()
  const {data: posts, request: fetchPosts, error, loading} = useApi(getPosts)
  const [refresh, setRefresh] = useState(false)

  useEffect(()=>{
    fetchPosts()
  },[])

  const handleRefresh = () => {
    setRefresh(true)
    fetchPosts()
    setRefresh(false)
  }

  return (
    <SafeScreen>
      <PostRenderer
        onRefresh={handleRefresh}
        refreshing={refresh}
        fetchedPosts={posts}
        currentUserId={user.id}
      >
        <SearchBar />
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Search;
