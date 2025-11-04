import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { Octicons } from "@expo/vector-icons";
import AppText from "../config/AppText";
import { useUser } from "../config/UserContext";

function UserRate({ userRating }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const {user} = useUser()

  return (
    <View style={styles.container}>
      <Octicons name="star-fill" color={theme.always_white} size={20}></Octicons>
      <AppText style={styles.text}>{userRating}</AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: theme.gold,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical:6,
      paddingHorizontal:12,
      borderRadius:20,
      alignSelf:'center'
    },
    text: {
      fontWeight: "bold",
      color: theme.always_white,
      fontSize:18
    },
  });

export default UserRate;
