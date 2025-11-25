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
  showUndelete,
}) {
  // Helper function to get display name from productId
  const getSubscriptionDisplayName = (productId) => {
    if (!productId) return null;

    const mapping = {
      individual_free: null, // No badge for free users
      "pro_monthly:pro": "Pro",
      "business_starter:starter": "Starter",
      "business_premium:premium": "Premium",
    };

    return mapping[productId] || null;
  };

  const renderPost = ({ item: post }) => {
    let isMine = false;

    // Determine ownership
    if (post.user?._id) {
      isMine = post.user._id === currentUserId;
    } else if (post.owner?._id) {
      isMine = post.owner._id === currentUserId;
    } else if (post.requester?._id) {
      isMine = post.requester._id !== currentUserId;
    } else if (post.reportedPost?.user?._id) {
      isMine = post.reportedPost.user._id === currentUserId;
    }

    // Get productId from subscription and convert to display name
    const subscriptionType =
      post.user?.subscription?.productId ||
      post.reportedPost?.user?.subscription?.productId ||
      post.owner?.subscription?.productId ||
      null;

    const subscriptionDisplayName =
      getSubscriptionDisplayName(subscriptionType);

    // console.log("📦 Rendering post - productId:", productId, "→ displayName:", subscriptionDisplayName);

    return (
      <Post
        id={post?.reportedPost?._id || post?.item?._id || post._id}
        reportId={post._id}
        requestId={post._id}
        borrowId={post._id}
        phoneNumber={post?.owner?.phone || post?.borrower?.phone}
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
          post?.requester?._id ||
          post?.borrower?._id ||
          post.user?._id ||
          post.reportedPost?.user?._id ||
          post?.owner?._id
        }
        ownerId={post?.owner?._id}
        borrowerId={post?.borrower?._id}
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
        isDeleted={post?.isDeleted}
        showUndelete={showUndelete}
        subscriptionType={subscriptionDisplayName}
        isRequesterBlocked={post?.requester?.isBlocked}
        isOwnerBlocked={post?.owner?.isBlocked}
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
