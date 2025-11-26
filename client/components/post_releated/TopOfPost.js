import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import AppText from "../../config/AppText";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../../config/UserContext";

function TopOfPost({
  name,
  date,
  image,
  onPressThree,
  postId,
  status,
  isMine,
  userId,
  subscriptionType,
  isRequesterBlocked,
  isOwnerBlocked,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const navigate = useNavigation();
  const { user } = useUser();
  const route = useRoute();

  const handelOpenProfile = () => {
    navigate.navigate("Profile", { userId: userId });
  };

  const renderProfileImage = () => {
    // Check if image is a valid URI string
    if (image && typeof image === "string" && image.trim() !== "") {
      return (
        <Image
          source={{ uri: image }}
          style={styles.pic}
          onError={(error) => {
            console.log(
              "Error loading profile image:",
              error.nativeEvent.error
            );
          }}
        />
      );
    }
    // Check if image is a require() statement (local image)
    else if (image && typeof image === "number") {
      return <Image source={image} style={styles.pic} />;
    }
    // Default placeholder when no valid image
    else {
      return (
        <View style={styles.placeholderContainer}>
          <MaterialCommunityIcons
            name="account"
            size={25}
            color={theme.light_gray}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.topPart}>
      <TouchableOpacity
        onPress={handelOpenProfile}
        style={styles.picAndNameAndDate}
      >
        <View style={styles.imageHolder}>{renderProfileImage()}</View>
        <View style={styles.nameAndDate}>
          <View style={styles.nameAndBadge}>
            <AppText numberOfLines={1} style={styles.name}>
              {name}
            </AppText>
            {!isRequesterBlocked &&
              (subscriptionType === "Starter" ||
                subscriptionType === "Premium") && (
                <MaterialCommunityIcons
                  name={
                    subscriptionType === "Starter" ? "check-circle" : "crown"
                  }
                  size={subscriptionType === "Starter" ? 17 : 22}
                  color={
                    subscriptionType === "Starter" ? theme.blue : theme.purple
                  }
                  style={{ paddingTop: subscriptionType === "Starter" ? 2 : 0 }}
                />
              )}
            {isRequesterBlocked && (
              <MaterialCommunityIcons
                name={"account-remove"}
                size={20}
                color={theme.red}
              />
            )}
          </View>
          <AppText style={styles.date}>{date}</AppText>
        </View>
      </TouchableOpacity>
      {(((status === "available" || status === "disabled") && isMine) ||
        !isMine) &&
        !(user.role === "admin" && route.name === "Profile") && (
          <TouchableOpacity onPress={onPressThree}>
            <Feather
              name="more-vertical"
              size={30}
              style={styles.more}
            ></Feather>
          </TouchableOpacity>
        )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    picAndNameAndDate: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      flex: 1,
    },
    nameAndDate: {
      gap: 0,
      flex: 1,
    },
    imageHolder: {
      width: 40,
      aspectRatio: 1,
      backgroundColor: theme.sec_text,
      borderRadius: 20,
      overflow: "hidden",
    },
    name: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.main_text,
      // flex: 1,
      flexWrap: "wrap",
    },
    nameAndBadge: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingRight: 35,
    },
    date: {
      fontSize: 14,
      color: theme.sec_text,
      fontWeight: "600",
    },
    topPart: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
    },
    more: {
      left: 10,
      color: theme.main_text,
    },
    pic: {
      width: "100%",
      height: 40,
      resizeMode: "cover",
    },
    placeholderContainer: {
      width: "100%",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.sec_text,
    },
  });

export default TopOfPost;
