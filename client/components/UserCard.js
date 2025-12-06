import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import PostComponent from "./post_releated/PostComponent";
import TopOfPost from "./post_releated/TopOfPost";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import RowLableCont from "./post_releated/RowLableCont";
import PostMenu from "./post_releated/PostMenu";
import { formatDate } from "../functions/formatDate";

function UserCard({
  image,
  name,
  gender,
  strikes,
  rating,
  ratingCount,
  createdAt,
  userId,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const [isPostMenu, setIsPostMenu] = useState(false);

  return (
    <>
      <PostComponent style={styles.container}>
        <TopOfPost
          image={image}
          name={name}
          date={formatDate(createdAt)}
          isMine={false}
          userId={userId}
          postId={userId}
          onPressThree={()=>setIsPostMenu(true)}
        />

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {/* Gender Badge */}
          <View
            style={[
              styles.statBadge,
              {
                backgroundColor: theme.purple + "0F",
                borderColor: theme.purple,
                borderWidth: 1.4,
              },
            ]}
          >
            <AppText style={[styles.statLabel, { color: theme.purple }]}>
              Gender
            </AppText>
            <AppText style={[styles.statValue, { color: theme.purple }]}>
              {gender}
            </AppText>
          </View>

          {/* Rating Section */}
          <View
            style={[
              styles.statBadge,
              {
                backgroundColor: theme.green + "0F",
                borderColor: theme.green,
                borderWidth: 1.4,
              },
            ]}
          >
            <AppText style={[styles.statLabel, { color: theme.green }]}>
              Rating
            </AppText>
            <View style={styles.ratingRow}>
              <AppText style={[styles.ratingValue, { color: theme.green }]}>
                {rating.toFixed(2)}
              </AppText>
              <AppText style={[styles.ratingCount, { color: theme.green }]}>
                ({ratingCount})
              </AppText>
            </View>
          </View>

          {/* Strikes Warning */}
          <View
            style={[
              styles.statBadge,
              {
                backgroundColor: theme.red + "0F",
                borderColor: theme.red,
                borderWidth: 1.4,
              },
            ]}
          >
            <AppText style={[styles.statLabel, { color: theme.red }]}>
              Strikes
            </AppText>
            <AppText style={[styles.strikeValue, { color: theme.red }]}>
              {strikes > 0 ? ` ${strikes}` : "0"}
            </AppText>
          </View>
        </View>
      </PostComponent>
      <PostMenu
        isMine={false}
        isVisible={isPostMenu}
        onClose={() => setIsPostMenu(false)}
        userId={userId}
      />
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 20,
    },
    statsContainer: {
      marginTop: 10,
      marginBottom: 5,
      gap: 12,
    },
    statBadge: {
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statLabel: {
      fontSize: 18,
      fontWeight: "bold",
      //   letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
    },
    ratingValue: {
      fontSize: 18,
      fontWeight: "bold",
    },
    ratingCount: {
      fontSize: 17,
      fontWeight: "bold",
    },
    strikeValue: {
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default UserCard;
