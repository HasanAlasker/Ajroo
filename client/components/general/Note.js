import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";

function Note({ style, title, text }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);

  return (
    <View style={[styles.iconAndTitle, style]}>
      <FontAwesome6
        name="circle-exclamation"
        color={theme.darker_gray}
        style={styles.icon}
      ></FontAwesome6>
      <AppText style={[styles.note, styles.small]}>
        {title}: {text}
      </AppText>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    width: "100%",
  },
  small: {
    fontSize: 15,
    color: theme.darker_gray,
    fontWeight: "bold",
    textAlign: "center",
  },
  icon: {
    alignSelf: "stretch",
    paddingTop: 4,
  },
  iconAndTitle: {
    width: "90%",
    marginHorizontal: "auto",
    marginTop: "40",
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
});

export default Note;
