import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import AppText from "../config/AppText";
import RequestBtn from "./RequestBtn";
import { useNavigation } from "@react-navigation/native";

function WelcomeCard() {
  const styles = useThemedStyles(getStyles);
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <AppText style={styles.big}>💡 Suggestions & Feature Requests</AppText>
      <AppText style={styles.small}>
        We’re in the testing phase! Share your ideas or request features you’d
        love to see.
      </AppText>
      <RequestBtn
        title={"Send suggestion"}
        arrow={true}
        color={"purple"}
        backColor={"always_white"}
        style={styles.btn}
        onPress={()=> navigation.navigate('Suggestions') }
      />
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      backgroundColor: theme.purple,
      marginHorizontal: "auto",
      marginTop: 30,
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
    btn: {
      padding: 2,
      borderRadius: 10,
      width: "100%",
      marginTop: 5,
    },
  });

export default WelcomeCard;
