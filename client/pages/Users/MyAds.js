import React, { act, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import TopNav from "../../components/general/TopNav";
import AdRenderer from "../../components/AdRenderer";
import useApi from "../../hooks/useApi";
import { getMyAds } from "../../api/ads";

function MyAds(props) {
  const { data: ads, request: fetchAds, loading } = useApi(getMyAds);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const handleRefresh = async () => {
    await fetchAds();
  };

  console.log("myad", ads);

  return (
    <SafeScreen>
      <AdRenderer
        fetchedAds={ads}
        onRefresh={handleRefresh}
        refreshing={refresh}
        emptyMessage="You don't have any ads"
      />
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default MyAds;
