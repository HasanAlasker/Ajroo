import { useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopNav from "../../components/general/TopNav";
import Navbar from "../../components/general/Navbar";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";

function Requests(props) {
  const [activeTab, setActiveTab] = useState("Got");
  const { user } = useUser();

  const renderContent = () => {
    switch (activeTab) {
      case "Sent":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"iRequested"}
              emptyMessage="You haven't requested items yet"
            ></PostRenderer>
          </>
        );
      case "Got":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"myRequested"}
              emptyMessage="You haven't received any requests yet"
            ></PostRenderer>
          </>
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
