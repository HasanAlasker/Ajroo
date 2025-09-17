import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import RowLableCont from "./RowLableCont";
import ItemPricing from "./ItemPricing";
import { Octicons } from "@expo/vector-icons";
import { useTheme } from "../../config/ThemeContext";

function ItemNameAndCat({ itemName, itemCat, pricePerDay, showPrice = true }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  return (
    <View style={styles.itemAndCatagory}>
      <AppText style={styles.itemName}>{itemName}</AppText>
      <RowLableCont style={styles.row}>
        <AppText style={styles.itemCat}>{itemCat}</AppText>
        { showPrice && <Octicons name="dot-fill" color={theme.sec_text}></Octicons>}
        { showPrice && <ItemPricing pricePerDay={pricePerDay}></ItemPricing>}
      </RowLableCont>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    itemAndCatagory: {
      gap: 0,
    },
    itemName: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.main_text,
    },
    itemCat: {
      fontSize: 15,
      color: theme.sec_text,
      fontWeight: "bold",
    },
    row: {
      gap: 20,
      // justifyContent:'space-between'
    },
  });

export default ItemNameAndCat;
