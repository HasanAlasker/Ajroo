import { View, StyleSheet } from "react-native";
import MyProfileContainer from "./MyProfileContainer";
import NotificationBtn from "./NotificationBtn";
import UserPicAndRateContainer from "./UserPicAndRateContainer";
import BigPicAndUsername from "./BigPicAndUsername";
import UserRate from "./UserRate";
import SettingsBtn from "./SettingsBtn";
import SeparatorComp from "./SeparatorComp";
import BackBtn from "./BackBtn";
import BlankBtn from "./BlankBtn";
import { useUser } from "../config/UserContext";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../config/ThemeContext";
import { useRoute } from "@react-navigation/native";
import PhoneNumber from "./post_releated/PhoneNumber";
import BlockBtn from "./BlockBtn";
import BlockedTag from "./BlockedTag";

const formatRating = (rating) => {
  if (rating !== "Unrated Yet") {
    return rating.toFixed(2);
  } else return rating;
};

function TopChunkProfile({
  myProfile,
  isNotification,
  userName,
  userRate,
  sep,
  isPicDisabled,
  settingsPress,
  onImageChange,
  userImage,
  userEmail,
  userPhone,
  profileId,
  isBlocked,
  subscriptionType,
}) {
  const { user } = useUser();
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const route = useRoute();

  return (
    <View style={styles.container}>
      <MyProfileContainer>
        {myProfile ? (
          <NotificationBtn isActive={isNotification}></NotificationBtn>
        ) : (
          <BackBtn></BackBtn>
        )}
        <UserPicAndRateContainer>
          <BigPicAndUsername
            initialImage={userImage}
            userName={userName}
            isEdit={myProfile && !isBlocked}
            isPicDisabled={isPicDisabled}
            onImageChange={onImageChange}
            subscriptionType={subscriptionType}
          ></BigPicAndUsername>
          {user.role === "admin" && (
            <>
              <PhoneNumber phoneNumber={userPhone} />
              <PhoneNumber email={userEmail} />
            </>
          )}
          {route.name === "Profile" && !isBlocked ? (
            <>
              <UserRate userRating={formatRating(userRate)} />
              {/* <UserRate userRating={subscriptionType} /> */}
            </>
          ) : route.name === "Profile" && isBlocked ? (
            <BlockedTag />
          ) : null}
        </UserPicAndRateContainer>
        {myProfile ? (
          <SettingsBtn onPress={settingsPress}></SettingsBtn>
        ) : user.role === "admin" ? (
          <BlockBtn profileId={profileId} isBlocked={isBlocked}></BlockBtn>
        ) : (
          <BlankBtn></BlankBtn>
        )}
      </MyProfileContainer>
      {user.gender === "female" && route.name === "EditProfile" && (
        <View style={styles.iconAndTitle}>
          <FontAwesome6
            name="circle-exclamation"
            color={theme.darker_gray}
            style={styles.icon}
          ></FontAwesome6>
          <AppText style={[styles.note, styles.small]}>
            Note: Profile photos are disabled for female users to protect their
            privacy
          </AppText>
        </View>
      )}
      <SeparatorComp>{sep}</SeparatorComp>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    small: {
      fontSize: 15,
      color: theme.darker_gray,
      fontWeight: "bold",
      textAlign: "center",
    },
    icon: {
      alignSelf: "stretch",
      paddingTop: 4,
    },
    iconAndTitle: {
      width: "90%",
      marginHorizontal: "auto",
      marginTop: "20",
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
    },
  });

export default TopChunkProfile;
