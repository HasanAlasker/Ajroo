import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import LoadingSkeleton from "../post_releated/LoadingSkeleton";
import SafeScreen from "./SafeScreen";
import Navbar from "./Navbar";
import ScrollScreen from "./ScrollScreen";

export default function ProfileLoadingSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const styles = useThemedStyles(getStyles);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const AnimatedBox = ({ style }) => (
    <Animated.View style={[styles.skeleton, { opacity }, style]} />
  );

  return (
    <SafeScreen>
      <ScrollScreen>
        {/* Header with back/notification button and settings */}
        <View style={styles.header}>
          <AnimatedBox style={styles.headerButton} />
          <View style={styles.spacer} />
          <AnimatedBox style={styles.headerButton} />
        </View>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <AnimatedBox style={styles.avatar} />

          {/* Username */}
          <AnimatedBox style={styles.username} />

          {/* Rating Badge */}
          <AnimatedBox style={styles.ratingBadge} />
        </View>

        {/* Separator */}
        <View style={styles.separatorSection}>
          <AnimatedBox style={styles.separatorLine} />
          <AnimatedBox style={styles.separatorText} />
          <AnimatedBox style={styles.separatorLine} />
        </View>

        <LoadingSkeleton />
      </ScrollScreen>

      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: theme.loading,
      borderRadius: 8,
    },
    header: {
      width: "90%",
      flexDirection: "row",
      marginHorizontal: "auto",
      justifyContent: "space-between",
      marginTop: 15,
    },
    headerButton: {
      width: 48,
      height: 48,
      borderRadius: "50%",
    },
    spacer: {
      flex: 1,
    },
    profileSection: {
      alignItems: "center",
      paddingBottom: 20,
      gap: 15,
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: "50%",
    },
    username: {
      width: 150,
      height: 24,
      marginTop: 10,
    },
    ratingBadge: {
      width: 100,
      height: 34,
      borderRadius: 20,

    },
    separatorSection: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical:20,
      gap: 15,
      width:"90%",
      marginHorizontal:'auto'
    },
    separatorLine: {
      flex: 1,
      height: 2,
    },
    separatorText: {
      width: 60,
      height: 16,
    },
 
  });
