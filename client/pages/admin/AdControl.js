import React, { act, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import TopNav from "../../components/general/TopNav";
import AdRenderer from "../../components/AdRenderer";
import useApi from "../../hooks/useApi";
import { getActiveAds, getInactiveAds } from "../../api/ads";
import LoadingAd from "../../components/general/LoadingAd";

function AdControl(props) {
  const {
    data: activeAds,
    request: fetchActiveAds,
    loading: loadingActive,
  } = useApi(getActiveAds);

  const {
    data: inactiveAds,
    request: fetchInactiveAds,
    loading: loadingInactive,
  } = useApi(getInactiveAds);

  const [active, setActive] = useState("Active");

  useEffect(() => {
    fetchActiveAds();
    fetchInactiveAds();
  }, []);

  const handleRefresh = async () => {
    if (active === "Active") {
      await fetchActiveAds();
    } else {
      await fetchInactiveAds();
    }
  };

  const handleTabChange = () => {
    setActive(active === "Active" ? "Inactive" : "Active");
  };

  // Determine which data and loading state to use
  const currentAds = active === "Active" ? activeAds : inactiveAds;
  const currentLoading = active === "Active" ? loadingActive : loadingInactive;

  return (
    <SafeScreen>
      <TopNav activeTab={active} onTabChange={handleTabChange} />
      <AdRenderer
        fetchedAds={currentAds}
        onRefresh={handleRefresh}
        refreshing={currentLoading}
      >
        {currentLoading && (
          <>
            <LoadingAd />
            <LoadingAd />
            <LoadingAd />
            <LoadingAd />
          </>
        )}
      </AdRenderer>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default AdControl;
