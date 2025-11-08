import { StyleSheet } from "react-native";
import Navbar from "../../components/general/Navbar";
import SearchBar from "../../components/general/SearchBar";
import SafeScreen from "../../components/general/SafeScreen";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import { useState } from "react";
import useApi from "../../hooks/useApi";
import { availablePosts } from "../../api/post";
import { useEffect } from "react";
import LoadingCircle from "../../components/general/LoadingCircle";

function Have(props) {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: posts,
    error,
    loading,
    request: fetchPosts,
  } = useApi(availablePosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading && !posts) {
    return <LoadingCircle />;
  }

  return (
    <SafeScreen>
      <PostRenderer
        fetchedPosts={posts}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage="No one has posted yet"
        currentUserId={user.id}
      >
        <SearchBar></SearchBar>
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
  });

export default Have;
