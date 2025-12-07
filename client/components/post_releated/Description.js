import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../config/AppText";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";

function Description({ description }) {
  const [full, setFull] = useState(false);
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);

  return (
    <TouchableOpacity style={styles.container} onPress={() => setFull(!full)}>
      <MaterialCommunityIcons
        name={
          full ? "chevron-up-circle-outline" : "chevron-down-circle-outline"
        }
        size={20}
        color={theme.sec_text}
        style={{ paddingTop: 1 }}
      />
      <AppText style={styles.text}>
        {full ? description : "See Description"}
      </AppText>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
      gap: 5,
      overflow: "hidden",
    },
    text: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.sec_text,
      maxWidth: "92%",
      flexWrap: "wrap",
    },
  });

export default Description;
