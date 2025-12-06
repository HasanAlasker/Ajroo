import React from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import AppText from "../../config/AppText";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import useApi from "../../hooks/useApi";
import { getAllNews } from "../../api/news";

function NewsLog(props) {

  const { data: fetchedNews, request: fetchNews, loading } = useApi(getAllNews);
  
  return (
    <SafeScreen>
      {/* <AppText>Ajroo News Log</AppText> */}
      <ScrollScreen></ScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default NewsLog;
