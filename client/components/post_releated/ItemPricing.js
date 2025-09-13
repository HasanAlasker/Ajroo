import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";

function ItemPricing({ pricePerDay }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {pricePerDay && pricePerDay !== 0 ? (
        <AppText style={styles.text}>{pricePerDay} JD/ Day</AppText>
      ) : (
        <AppText style={styles.text}>Free</AppText>
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      fontSize: 20,
      color: theme.green,
      fontWeight: "bold",
    },
  });

export default ItemPricing;
