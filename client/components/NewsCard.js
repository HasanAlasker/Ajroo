import React from "react";
import { View, StyleSheet } from "react-native";
import PostComponent from "./post_releated/PostComponent";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AppText from "../config/AppText";
import RequestBtn from "./RequestBtn";
import { formatDate } from "../functions/formatDate";

function NewsCard({
  id,
  title,
  description,
  backGroundColor,
  textColor,
  borderColor,
  icon,
  createdAt,
  actionButton,
  isActive,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <PostComponent
      style={[
        styles.container,
        {
          backgroundColor: theme[backGroundColor],
          borderColor: theme[borderColor],
        },
      ]}
    >
      <View style={styles.heading}>
        <View style={styles.iconAndTitle}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={35}
              color={theme[textColor]}
            ></MaterialIcons>
          )}
          <AppText
            style={[styles.text, styles.title, { color: theme[textColor] }]}
          >
            {title}
          </AppText>
        </View>

        <AppText style={[styles.text, { color: theme[textColor] }]}>
          {formatDate(createdAt)}
        </AppText>
      </View>

      <AppText
        style={[styles.text, styles.description, { color: theme[textColor] }]}
      >
        {description}
      </AppText>

      <RequestBtn
        title={"Edit"}
        color={backGroundColor}
        backColor={'always_white'}
        style={styles.btn}
      />
      <RequestBtn
        title={"Activate"}
        color={backGroundColor}
        backColor={'always_white'}
        style={styles.btn}
      />
      <RequestBtn
        title={"Delete"}
        color={backGroundColor}
        backColor={'always_white'}
        style={styles.btn}
      />
    </PostComponent>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 15,
      // paddingBottom: 25,
      borderWidth: 2,
    },
    heading: { gap: 5 },
    iconAndTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    text: {
      color: theme.always_white,
      fontSize: 16,
    },
    description: {
      color: theme.always_white,
      fontSize: 20,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
    },
    btn: {
      padding: 2,
      borderRadius: 10,
      width: "100%",
      marginTop: 5,
      marginBottom:0,
    },
    
  });

export default NewsCard;
