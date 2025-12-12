import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import AdRenderer from "../../components/AdRenderer";
import useApi from "../../hooks/useApi";
import { getAllAds } from "../../api/ads";

function AdControl(props) {
  const { data: ads, request: fetchAds, loading } = useApi(getAllAds);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const handleRefresh = async () => {
    await fetchAds();
  };

  return (
    <SafeScreen>
      <AdRenderer
        fetchedAds={ads}
        onRefresh={handleRefresh}
        refreshing={refresh}
      />
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default AdControl;
