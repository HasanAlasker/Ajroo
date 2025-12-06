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

function NewsLog(props) {
  const { data: fetchedNews, request: fetchNews, loading } = useApi(getAllNews);

  const [refresh, setRefresh] = useState(false)

  useEffect(()=>{
    fetchNews()
  },[])

  const handleRefresh = async () => {
    await fetchNews()
  }

  console.log(fetchedNews)
  return (
    <SafeScreen>
      {/* <AppText>Ajroo News Log</AppText> */}
      <NewsRenderer 
        fetchedNews={fetchedNews}
        refreshing={refresh}
        onRefresh={handleRefresh}
      >

      </NewsRenderer>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default NewsLog;
