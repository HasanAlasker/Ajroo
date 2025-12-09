import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import PostComponent from "./post_releated/PostComponent";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AppText from "../config/AppText";
import RequestBtn from "./RequestBtn";
import { formatDate } from "../functions/formatDate";
import { activateNews, deactivateNews, deleteNews } from "../api/news";
import { useAlert } from "../config/AlertContext";
import { useUser } from "../config/UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { openURL } from "../functions/openURL";

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
  style,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { user } = useUser();
  const route = useRoute();

  const { showAlert, showInfo } = useAlert();
  const navigation = useNavigation();

  const [active, setActive] = useState(isActive);

  const isAdmin = user.role === "admin";

  const handleDelete = async () => {
    showAlert({
      title: "Delete news?",
      message: "Are you sure you want to delete news?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          await deleteNews(id);
        } catch (error) {
          showAlert({
            title: "Error",
            message: "Something went wrong.",
            confirmText: "Close",
          });
        }
      },
    });
  };

  const handleActivation = async () => {
    if (!active) {
      showAlert({
        title: "Activate news?",
        message: "Are you sure you want to activate news?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await activateNews(id);
            setActive(!active);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    } else {
      showAlert({
        title: "Deactivate news?",
        message: "Are you sure you want to deactivate news?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await deactivateNews(id);
            setActive(!active);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }
  };

  return (
    <PostComponent
      style={[
        styles.container,
        {
          backgroundColor: theme[backGroundColor],
          borderColor: theme[borderColor],
        },
        style,
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

      {isAdmin && (
        <>
          {route.name !== "Dash" && (
            <View style={styles.btnBox}>
              <RequestBtn
                title={"Edit"}
                color={backGroundColor}
                backColor={"always_white"}
                style={styles.btn}
                onPress={() =>
                  navigation.navigate("EditNews", {
                    id,
                    title,
                    icon,
                    description,
                    backGroundColor,
                    textColor,
                    borderColor,
                  })
                }
              />
              <RequestBtn
                title={"Delete"}
                color={backGroundColor}
                backColor={"always_white"}
                style={styles.btn}
                onPress={handleDelete}
              />
            </View>
          )}

          <RequestBtn
            title={active ? "Deactivate" : "Activate"}
            color={backGroundColor}
            backColor={"always_white"}
            style={styles.fullBtn}
            onPress={handleActivation}
          />

          {actionButton && !isAdmin && (
            <RequestBtn
              title={"Update App"}
              color={backGroundColor}
              backColor={"always_white"}
              style={styles.fullBtn}
              onPress={() =>
                openURL(
                  Platform.OS === "android"
                    ? "https://play.google.com/store/apps/details?id=com.hasan_alasker.Ajroo"
                    : "" // add apple store link when you have it
                )
              }
              arrow
            />
          )}
        </>
      )}
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
      fontSize: 18,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
    },
    btnBox: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      flex: 1,
    },
    btn: {
      padding: 2,
      borderRadius: 10,
      marginTop: 5,
      marginBottom: 0,
      width: "47%",
    },
    fullBtn: {
      padding: 2,
      width: "100%",
    },
  });

export default NewsCard;
