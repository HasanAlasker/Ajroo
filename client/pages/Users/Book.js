import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import TopNav from "../../components/general/TopNav";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { givenItems, takenItems } from "../../api/borrow";
import LoadingCircle from "../../components/general/LoadingCircle";
import LoadingSkeleton from "../../components/post_releated/LoadingSkeleton";

function Book(props) {
  const [activeTab, setActiveTab] = useState("Given");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const takenItemsApi = useApi(takenItems);
  const givenItemsApi = useApi(givenItems);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    takenItemsApi.request();
    givenItemsApi.request();
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await takenItemsApi.request();
    await givenItemsApi.request();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingCircle />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Given":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              fetchedPosts={givenItemsApi.data}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              emptyMessage="You haven't lent out any items yet"
            ></PostRenderer>
          </>
        );

      case "Taken":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              fetchedPosts={takenItemsApi.data}
              emptyMessage="You haven't borrowed any items yet"
              refreshing={refreshing}
              onRefresh={handleRefresh}
            >
              {(givenItemsApi.loading || takenItemsApi.loading) && (
                <LoadingSkeleton />
              )}
              {(givenItemsApi.loading || takenItemsApi.loading) && (
                <LoadingSkeleton />
              )}
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

export default Book;
