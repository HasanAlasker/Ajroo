import { StyleSheet } from "react-native";
import Navbar from "../../components/general/Navbar";
import SearchBar from "../../components/general/SearchBar";
import SafeScreen from "../../components/general/SafeScreen";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import { useState } from "react";

function Have(props) {
  const { user } = useUser();

  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // refresh posts logic here
    setRefreshing(false);
  };

  return (
    <SafeScreen>
      <PostRenderer filterType={"browsable"} refreshing={refreshing} onRefresh={handleRefresh} emptyMessage="No one has posted yet" currentUserId={user.id}>
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
