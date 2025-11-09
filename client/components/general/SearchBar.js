import { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import FilterModal from "./FilterModal";

function SearchBar({ onSearch, onFilterResults, onClearSearch, isFilterActive }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);

  const [searchItem, setSearchItem] = useState("");
  const [filter, setFilter] = useState(false);
  const lastSearchSource = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounce search - wait for user to stop typing
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't trigger search if:
    // 1. Filter is active and search is empty (filter results should stay)
    // 2. Last search was from filter and text input is empty
    if (isFilterActive && searchItem === "" && lastSearchSource.current === 'filter') {
      console.log("SearchBar: Skipping search - filter results active");
      return;
    }

    // Only set up debounce if there's actual text to search
    if (searchItem !== "") {
      searchTimeoutRef.current = setTimeout(() => {
        console.log("SearchBar: Triggering search with:", searchItem);
        if (onSearch) {
          lastSearchSource.current = 'text';
          onSearch(searchItem);
        }
      }, 500);
    }

    // Cleanup: cancel the timeout
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchItem, isFilterActive, onSearch]);

  // Handle clearing search
  const handleClearInput = useCallback(() => {
    console.log("SearchBar: Clearing search");
    
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSearchItem("");
    lastSearchSource.current = null;
    
    if (onClearSearch) {
      onClearSearch();
    }
  }, [onClearSearch]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    console.log("SearchBar: Closing filter modal");
    setFilter(false);
  }, []);

  // Handle filter results - track that it came from filter
  const handleFilterResults = useCallback((results) => {
    console.log("SearchBar: Received filter results:", results.length, "posts");
    lastSearchSource.current = 'filter';
    if (onFilterResults) {
      onFilterResults(results);
    }
  }, [onFilterResults]);

  return (
    <>
      <View style={styles.searchbar}>
        <View style={styles.bigBox}>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="search"
              size={24}
              color={theme.purple}
              style={styles.icon}
            />
            <TextInput
              value={searchItem}
              onChangeText={(text) => setSearchItem(text)}
              placeholder={"Search Items"}
              placeholderTextColor={theme.purple}
              style={styles.input}
            />
            {(searchItem !== "" || isFilterActive) && (
              <TouchableOpacity onPress={handleClearInput}>
                <MaterialIcons name="close" size={20} color={theme.purple} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filter,
              isFilterActive && styles.filterActive
            ]}
            onPress={() => {
              setFilter(!filter);
            }}
          >
            <MaterialIcons
              name="tune"
              size={22}
              color={isFilterActive ? theme.green : theme.purple}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FilterModal
        isVisible={filter}
        onClose={handleCloseModal}
        onSearchResults={handleFilterResults}
      />
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    searchbar: {
      width: "100%",
      paddingTop: 3,
      borderBottomRightRadius: 30,
      borderBottomLeftRadius: 30,
      zIndex: 100,
      paddingBottom: 10,
      backgroundColor: theme.backgroundColor,
    },
    bigBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "90%",
      margin: "auto",
      marginTop: 10,
    },
    inputContainer: {
      borderWidth: 2,
      borderRadius: 50,
      paddingHorizontal: 20,
      borderColor: theme.purple,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.post,
      width: "85%",
      paddingVertical: 0,
      height: 40,
    },
    icon: {},
    filter: {
      backgroundColor: theme.post,
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: 1,
      borderRadius: "50%",
      borderWidth: 2,
      borderColor: theme.purple,
      height: 40,
    },
    filterActive: {
      borderColor: theme.green,
      backgroundColor: theme.green + "20",
    },
    input: {
      fontWeight: "bold",
      fontSize: 16,
      height: 40,
      textAlignVertical: "center",
      margin: 0,
      padding: 0,
      flex: 1,
    },
  });

export default SearchBar;