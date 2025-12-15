import { View, FlatList } from "react-native";
import SuggestionCard from "./SuggestionCard";
import AppText from "../config/AppText";

function SuggestionRenderer({
  refreshing,
  onRefresh,
  children,
  emptyMessage = "No suggestions found",
  fetchedPosts = [],
}) {
  const renderSuggestion = ({ item: post }) => {
    return (
      <SuggestionCard
        suggestionId={post._id}
        date={post.createdAt}
        title={post.title}
        type={post.type}
        details={post.details}
        userName={post.user?.name}
        userId={post.user?._id}
        userImage={post.user?.image}
      />
    );
  };
  return (
    <FlatList
      data={fetchedPosts}
      renderItem={renderSuggestion}
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
export default SuggestionRenderer;
