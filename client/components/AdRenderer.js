import { View, StyleSheet, FlatList } from "react-native";
import AppText from "../config/AppText";
import AdPost from "./post_releated/AdPost";

function AdRenderer({
  refreshing,
  onRefresh,
  children,
  emptyMessage = "No ads found",
  fetchedAds = [],
}) {
  const renderAds = ({ item: ad }) => {

    return (
      <AdPost
        adId={ad._id}
        userId={ad.user._id}
        userName={ad.user.name}
        userSub={ad.user?.productId}
        userPic={ad.user?.image}
        image={ad.image}
        link={ad.link}
        isActive={ad.isActive}
        isApproved={ad.isApproved}
        createdAt={ad.createdAt}
        expiresAt={ad.expiresAt}
      />
    );
  };
  return (
    <FlatList
      data={fetchedAds}
      renderItem={renderAds}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={() => <EmptyState message={emptyMessage} />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListHeaderComponent={children ? () => children : null}
      showsVerticalScrollIndicator={false}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      contentContainerStyle={{ paddingBottom: 30 }}
      style={styles.box}
    ></FlatList>
  );
}

const EmptyState = ({ message }) => (
  <View
    style={{ paddingHorizontal: 20, paddingVertical: 50, alignItems: "center" }}
  >
    <AppText style={{ fontSize: 16, color: "#999" }}>{message}</AppText>
  </View>
);

const styles = StyleSheet.create({
  box: {},
});

export default AdRenderer;
