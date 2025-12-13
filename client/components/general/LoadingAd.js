import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useRoute } from "@react-navigation/native";

export default function LoadingAd() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const styles = useThemedStyles(getStyles);
  const route = useRoute();

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedBox style={styles.avatar} />
        <View style={styles.headerText}>
          <AnimatedBox style={styles.name} />
          <AnimatedBox style={styles.date} />
        </View>
        <AnimatedBox style={styles.menuDots} />
      </View>

      {/* image Card */}

      {route.name !== "AdminSuggestions" && (
        <AnimatedBox style={styles.image} />
      )}

      {/* Disable Button */}
      {route.name !== "AdminSuggestions" && (
        <AnimatedBox style={styles.disableButton} />
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      borderRadius: 15,
      marginVertical: 20,

      backgroundColor: theme.post,
      marginHorizontal: "auto",
      rowGap: 20,
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6,
    },
    box: {
      display: "flex",
      flexDirection: "column",
    },
    skeleton: {
      backgroundColor: theme.loading,
      borderRadius: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    avatar: {
      width: 40,
      aspectRatio: 1,
      borderRadius: 20,
    },
    headerText: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      width: 120,
      height: 16,
      marginBottom: 6,
    },
    date: {
      width: 80,
      height: 12,
    },
    menuDots: {
      width: 10,
      height: 30,
      borderRadius: 4,
    },
    image: {
      width: "100%",
      aspectRatio: 4 / 4,
      marginBottom: 30,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 22,
    },
    buttonSmall: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    title: {
      width: 200,
      height: 20,
      marginBottom: 12,
    },
  });
