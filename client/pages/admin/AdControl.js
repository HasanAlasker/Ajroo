import React, { act, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import TopNav from "../../components/general/TopNav";
import AdRenderer from "../../components/AdRenderer";
import useApi from "../../hooks/useApi";
import { activateAd, getActiveAds, getAllAds, getInactiveAds } from "../../api/ads";

function AdControl(props) {
  const { data: ads, request: fetchAds, loading } = useApi(getAllAds);

  const {
    data: activeAds,
    request: fetchActiveAds,
    loadingActive,
  } = useApi(getActiveAds);

  const {
    data: inactiveAds,
    request: fetchInctiveAds,
    loadingInactive,
  } = useApi(getInactiveAds);

  const [refresh, setRefresh] = useState(false);
  const [active, setActive] = useState("Active");

  useEffect(() => {
    fetchActiveAds();
    fetchInctiveAds();
  }, []);

  console.log("active: ", activeAds)
  console.log("inactive: ", inactiveAds)

  const handleRefresh = async () => {
    fetchActiveAds();
    fetchInctiveAds();
  };

  const handleTabChange = () => {
    if (active === "Active") setActive("Inactive");
    else setActive("Active");
  };

  return (
    <SafeScreen>
      <TopNav activeTab={active} onTabChange={handleTabChange} />
      {active === "Active" && (
        <AdRenderer
          fetchedAds={activeAds}
          onRefresh={handleRefresh}
          refreshing={refresh}
        />
      )}
      {active === "Inactive" && (
        <AdRenderer
          fetchedAds={inactiveAds}
          onRefresh={handleRefresh}
          refreshing={refresh}
        />
      )}
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default AdControl;
