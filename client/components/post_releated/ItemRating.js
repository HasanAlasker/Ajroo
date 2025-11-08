import { Feather, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";

function ItemRating({rating}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  const formatRating = (rating) => {
    if(rating !== "Unrated Yet"){
      return rating.toFixed(2)
    }
    else return rating
  }

  return (
    <View style={styles.container}>
      <Octicons name="star-fill" size={20} color={theme.gold}></Octicons>
      <AppText style={styles.text}>{formatRating(rating)}</AppText>
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
