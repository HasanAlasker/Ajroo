import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopNav from "../../components/general/TopNav";
import Navbar from "../../components/general/Navbar";
import PostRenderer from "../../components/PostRenderer";

function Blocks(props) {
  const [activeTab, setActiveTab] = useState("Users");

  const renderContent = () => {
    switch (activeTab) {
      case "Users":
        return (
          <>
            <PostRenderer
              emptyMessage="No blocked users found"
              
            ></PostRenderer>
          </>
        );

      case "Posts":
        return (
          <>
            <PostRenderer
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
