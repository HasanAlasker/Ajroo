import { View, StyleSheet, TouchableOpacity } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";


function MiniRedCircle() {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return <View style={styles.container}></View>;
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.purple,
      width: 14,
      height: 14,
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: theme.post,
      borderWidth: 2.5,
      position:'absolute',
      bottom:39,
      left:20
    },
  });

export default MiniRedCircle;
