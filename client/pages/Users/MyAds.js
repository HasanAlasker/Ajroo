import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import AdRenderer from "../../components/AdRenderer";
import useApi from "../../hooks/useApi";
import { getMyAds } from "../../api/ads";
import LoadingAd from "../../components/general/LoadingAd";

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
      >
        {(loading || !ads) && <LoadingAd />}
        {(loading || !ads) && <LoadingAd />}
        {(loading || !ads) && <LoadingAd />}
      </AdRenderer>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default MyAds;
