import { StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";

function MenuOption({ text, icon, color, onPress }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <AppText style={[styles.text, { color: color ? theme[color] : theme['main_text']}]}>{text}</AppText>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={26}
          color={color ? theme[color] : theme['main_text']}
        ></MaterialCommunityIcons>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.0,

      elevation: 24,
    },
    text: {
      fontSize: 20,
      fontWeight: "bold",
    },
  });

export default MenuOption;
