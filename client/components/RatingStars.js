import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import AppText from "../config/AppText";

function RatingStars(props) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  const [rating, setRating] = useState(0);

  const handleStarPress = (starNumber) => {
    setRating(starNumber);
    // Optional: call props callback if parent needs to know about rating change
    if (props.onRatingChange) {
      props.onRatingChange(starNumber);
    }
  };

  const getRatingDescription = (rating) => {
    const descriptions = {
      0: "( No rating )",
      1: "( Terrible )",
      2: "( Not great )", 
      3: "( Average )",
      4: "( Very Good )",
      5: "( Amazing )"
    };
    return descriptions[rating] || "No rating";
  };

  return (
    <>
      <AppText style={styles.text}>Rate item</AppText>
      <View style={styles.container}>
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <TouchableOpacity 
            key={starNumber}
            onPress={() => handleStarPress(starNumber)}
          >
            <MaterialCommunityIcons
              name={"star"}
              size={50}
              color={starNumber <= rating ? theme.gold : theme.background}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.display}>
        <View style={styles.row}>
          <AppText style={styles.faded}>Rating: </AppText>
          <AppText style={[styles.bold, styles.text]}>
            {rating} / 5  {getRatingDescription(rating)}
          </AppText>
        </View>
      </View>
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 25
    },
    row: {
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      fontSize: 20,
      color: theme.main_text,
    },
    display: {
      width: "100%",
      backgroundColor: theme.light_gray,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      gap: 10,
      marginTop: 30,
      marginBottom: 30,
    },
    faded: {
      color: theme.darker_gray,
      fontSize: 20,
    },
    bold:{
        fontWeight:'bold'
    }
  });

export default RatingStars;