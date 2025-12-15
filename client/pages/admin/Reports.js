import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import SearchBar from "../../components/general/SearchBar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { reportedPosts } from "../../api/report";
import { useUser } from "../../config/UserContext";
import LoadingSkeleton from "../../components/post_releated/LoadingSkeleton";

function Reports(props) {
  const { user } = useUser();
  const [refresh, setRefresh] = useState(false);
  const {
    data: posts,
    request: fetchPosts,
    error,
    loading,
  } = useApi(reportedPosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = () => {
    setRefresh(true);
    fetchPosts();
    setRefresh(false);
  };

  return (
    <SafeScreen>
      <PostRenderer
        currentUserId={user.id}
        onRefresh={handleRefresh}
        refreshing={refresh}
        fetchedPosts={posts}
      >
        <SearchBar />
        {(loading || !posts) && <LoadingSkeleton/>}
        {(loading || !posts) && <LoadingSkeleton/>}
        {(loading || !posts) && <LoadingSkeleton/>}
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Reports;
