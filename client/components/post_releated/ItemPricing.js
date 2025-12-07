import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";

function ItemPricing({ pricePerDay, sellPrice }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  if (!sellPrice) {
    return (
      <View style={styles.container}>
        {pricePerDay && pricePerDay >= 1 ? (
          <AppText style={styles.text}>Rent: {pricePerDay} JD/ Day</AppText>
        ) : (
          <AppText style={styles.text}>Free</AppText>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Buy: {sellPrice} JD</AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      flex:1
    },
    text: {
      fontSize: 19,
      color: theme.green,
      fontWeight: "bold",
      flexWrap:'wrap'
    },
  });

export default ItemPricing;
