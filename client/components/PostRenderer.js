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
    let isMine = false;

    // For regular posts
    if (post.user?._id) {
      isMine = post.user._id === currentUserId;
    }
    // For borrows (I'm the owner)
    else if (post.owner?._id) {
      isMine = post.owner._id === currentUserId;
    }
    // For requests (I'm the requester)
    else if (post.requester?._id) {
      isMine = post.requester._id !== currentUserId;
    }
    // For reported posts
    else if (post.reportedPost?.user?._id) {
      isMine = post.reportedPost.user._id === currentUserId;
    }

    return (
      <Post
        id={post?.reportedPost?._id || post?.item?._id || post._id}
        reportId={post._id} // this one the the 3 under are the difenition of: if it works dont touch it, here is and explination: the response from DB for rendering posts has 4 posibilities: normal post in have.js/ a request in requests.js / a borrow in borrow.js / and a report. so the order of them is not stupidity but studied carefully also i have three with the same value but different names to not confuse my self in other places (the main purpose is to not have the post id = to the report/ request/ borrow id and not be able to fetch data i need)
        requestId={post._id}
        borrowId={post._id}
        profilePic={
          post.user?.image ||
          post.reportedPost?.user?.image ||
          post?.owner?.image ||
          post?.requester?.image ||
          post?.borrower?.image
        }
        name={
          post.user?.name ||
          post.reportedPost?.user?.name ||
          post?.owner?.name ||
          post?.requester?.name ||
          post?.borrower?.name
        }
        userId={
          post.user?._id ||
          post.reportedPost?.user?._id ||
          post?.owner?._id ||
          post?.requester?._id ||
          post?.borrower?._id
        }
        image={post.image || post.reportedPost?.image || post?.item?.image}
        itemCat={
          post.category || post.reportedPost?.category || post?.item?.category
        }
        itemName={post.name || post.reportedPost?.name}
        pricePerDay={post.pricePerDay || post.reportedPost?.pricePerDay}
        city={post.city || post.reportedPost?.city}
        area={post.area || post.reportedPost?.area}
        condition={post.condition || post.reportedPost?.condition}
        rating={post?.rating || post.reportedPost?.rating}
        date={post.createdAt}
        reportReason={post?.reason}
        reporter={post?.reporter}
        status={post.status || post.reportedPost?.status}
        borrowStatus={post?.status}
        endDate={post?.endDate}
        isMine={isMine}
        iRequested={post?.requester === currentUserId}
        iBorrowed={post?.borrower === currentUserId}
        iGave={post?.owner === currentUserId}
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
