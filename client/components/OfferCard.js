import React from "react";
import { View, StyleSheet } from "react-native";
import PostComponent from "./PostComponent";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AppText from "../config/AppText";
import RequestBtn from "./RequestBtn";

function OfferCard({ icon, title, children, btnText, startNow, startsAt, color }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <PostComponent style={[styles.container, {backgroundColor: theme[color]}]}>
      <View style={styles.iconAndTitle}>
        <MaterialIcons name={icon} size={23} color={theme.always_white}></MaterialIcons>
        <AppText style={[styles.text, styles.title]}>{title}</AppText>
      </View>
      <AppText style={styles.text}>{children}</AppText>
      {startNow && (
        <AppText style={styles.text}>
          Start now for just {startNow} JD/month!
        </AppText>
      )}
      {startsAt && (
        <AppText style={styles.text}>
          Plans for businesses start at {startsAt} JD/month!
        </AppText>
      )}
      <RequestBtn
        title={btnText}
        arrow={true}
        color={color}
        backColor={"always_white"}
        style={styles.btn}
      />
    </PostComponent>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical:20
    },
    iconAndTitle: {
      flexDirection: "row",
      alignItems:'center',
      gap:5
    },
    text: {
      color: theme.always_white,
      fontSize: 18,
      fontWeight:'bold'

    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
    },
    btn:{
        padding:2,
        borderRadius:10,
        width:'100%',
        marginTop:5
    }
  });

export default OfferCard;
