import { View, StyleSheet, Image } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";

function Logo({ style, slogan = false, text = true }) {
  const styles = useThemedStyles(getStyles);

  return (
    <View style={[styles.all, style]}>
      <View style={styles.container}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
        ></Image>
        {text && <AppText style={[styles.text, styles.big]}>Ajroo</AppText>}
      </View>
      {slogan && (
        <AppText style={styles.text}>
          Share more, waste less, earn together
        </AppText>
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 30,
    },
    logo: {
      width: "35%",
      resizeMode: "contain",
      marginHorizontal: "auto",
    },
    big: {
      fontSize: 72,
      fontWeight: "bold",
      color: theme.main_text,
    },
    text: {
      textAlign: "center",
      fontSize: 18,
      color: theme.sec_text,
      width:'90%',
      marginHorizontal:'auto'
    },
  });

export default Logo;
