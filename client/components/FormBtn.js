import { View, StyleSheet, TouchableOpacity } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import AppText from "../config/AppText";

function FormBtn({ title, onPress, style, textColor, disabled=false, loading }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, disabled && styles.disabled, style]}
      disabled={disabled}
    >
      <AppText
        style={[styles.text, { color: theme[textColor || "always_white"] }]}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      borderRadius: 18,
      borderColor: theme.purple,
      borderWidth: 2,
      backgroundColor: theme.purple,
      paddingVertical: 5,
      paddingHorizontal: 15,
      width: "90%",
      marginHorizontal: "auto",
      marginTop: 30,
      gap: 10,
      minHeight: 40,
    },
    text: {
      color: theme.always_white,
      fontWeight: "bold",
      fontSize: 18,
      flex: 1,
      padding: 0,
      margin: 0,
      textAlign: "center",
    },
    disabled: {
      opacity: 0.5,
    },
  });

export default FormBtn;
