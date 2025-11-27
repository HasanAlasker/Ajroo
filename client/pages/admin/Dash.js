import React, { useEffect, useState } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import AdminCard from "../../components/AdminCard";
import LoadingCircle from "../../components/general/LoadingCircle";
import useApi from "../../hooks/useApi";
import { getStats } from "../../api/admin"; // New API function
import AlertModal from '../../components/general/AlertModal'

function Dash(props) {
  const [refreshing, setRefreshing] = useState(false);

  // Single API call for all stats
  const { data: stats, error, loading, request: fetchStats } = useApi(getStats);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return <LoadingCircle />;
  }

  // Default values if stats not loaded yet
  const dashboardData = stats || {
    totalUsers: 0,
    totalAdmins: 0,
    totalPosts: 0,
    activePosts: 0,
    disabledPosts: 0,
    deletedPosts: 0,
    takenItems: 0,
    activeReports: 0,
    usersProfit: 0,
    appProfit: 0,
    blockedUsers: 0,
    totalSubscribers: 0,
    freeUsers: 0,
    proUsers: 0,
    businessStarter: 0,
    businessPremium: 0,
  };

  return (
    <SafeScreen>
      <ScrollScreen>
        <View style={styles.container}>
          <AdminCard
            title={"Total Users"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.totalUsers}
          />
          <AdminCard
            title={"Total Admins"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.totalAdmins}
          />
          <AdminCard
            title={"Total Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.totalPosts}
          />
          <AdminCard
            title={"Available Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.activePosts}
          />
          <AdminCard
            title={"Disabled Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.disabledPosts}
          />
          <AdminCard
            title={"Deleted Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.deletedPosts}
          />
          <AdminCard
            title={"Taken Items"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.takenItems}
          />
          <AdminCard
            title={"Active Reports"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.activeReports}
          />
          {/* <AdminCard
            title={"Users Profit"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={`$${dashboardData.usersProfit.toFixed(2)}`}
          />
          <AdminCard
            title={"App Profit"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={`$${dashboardData.appProfit.toFixed(2)}`}
          /> */}
          <AdminCard
            title={"Blocked Users"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.blockedUsers}
          />
          <AdminCard
            title={"Total Subscribers"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.totalSubs}
          />
          <AdminCard
            title={"Individual - Free"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={dashboardData.freeUsers}
          />
          <AdminCard
            title={"Individual - Pro"}
            backColor={"purple"}
            borderColor={"purple"}
            color={"always_white"}
            value={dashboardData.proSubs}
          />
          <AdminCard
            title={"Business - Starter"}
            backColor={"green"}
            borderColor={"green"}
            color={"always_white"}
            value={dashboardData.starterSubs}
          />
          <AdminCard
            title={"Business - Premium"}
            backColor={"gold"}
            borderColor={"gold"}
            color={"always_white"}
            value={dashboardData.premiumSubs}
          />
        </View>
      </ScrollScreen>
      <AlertModal />
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default Dash;
