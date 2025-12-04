import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import AppText from "../config/AppText";

function SquareCard({ icon, name, cardnum, onPress }) {
  const { theme } = useTheme();

  const styles = useThemedStyles(getStyles);

  const getBackgroundColor = () => {
    if (cardnum === 1) {
      return theme.card1;
    } else if (cardnum === 2) {
      return theme.card2;
    } else if (cardnum === 3) {
      return theme.card3;
    } else if (cardnum === 4) {
      return theme.card4;
    } else if (cardnum === 5) {
      return theme.card5;
    } else if (cardnum === 6) {
      return theme.card6;
    } else if (cardnum === 7) {
      return theme.card7;
    } else if (cardnum === 8) {
      return theme.card8;
    }
    else if (cardnum === 9) {
      return theme.card9;
    }
    else if (cardnum === 10) {
      return theme.card10;
    }
    else if (cardnum === 11) {
      return theme.card11;
    }
    else if (cardnum === 12) {
      return theme.card12;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={90}
        color={theme.always_white}
      ></MaterialCommunityIcons>
      <AppText style={[styles.text]}>{name}</AppText>
    </TouchableOpacity>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "47%",
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 15,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,

      elevation: 7,
    },
    text: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.always_white,
    },
  });

export default SquareCard;