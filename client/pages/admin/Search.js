import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import WelcomeCard from "../../components/WelcomeCard";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import SearchBar from "../../components/general/SearchBar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { getPosts } from "../../api/post";

function Search(props) {
  const {data: posts, request: fetchPosts, error, loading} = useApi(getPosts)

  useEffect(()=>{
    
  },[])

  return (
    <SafeScreen>
      <PostRenderer>
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
