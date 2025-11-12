import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopNav from "../../components/general/TopNav";
import Navbar from "../../components/general/Navbar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { getDeletedPosts } from "../../api/post";
import { useUser } from "../../config/UserContext";

function Blocks(props) {
  const [activeTab, setActiveTab] = useState("Users");
  const [refreshing, setRefreshing] = useState(false);

  const {user} = useUser()

  const {
    data: deletedPosts,
    request: fetchPosts,
    loading,
    error,
  } = useApi(getDeletedPosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    await fetchPosts();
  };

  if (loading && !deletedPosts) {
    return <LoadingCircle />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return (
          <>
            <PostRenderer emptyMessage="No blocked users found"></PostRenderer>
          </>
        );

      case "Posts":
        return (
          <>
            <PostRenderer
              fetchedPosts={deletedPosts}
              currentUserId={user.id}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              emptyMessage="No deleted posts found"
            ></PostRenderer>
          </>
        );
      default:
    }
  };

  return (
    <SafeScreen>
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Blocks;
