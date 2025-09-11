import React from 'react';
import { FlatList } from 'react-native';
import { usePosts } from '../config/PostContext';
import Post from './Post';
import useThemedStyles from '../hooks/useThemedStyles';
import { useTheme } from '../config/ThemeContext';

const POST_FILTERS = {
  // My posts that are available/disabled
  myAvailable: (posts, currentUserId) => 
    posts.filter(post => post.userId === currentUserId && ['available', 'disabled'].includes(post.status)),
  
  // My posts that someone else borrowed
  myLentOut: (posts, currentUserId) => 
    posts.filter(post => post.userId === currentUserId && ['taken', 'early', 'late'].includes(post.status)),
  
  // My posts with pending requests
  myRequested: (posts, currentUserId) => 
    posts.filter(post => post.userId === currentUserId && post.status === 'requested'),
  
  // Posts I requested from others
  iRequested: (posts, currentUserId) => 
    posts.filter(post => post.requesterId === currentUserId),
  
  // Posts I'm currently borrowing
  iBorrowed: (posts, currentUserId) => 
    posts.filter(post => post.borrowerId === currentUserId && ['taken', 'early', 'late'].includes(post.status)),
  
  // All available posts from others (for browsing)
  browsable: (posts, currentUserId) => 
    posts.filter(post => post.userId !== currentUserId && post.status === 'available'),
};

function PostRenderer({ 
  filterType, 
  currentUserId, 
  emptyMessage = "No posts found",
  onRefresh,
  refreshing = false 
}) {
  const { posts } = usePosts();
  
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
        key={post.id}
        postId={post.id}
        name={post.ownerName}
        date={post.date}
        profilePic={post.profilePic}
        image={post.image}
        itemName={post.itemName}
        itemCat={post.category}
        area={post.area}
        status={post.status}
        rating={post.rating}
        condition={post.condition}
        pricePerDay={post.pricePerDay}
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
      showsVerticalScrollIndicator={false}
    />
  );
}

// Simple empty state component
const EmptyState = ({ message }) => (
  <View style={{ padding: 20, alignItems: 'center' }}>
    <AppText style={{ fontSize: 16, color: '#999' }}>{message}</AppText>
  </View>
);

export default PostRenderer;