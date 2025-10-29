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
        profilePic={post.user?.image}
        name={post.user?.name}
        userId={post.user?._id}
        image={post.image}
        itemCat={post.category}
        itemName={post.name}
        pricePerDay={post.pricePerDay}
        city={post.city}
        area={post.area}
        condition={post.condition}
        rating={post.rating}
        date={post.createdAt}
        status={post.status}
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