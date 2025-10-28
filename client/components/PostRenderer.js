import React from "react";
import { FlatList, View } from "react-native";
import AppText from "../config/AppText";
import { usePosts } from "../config/PostContext";
import { useUser } from "../config/UserContext";
import Post from "./post_releated/Post";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import {
  getCategoryLabel,
  getItemLabel,
  getCityLabel,
  getAreaLabel,
  getConditionLabel,
} from "../constants/DropOptions";

const POST_FILTERS = {
  // My posts that are available/disabled
  myAvailable: (posts, currentUserId) =>
    posts.filter(
      (post) =>
        post.userId === currentUserId && ["available"].includes(post.status)
    ),

  // All my posts
  allMine: (posts, currentUserId) =>
    posts.filter((post) => post.userId === currentUserId),

  // Others posts that are available (figure out how to get the current profile owner userId)
  others: (posts, currentUserId) =>
    posts.filter(
      (post) =>
        post.userId === currentUserId && ["available"].includes(post.status)
    ),

  // My posts that someone else borrowed
  myBorrowed: (posts, currentUserId) =>
    posts.filter(
      (post) =>
        post.userId === currentUserId &&
        ["taken", "early", "late"].includes(post.status)
    ),

  // My posts with pending requests
  myRequested: (posts, currentUserId) =>
    posts.filter(
      (post) => post.userId === currentUserId && post.status === "pending"
    ), // you might need to recheck the status in PrimaryBtn because i once put it pending and its confusing now

  // Posts I requested from others
  iRequested: (posts, currentUserId) =>
    posts.filter((post) => post.requesterId === currentUserId),

  // Posts I'm currently borrowing
  iBorrowed: (posts, currentUserId) =>
    posts.filter(
      (post) =>
        post.borrowerId === currentUserId &&
        ["taken", "early", "late"].includes(post.status)
    ),

  // All available posts from others (for browsing)
  browsable: (posts, currentUserId) =>
    posts.filter(
      (post) =>
        post.userId !== currentUserId &&
        ["available", "pending"].includes(post.status)
    ),
};

function PostRenderer({
  filterType,
  currentUserId,
  emptyMessage = "No posts found",
  onRefresh,
  refreshing = false,
  children,
}) {
  //   const [postList, setPostList] = useState([])

  // const loadPosts = async () => {
  //   const response =  await getPosts()
  //   setPostList(response.data)
  // }

  // useEffect(()=>{
  //   loadPosts()
  // },[])
  const { posts } = usePosts();
  const { user } = useUser();

  // Get the filter function
  const filterFunction = POST_FILTERS[filterType];

  if (!filterFunction) {
    console.warn(`Unknown filter type: ${filterType}`);
    return null;
  }

  // Apply the filter
  const filteredPosts = filterFunction(posts, currentUserId);

  // Helper function to determine post relationship flags
  const getPostFlags = (post) => {
    return {
      isMine: post.userId === currentUserId,
      iRequested: post.requesterId === currentUserId,
      iBorrowed: post.borrowerId === currentUserId,
    };
  };

  const renderPost = ({ item: post }) => {
    const flags = getPostFlags(post);

    return (
      <Post
        id={post.id}
        profilePic={user.avatar}
        name={user.name}
        userId={user.id}
        image={post.image}
        itemCat={getCategoryLabel(post.category)}
        itemName={getItemLabel(post.item)}
        pricePerDay={post.price}
        city={getCityLabel(post.city)}
        area={getAreaLabel(post.area)}
        condition={getConditionLabel(post.condition)}
        rating={post.rating}
        date={post.createdAt}
        status={post.status}
        {...flags}
      />
    );
  };

  return (
    <FlatList
      data={filteredPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id.toString()}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={() => <EmptyState message={emptyMessage} />}
      ListHeaderComponent={children ? () => children : null}
      showsVerticalScrollIndicator={false}
    />
  );
}

// Simple empty state component
const EmptyState = ({ message }) => (
  <View
    style={{ paddingHorizontal: 20, paddingVertical: 50, alignItems: "center" }}
  >
    <AppText style={{ fontSize: 16, color: "#999" }}>{message}</AppText>
  </View>
);

export default PostRenderer;
