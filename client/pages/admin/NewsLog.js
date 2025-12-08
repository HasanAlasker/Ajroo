import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import AppText from "../../config/AppText";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import useApi from "../../hooks/useApi";
import { getAllNews } from "../../api/news";
import NewsCard from "../../components/NewsCard";
import NewsRenderer from "../../components/NewsRenderer";
import { useUser } from "../../config/UserContext";
import AddHoverBtn from "../../components/general/AddHoverBtn";
import { useNavigation, useRoute } from "@react-navigation/native";

function NewsLog(props) {
  const { data: fetchedNews, request: fetchNews, loading } = useApi(getAllNews);
  const { user } = useUser();
  const navigation = useNavigation();

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = async () => {
    await fetchNews();
  };

  const handleAddBtn = () => {
    if (user.role === "admin") navigation.navigate("AddNews");
  };

  console.log(fetchedNews);
  return (
    <SafeScreen>
      {/* <AppText>Ajroo News Log</AppText> */}
      <NewsRenderer
        fetchedNews={fetchedNews}
        refreshing={refresh}
        onRefresh={handleRefresh}
      ></NewsRenderer>
      <AddHoverBtn onPress={handleAddBtn}/>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({});

export default NewsLog;
