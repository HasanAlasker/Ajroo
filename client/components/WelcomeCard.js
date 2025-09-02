import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import AppText from "../config/AppText";

function WelcomeCard({ name }) {
  const styles = useThemedStyles(getStyles);

  return (
    <View style={styles.container}>
      <AppText numberOfLines={1} style={styles.big}>
        Hello {name}!
      </AppText>
      <AppText style={styles.small}>
        Give what you can. Borrow what you need.
      </AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      backgroundColor: theme.purple,
      marginHorizontal: "auto",
      marginTop:30,
      paddingVertical: 25,
      paddingHorizontal: 20,
      gap: 10,
      borderRadius: 24,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,

      elevation: 7,
    },
    big: {
      fontSize: 25,
      color: theme.always_white,
      fontWeight: "bold",
    },
    small: {
      fontSize: 20,
      color: theme.always_white,
      fontWeight: "medium",
    },
  });

export default WelcomeCard;
