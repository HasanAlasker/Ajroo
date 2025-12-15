import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";


function RedCircle() {
  const styles = useThemedStyles(getStyles);

  return <View style={styles.container}></View>;
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.red,
      width: 20,
      height: 20,
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: theme.background,
      borderWidth: 2,

      bottom:50,
      left:35
    },
  });

export default RedCircle;
