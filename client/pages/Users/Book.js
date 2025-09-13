import { useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import TopNav from "../../components/general/TopNav";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";

function Book(props) {
  const [activeTab, setActiveTab] = useState("Given");
  const { user } = useUser();

  const renderContent = () => {
    switch (activeTab) {
      case "Given":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"myBorrowed"}
              emptyMessage="You haven't lent out any items yet"
            ></PostRenderer>
          </>
        );

      case "Taken":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"iBorrowed"}
              emptyMessage="You haven't borrowed any items yet"
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

export default Book;
