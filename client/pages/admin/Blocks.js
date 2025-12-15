import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopNav from "../../components/general/TopNav";
import Navbar from "../../components/general/Navbar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { getDeletedPosts } from "../../api/post";
import { useUser } from "../../config/UserContext";
import { getBlockedUsers } from "../../api/user";
import UserRenderer from "../../components/UserRenderer";
import LoadingSkeleton from "../../components/post_releated/LoadingSkeleton";

function Blocks(props) {
  const [activeTab, setActiveTab] = useState("Users");
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useUser();

  const {
    data: deletedPosts,
    request: fetchPosts,
    loading,
    error,
  } = useApi(getDeletedPosts);

  const {
    data: blockedUsers,
    request: fetchUsers,
    loading: fetchingUsers,
  } = useApi(getBlockedUsers);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    await fetchPosts();
    await fetchUsers();
  };

  if (loading && !deletedPosts) {
    return <LoadingCircle />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return (
          <>
            <UserRenderer
              onRefresh={handleRefresh}
              refreshing={refreshing}
              fetchedPosts={blockedUsers}
              emptyMessage="No blocked users found"
            >
              {(fetchingUsers || !blockedUsers) && <LoadingSkeleton />}
              {(fetchingUsers || !blockedUsers) && <LoadingSkeleton />}
            </UserRenderer>
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
              showUndelete={true}
            >
              {(loading || !deletedPosts) && <LoadingSkeleton /> }
            </PostRenderer>
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
