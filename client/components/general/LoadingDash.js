import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";

export default function LoadingDash() {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedBox style={styles.avatar} />

        <AnimatedBox style={styles.name} />

        <AnimatedBox style={styles.status} />
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      paddingHorizontal: 20,
      paddingVertical: 20,
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
      borderWidth: 2,
      marginVertical: 10,
      borderColor: theme.purple + 80,
    },
    skeleton: {
      backgroundColor: theme.loading,
      borderRadius: 8,
    },
    header: {
      flexDirection: "row",
      gap:20,
      alignItems:'center'
    },
    avatar: {
      width: 32,
      aspectRatio: 1,
      borderRadius: 10,
      marginLeft: 5,
    },
    name: {
      width: 100,
      height: 16,
    },
    status: {
      width: 40,
      height: 14,
    },

  });
