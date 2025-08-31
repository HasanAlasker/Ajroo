import React from "react";
import { View, StyleSheet, Image } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import ScrollScreen from "../../components/ScrollScreen";
import Logo from "../../components/Logo";
import RequestBtn from "../../components/RequestBtn";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useNavigation } from "@react-navigation/native";

function Welcome(props) {
  const styles = useThemedStyles(getStyles);
  const navigation = useNavigation()
  return (
    <SafeScreen>
      <ScrollScreen>
        <Logo slogan style={styles.logo}></Logo>
        <View style={styles.cont}>
          <RequestBtn
            style={styles.btn}
            backColor={"purple"}
            color={"always_white"}
            title={"Login"}
            onPress={()=>navigation.navigate('Login')}
          ></RequestBtn>
          <RequestBtn
            style={[styles.btn, styles.border]}
            backColor={"post"}
            color={"purple"}
            title={"Create account"}
            onPress={()=>navigation.navigate('Signin')}
          ></RequestBtn>
        </View>
      </ScrollScreen>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    logo: {
      marginTop: 50,
    },
    btn: {
      width: "90%",
      marginHorizontal: "auto",
      borderRadius: 18,
    },
    border: { borderColor: theme.purple },
    cont:{
        gap:20,
        marginTop:100
    }
  });

export default Welcome;
