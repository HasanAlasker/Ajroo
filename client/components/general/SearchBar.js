import { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";

function SearchBar(props) {
  const [searchItem, setSearchItem] = useState("");
  const { theme } = useTheme();

  const styles = useThemedStyles(getStyles);

  return (
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
            onChangeText={(text) => setSearchItem(text)}
            placeholder={"Search Items"}
            placeholderTextColor={theme.purple}
            style={styles.input}
          />
        </View>
        <TouchableOpacity style={styles.filter}>
          <MaterialIcons
            name="tune"
            size={22}
            color={theme.purple}
          ></MaterialIcons>
        </TouchableOpacity>
      </View>
    </View>
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
