import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import PostComponent from "./PostComponent";
import TopOfPost from "./TopOfPost";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { openURL } from "../../functions/openURL";
import { useAlert } from "../../config/AlertContext";

function AdPost({
  adId,
  userId,
  userPic,
  userName,
  userSub,
  image,
  link,
  isApproved,
  isActive,
  expiresAt,
  createdAt,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  return (
    <PostComponent style={styles.container}>
      <View style={styles.topPad}>
        <TopOfPost
          date={"Sponsored"}
          image={userPic}
          isMine={false}
          name={userName}
          subscriptionType={userSub}
          userId={userId}
          hideThree
        />
      </View>
      <Image source={{ uri: image }} style={styles.img} />
      <Pressable style={styles.btn} onPress={() => openURL(link, showAlert)}>
        <AppText style={styles.text}>Learn More</AppText>
        <MaterialCommunityIcons
          name="chevron-right-circle-outline"
          size={20}
          color={theme.always_white}
          style={{ paddingTop: 3 }}
        />
      </Pressable>
    </PostComponent>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 20,
      paddingHorizontal: 0,
      paddingVertical: 0,
      rowGap: 0,
    },
    topPad: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    btn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.purple,
      flex: 1,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    img: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: theme.post,
    },
    text: {
      color: theme.always_white,
      fontSize: 20,
    },
  });

export default AdPost;
