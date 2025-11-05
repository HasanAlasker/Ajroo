import { Feather, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";

function ItemRating({rating}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Octicons name="star-fill" size={20} color={theme.gold}></Octicons>
      <AppText style={styles.text}>{rating}</AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    text: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.gold,
    },
  });

export default ItemRating;
