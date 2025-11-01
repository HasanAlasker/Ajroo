import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopNav from "../../components/general/TopNav";
import Navbar from "../../components/general/Navbar";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { gotRequests, sentRequests } from "../../api/request";

function Requests(props) {
  const [activeTab, setActiveTab] = useState("Got");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const gotRequestsApi = useApi(gotRequests);
  const sentRequestsApi = useApi(sentRequests);

  useEffect(() => {
    sentRequestsApi.request();
    gotRequestsApi.request();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await sentRequestsApi.request();
    await gotRequestsApi.request();
    setRefreshing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Sent":
        return (
          <PostRenderer
            currentUserId={user.id}
            fetchedPosts={sentRequestsApi.data}
            emptyMessage="You haven't requested items yet"
            refreshing={refreshing}
            onRefresh={handleRefresh}
          ></PostRenderer>
        );
      case "Got":
        return (
          <PostRenderer
            currentUserId={user.id}
            fetchedPosts={gotRequestsApi.data}
            emptyMessage="You haven't received any requests yet"
            refreshing={refreshing}
            onRefresh={handleRefresh}
          ></PostRenderer>
        );
      default:
      // return <SentContent />;
    }
  };

  return (
    <SafeScreen>
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Requests;
