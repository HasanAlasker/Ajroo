import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";
import { Octicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

function ItemStatus({ status, type, endDate }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const route = useRoute();

  // Calculate days remaining if endDate exists
  const getDaysRemaining = () => {
    if (!endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getColor = () => {
    // Handle status-based colors first
    switch (status) {
      case "available":
        return theme.green;
      case "taken":
        return theme.red;
      case "disabled":
        return theme.sec_text;
      case "pending":
        return theme.orange;
      case "late":
        return theme.red;
      case "early":
        return theme.green;
      case "pending_return":
        return theme.orange;
      case "active":
        // For active status, determine color based on end date
        const daysRemaining = getDaysRemaining();
        if (daysRemaining === null) return theme.green;
        if (daysRemaining < 0) return theme.red; // Late (past end date)
        if (daysRemaining === 0) return theme.orange; // Today
        if (daysRemaining <= 3) return theme.orange; // Soon (within 3 days)
        return theme.green; // Still have time
      default:
        return theme.sec_text;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "available":
        return "Available";
      case "disabled":
        return "Disabled";
      case "pending":
        return "Pending";
      case "active":
        const daysRemaining = getDaysRemaining();
        if (daysRemaining === null) return `End Date: ${endDate}`;

        if (daysRemaining < 0) {
          return `Late by ${Math.abs(daysRemaining)} day${
            Math.abs(daysRemaining) > 1 ? "s" : ""
          }`;
        }
        if (daysRemaining === 0) {
          return "Due Today";
        }
        if (daysRemaining === 1) {
          return "Due Tomorrow";
        }
        return `${daysRemaining} days left`;
      case "late":
        return "Late";
      case "early":
        return "Early";
      case "pending_return":
        return "Marked As Returned"
      default:
        return "Taken";
    }
  };

  return (
    <View style={styles.container}>
      <Octicons
        name={endDate && route.name === "Book" ? "calendar" : "clock"}
        size={18}
        color={getColor()}
      />
      <AppText style={[styles.text, { color: getColor() }]}>
        {getStatusText()}
      </AppText>
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
    },
  });

export default ItemStatus;
