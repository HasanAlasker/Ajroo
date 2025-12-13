import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useRoute } from "@react-navigation/native";

export default function LoadingNews() {
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

  return <AnimatedBox></AnimatedBox>;
}

const getStyles = (theme) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: theme.loading,
      borderRadius: 8,
      height: 160,
      width: "90%",
      marginHorizontal: "auto",
      borderRadius: 15,
      marginVertical: 15,

      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6,
    },
  });
