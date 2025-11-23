import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";

function ErrorBox({
  firstTitle,
  fistDetail,
  secondTitle,
  secondDetail,
  style,
  color
}) {
  const styles = useThemedStyles(getStyles);
  const {theme} = useTheme()

  return (
    <View style={[styles.display, style]}>
      <AppText style={[styles.reportReason, {color: theme[color] || theme.red}]}>
        {firstTitle}: {fistDetail}
      </AppText>
      {secondTitle && (
        <AppText style={styles.reportReason}>
          {secondTitle}: {secondDetail}
        </AppText>
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    reportReason: {
      color: theme.error_text,
      fontSize: 18,
      fontWeight: "bold",
    },
    display: {
      width: "100%",
      backgroundColor: theme.error_back,
      borderColor: theme.error_border,
      borderWidth: 2,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      gap: 10,
    },
  });

export default ErrorBox;
