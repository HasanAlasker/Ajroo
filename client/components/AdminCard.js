import { View, StyleSheet } from "react-native";
import PostComponent from "./post_releated/PostComponent";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Icon mapping based on card title
const getIconName = (title) => {
  const iconMap = {
    "Total Users": "account-group",
    "Total Admins": "shield-account",
    "Total Posts": "post",
    "Available Posts": "checkbox-marked-circle",
    "Disabled Posts": "cancel",
    "Deleted Posts": "delete",
    "Taken Items": "check-circle",
    "Active Reports": "alert-circle",
    "Users Profit": "cash-multiple",
    "App Profit": "currency-usd",
    "Blocked Users": "account-cancel",
    "Individual - Free": "account",
    "Total Subscribers": "star-circle",
    "Individual - Pro": "briefcase",
    "Business - Starter": "briefcase-check",
    "Business - Premium": "crown",
    "Total Suggestions": "account-voice",
  };

  return iconMap[title] || "information";
};

function AdminCard({ title, value, color, backColor = "purple", borderColor }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);
  const iconName = getIconName(title);

  return (
    <PostComponent
      style={[
        styles.card,
        {
          backgroundColor: theme[backColor],
          borderColor: theme[borderColor],
          width: "95%",
        },
      ]}
    >
      <View style={styles.container}>
        <MaterialCommunityIcons
          name={iconName}
          size={32}
          color={theme[color]}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <AppText style={[styles.text, { color: theme[color] }]}>
            {title} :
          </AppText>
          <AppText style={[styles.text, { color: theme[color], flex: 1 }]}>
            {value != null ? value : "_"}
          </AppText>
        </View>
      </View>
    </PostComponent>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    card: {
      borderWidth: 2,
      marginVertical: 10,
    },
    icon: {
      marginLeft: 5,
    },
    textContainer: {
      flexDirection: "row",
      gap: 10,
      flex: 1,
    },
    text: {
      fontWeight: "bold",
      fontSize: 18,
    },
  });

export default AdminCard;
