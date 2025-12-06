import { View, StyleSheet, FlatList } from "react-native";
import AppText from "../config/AppText";
import NewsCard from "./NewsCard";

function NewsRenderer({
  refreshing,
  onRefresh,
  children,
  emptyMessage = "No news found",
  fetchedNews = [],
}) {
  const renderNews = ({ item: news }) => {
    return (
      <NewsCard
        backGroundColor={news.backGroundColor}
        textColor={news.textColor}
        title={news.title}
        createdAt={news.createdAt}
        description={news.description}
        icon={news?.icon}
      />
    );
  };
  return (
    <FlatList
      data={fetchedNews}
      renderItem={renderNews}
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
export default NewsRenderer;
