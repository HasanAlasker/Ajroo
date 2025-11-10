import { useState, useCallback, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import FilterModal from "./FilterModal";

function SearchBar({
  onSearch,
  onFilterResults,
  onClearSearch,
  isFilterActive,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);

  const [searchItem, setSearchItem] = useState("");
  const [filter, setFilter] = useState(false);
  const lastSearchSource = useRef(null);

  // Handle search execution
  const handleSearch = useCallback(() => {
    console.log("SearchBar: Executing search with:", searchItem);
    if (onSearch && searchItem.trim() !== "") {
      lastSearchSource.current = "text";
      onSearch(searchItem.trim());
    }
  }, [searchItem, onSearch]);

  // Handle enter key press
  const handleSubmitEditing = useCallback(() => {
    handleSearch();
  }, [handleSearch]);

  // Handle clearing search
  const handleClearInput = useCallback(() => {
    console.log("SearchBar: Clearing search");
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
  const handleFilterResults = useCallback(
    (results) => {
      console.log(
        "SearchBar: Received filter results:",
        results.length,
        "posts"
      );
      lastSearchSource.current = "filter";
      if (onFilterResults) {
        onFilterResults(results);
      }
    },
    [onFilterResults]
  );

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
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="search"
              placeholder={"Search Items"}
              placeholderTextColor={theme.purple}
              style={styles.input}
            />
            {(searchItem !== "" || isFilterActive) && (
              <TouchableOpacity
                onPress={handleClearInput}
                style={styles.actionButton}
              >
                <MaterialIcons name="close" size={24} color={theme.purple} />
              </TouchableOpacity>
            )}
            {searchItem !== "" && !isFilterActive && (
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.actionButton}
              >
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color={theme.green}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filter, isFilterActive && styles.filterActive]}
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
      paddingLeft: 20,
      paddingRight:10,
      borderColor: theme.purple,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.post,
      width: "85%",
      paddingVertical: 0,
      height: 40,
    },
    icon: {},
    actionButton: {
      marginLeft: 15,
    },
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
      color: theme.sec_text,
      margin: 0,
      padding: 0,
      flex: 1,
    },
  });

export default SearchBar;
