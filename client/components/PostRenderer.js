import React from "react";
import { FlatList, View } from "react-native";
import AppText from "../config/AppText";
import Post from "./post_releated/Post";

function PostRenderer({
  currentUserId,
  fetchedPosts = [],
  emptyMessage = "No posts found",
  onRefresh,
  refreshing = false,
  children,
}) {

  const renderPost = ({ item: post }) => {
    return (
      <Post
        id={post._id}
        profilePic={post.user?.image || post.reportedPost?.user?.image}
        name={post.user?.name || post.reportedPost?.user?.name}
        userId={post.user?._id || post.reportedPost?.user?._id}
        image={post.image || post.reportedPost?.image}
        itemCat={post.category || post.reportedPost?.category}
        itemName={post.name || post.reportedPost?.name}
        pricePerDay={post.pricePerDay || post.reportedPost?.pricePerDay}
        city={post.city || post.reportedPost?.city}
        area={post.area || post.reportedPost?.area}
        condition={post.condition || post.reportedPost?.condition}
        rating={post?.rating || post.reportedPost?.rating}
        date={post.createdAt}
        status={post.status || post.reportedPost?.status}
        isMine={post.user?._id === currentUserId}
        iRequested={false}  // Simplify for now
        iBorrowed={false}   // Simplify for now
      />
    );
  };

  return (
    <FlatList
      data={fetchedPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item._id}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={() => <EmptyState message={emptyMessage} />}
      ListHeaderComponent={children ? () => children : null}
      showsVerticalScrollIndicator={false}

      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
    />
  );
}

const EmptyState = ({ message }) => (
  <View
    style={{ paddingHorizontal: 20, paddingVertical: 50, alignItems: "center" }}
  >
    <AppText style={{ fontSize: 16, color: "#999" }}>{message}</AppText>
  </View>
);

export default PostRenderer;