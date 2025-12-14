import { StyleSheet } from "react-native";
import Navbar from "../../components/general/Navbar";
import SearchBar from "../../components/general/SearchBar";
import SafeScreen from "../../components/general/SafeScreen";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useApi from "../../hooks/useApi";
import { availablePosts, searchPosts } from "../../api/post";
import LoadingCircle from "../../components/general/LoadingCircle";
import LoadingSkeleton from "../../components/post_releated/LoadingSkeleton";
import NewsCard from "../../components/NewsCard";
import { getActiveNews } from "../../api/news";
import { getActiveAds } from "../../api/ads";

function Have({ route }) {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // State to store filtered results
  const [filteredResults, setFilteredResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  // Track if we're in search mode
  const [isFilterActive, setIsFilterActive] = useState(false);
  // Track the source of the search (text or filter)
  const searchSource = useRef(null); // 'text' or 'filter'

  // Store initial category from navigation
  const initialCategory = useRef(null);

  const [ads, setAds] = useState([]);

  // Get all posts
  const {
    data: posts,
    error,
    loading,
    request: fetchPosts,
  } = useApi(availablePosts);

  const { data: news, request: fetchNews, loadingNews } = useApi(getActiveNews);
  const {
    data: activeAd,
    request: fetchAds,
    loadingAds,
  } = useApi(getActiveAds);

  useEffect(() => {
    fetchPosts();
    fetchNews();
    fetchAds();
  }, []);

  useEffect(() => {
    if (activeAd && Array.isArray(activeAd)) {
      setAds(activeAd);
    }
  }, [activeAd]);

  // Handle navigation params - apply filter when coming from Home
  useEffect(() => {
    if (route?.params?.category && route?.params?.applyFilter) {
      const category = route.params.category;
      initialCategory.current = category;

      // Apply the filter automatically
      handleFilterByCategory(category);
    }
  }, [route?.params]);

  const handleFilterByCategory = async (category) => {
    searchSource.current = "filter";
    setIsSearching(true);
    setIsFilterActive(true);
    try {
      const response = await searchPosts({ category: category });
      setFilteredResults(response.data);
    } catch (error) {
      console.log("Filter error:", error);
      setFilteredResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    await fetchNews();
    await fetchAds();
    // Clear filters on refresh
    setFilteredResults(null);
    setIsSearching(false);
    setIsFilterActive(false);
    searchSource.current = null;
    initialCategory.current = null;
    setRefreshing(false);
  };

  // Handle search by name (from SearchBar text input)
  const handleSearchByName = useCallback(async (searchText) => {
    // If filter modal was used, don't override with text search
    if (
      searchSource.current === "filter" &&
      (!searchText || searchText.trim() === "")
    ) {
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

    searchSource.current = "text";
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
    searchSource.current = "filter";
    setFilteredResults(results);
    setIsFilterActive(true);
  }, []);

  // Clear search/filters
  const handleClearSearch = useCallback(() => {
    setFilteredResults(null);
    setIsFilterActive(false);
    setIsSearching(false);
    searchSource.current = null;
    initialCategory.current = null;
  }, []);

  // Helper function to merge posts with ads
  const createMergedData = useCallback((postsArray, adsArray) => {
    const merged = [];
    let adIndex = 0;

    postsArray.forEach((post, index) => {
      merged.push({ type: "post", data: post });

      // Insert ad after every 5 posts (index 4, 9, 14, etc.)
      if ((index + 1) % 5 === 0 && adIndex < adsArray.length) {
        merged.push({ type: "ad", data: adsArray[adIndex] });
        adIndex++;
      }
    });

    return merged;
  }, []);

  // Determine which posts to display and merge with ads
  const displayPosts = useMemo(() => {
    const postsToDisplay =
      isFilterActive && filteredResults !== null ? filteredResults : posts;
    return createMergedData(postsToDisplay || [], ads);
  }, [isFilterActive, filteredResults, posts, ads, createMergedData]);

  if (loading && !posts) {
    return <LoadingCircle />;
  }

  return (
    <SafeScreen>
      <PostRenderer
        fetchedPosts={displayPosts}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          loading
            ? null
            : isFilterActive
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
          initialCategory={initialCategory.current}
        />
        {loading && <LoadingSkeleton />}
        {loading && <LoadingSkeleton />}
        {loading && <LoadingSkeleton />}
        {loading && <LoadingSkeleton />}
        {!loading && news && Object.keys(news).length > 0 && (
          <NewsCard
            id={news._id}
            backGroundColor={news.backGroundColor}
            textColor={news.textColor}
            borderColor={news.borderColor}
            title={news.title}
            createdAt={news.createdAt}
            description={news.description}
            isActive={news.isActive}
            actionButton={news.actionButton}
            icon={news?.icon}
          />
        )}
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
