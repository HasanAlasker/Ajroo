import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function RequestBtn({ title, isActive, onPress, isGreen, isRed, style, disabled=false, arrow=false, color, backColor }) {
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
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.container, {backgroundColor: backColor? theme[backColor] : buttonColor(), borderColor: backColor? theme[backColor] : borderColor()}, style]}>
      <AppText style={[styles.text, {color: color ? theme[color] : textColor()}]}>{title}</AppText>
      {arrow && <MaterialCommunityIcons name="chevron-right-circle-outline" color={theme[color]} size={20}></MaterialCommunityIcons>}
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
      borderRadius: 14,
      borderWidth:2,
      borderColor:theme.purple,
      flexDirection:'row',
      gap:5,
      textAlignVertical:'center'
    },
    text: {
      fontSize: 18,
      fontWeight:'bold'
    },
  });

export default RequestBtn;
