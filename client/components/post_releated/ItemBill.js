import { View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import { getRequestById } from "../../api/request";
import { getBorrowById } from "../../api/borrow";

function ItemBill({ postId, billId }) {
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const getRequestApi = useApi(getRequestById);
  const getBorrowApi = useApi(getBorrowById);

  // Determine which API to use based on route
  const isBookRoute = route.name === "Book";

  useEffect(() => {
    if (billId) {
      if (isBookRoute) {
        getBorrowApi.request(billId);
      } else {
        getRequestApi.request(billId);
      }
    }
  }, [billId, isBookRoute]);

  // Select the active API data
  const activeApi = isBookRoute ? getBorrowApi : getRequestApi;

  // Show loading or error states if needed
  if (activeApi.loading) {
    return (
      <View style={styles.container}>
        <AppText style={styles.text}>Loading...</AppText>
      </View>
    );
  }

  if (activeApi.error) {
    // console.log("API Error:", activeApi.error);
    return null;
  }

  if (!activeApi.data) {
    // console.log("No data available");
    return null;
  }

  const { pricePerDay, durationValue, durationUnit, totalPrice } = activeApi.data;

  return (
    <View style={styles.container}>
      {pricePerDay >= 1 ? (
        <AppText style={styles.text}>
          Requested {durationValue} {durationUnit}{durationValue > 1 && "s"} for {totalPrice} JD
        </AppText>
      ) : (
        <AppText style={styles.text}>
          Requested {durationValue} {durationUnit}{durationValue > 1 && "s"} for Free
        </AppText>
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

export default ItemBill;