import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import useApi from "../../hooks/useApi";
import { getAllNews } from "../../api/news";
import NewsRenderer from "../../components/NewsRenderer";
import { useUser } from "../../config/UserContext";
import AddHoverBtn from "../../components/general/AddHoverBtn";
import { useNavigation } from "@react-navigation/native";
import LoadingNews from "../../components/general/LoadingNews";

function NewsLog(props) {
  const { data: fetchedNews, request: fetchNews, loading } = useApi(getAllNews);
  const { user } = useUser();
  const navigation = useNavigation();

  const [refresh, setRefresh] = useState(false);
  const isAdmin = user.role === "admin";

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = async () => {
    await fetchNews();
  };

  const handleAddBtn = () => {
    if (isAdmin) navigation.navigate("AddNews");
  };

  return (
    <SafeScreen>
      {/* <AppText>Ajroo News Log</AppText> */}
      <NewsRenderer
        fetchedNews={fetchedNews}
        refreshing={refresh}
        onRefresh={handleRefresh}
      >
        {isAdmin && <AddHoverBtn onPress={handleAddBtn} />}
        {(loading || !fetchedNews) && <LoadingNews />}
        {(loading || !fetchedNews) && <LoadingNews />}
        {(loading || !fetchedNews) && <LoadingNews />}
        {(loading || !fetchedNews) && <LoadingNews />}
        {(loading || !fetchedNews) && <LoadingNews />}
        {(loading || !fetchedNews) && <LoadingNews />}
      </NewsRenderer>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({});

export default NewsLog;
