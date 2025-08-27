import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";

function RequestBtn({ title, isActive, onPress, isGreen, isRed, style, disabled=false }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  const buttonColor = () => {
    if(isActive) return theme.purple
    else if(!isActive && !isGreen && !isRed) return theme.post
    else if(isGreen && !isActive) return theme.green
    else if(isRed && !isActive) return theme.red
  }
  const textColor = () => {
    if(isActive || isGreen || isRed) return theme.always_white
    else if(!isActive) return theme.purple
  }
  
  const borderColor = () => {
    if(isGreen) return theme.green
    else if(isRed) return theme.red
    else return theme.purple
  }

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.container, {backgroundColor: buttonColor(), borderColor: borderColor()}, style]}>
      <AppText style={[styles.text, {color: textColor()}]}>{title}</AppText>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "47%",
      backgroundColor: theme.purple,
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
      borderRadius: 10,
      borderWidth:2,
      borderColor:theme.purple
    },
    text: {
      fontSize: 18,
      fontWeight:'bold'
    },
  });

export default RequestBtn;
