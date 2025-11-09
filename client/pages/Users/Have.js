import { StyleSheet } from "react-native";
import Navbar from "../../components/general/Navbar";
import SearchBar from "../../components/general/SearchBar";
import SafeScreen from "../../components/general/SafeScreen";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import { useState, useEffect, useCallback, useRef } from "react";
import useApi from "../../hooks/useApi";
import { availablePosts, searchPosts } from "../../api/post";
import LoadingCircle from "../../components/general/LoadingCircle";

function Have(props) {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // State to store filtered results
  const [filteredResults, setFilteredResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  // Track if we're in search mode
  const [isFilterActive, setIsFilterActive] = useState(false);
  // Track the source of the search (text or filter)
  const searchSource = useRef(null); // 'text' or 'filter'

  // Get all posts
  const {
    data: posts,
    error,
    loading,
    request: fetchPosts,
  } = useApi(availablePosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    // Clear filters on refresh
    setFilteredResults(null);
    setIsSearching(false);
    setIsFilterActive(false);
    searchSource.current = null;
    setRefreshing(false);
  };

  // Handle search by name (from SearchBar text input)
  const handleSearchByName = useCallback(async (searchText) => {
    // If filter modal was used, don't override with text search
    if (searchSource.current === 'filter' && (!searchText || searchText.trim() === "")) {
      return; // Keep the filter results
    }

    if (!searchText || searchText.trim() === "") {
      // If search is empty, show all posts
      setFilteredResults(null);
      setIsSearching(false);
      setIsFilterActive(false);
      searchSource.current = null;
      return;
    }

    searchSource.current = 'text';
    setIsSearching(true);
    setIsFilterActive(true);
    try {
      const response = await searchPosts({ name: searchText });
      setFilteredResults(response.data);
    } catch (error) {
      console.log("Search error:", error);
      setFilteredResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle filter results from FilterModal
  const handleFilterResults = useCallback((results) => {
    console.log("Filter results received:", results);
    searchSource.current = 'filter';
    setFilteredResults(results);
    setIsFilterActive(true);
  }, []);

  // Clear search/filters
  const handleClearSearch = useCallback(() => {
    setFilteredResults(null);
    setIsFilterActive(false);
    setIsSearching(false);
    searchSource.current = null;
  }, []);

  // Determine which posts to display
  const displayPosts = isFilterActive && filteredResults !== null ? filteredResults : posts;

  if (loading && !posts) {
    return <LoadingCircle />;
  }

  return (
    <SafeScreen>
      <PostRenderer
        fetchedPosts={displayPosts || []}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          isFilterActive
            ? "No results found for your search"
            : "No one has posted yet"
        }
        currentUserId={user.id}
      >
        <SearchBar
          onSearch={handleSearchByName}
          onFilterResults={handleFilterResults}
          onClearSearch={handleClearSearch}
          isFilterActive={isFilterActive}
        />
      </PostRenderer>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
  });

export default Have;