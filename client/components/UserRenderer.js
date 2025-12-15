import { View, FlatList } from "react-native";
import AppText from "../config/AppText";
import UserCard from "./UserCard";

function UserRenderer({
  refreshing,
  onRefresh,
  children,
  emptyMessage = "No users found",
  fetchedPosts = [],
}) {
  const renderUser = ({ item: user }) => {
    return (
      <UserCard
        userId={user._id}
        createdAt={user.createdAt}
        image={user.image}
        gender={user.gender}
        name={user.name}
        rating={user?.rating}
        ratingCount={user?.ratingCount}
        strikes={user?.strikes}
      />
    );
  };
  return (
    <FlatList
      data={fetchedPosts}
      renderItem={renderUser}
      keyExtractor={(user) => user._id}
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
    >
      {children}
    </FlatList>
  );
}

const EmptyState = ({ message }) => (
  <View
    style={{ paddingHorizontal: 20, paddingVertical: 50, alignItems: "center" }}
  >
    <AppText style={{ fontSize: 16, color: "#999" }}>{message}</AppText>
  </View>
);
export default UserRenderer;
