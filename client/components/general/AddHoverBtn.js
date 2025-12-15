import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";

function AddHoverBtn({ onPress }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Feather name="plus" size={25} color={theme.always_white} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingBottom: 10,
      marginTop:10
    },
    btn: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.purple,
      width: 60,
      height: 60,
      borderRadius: 30,
      marginHorizontal: "auto",

      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 5,
    },
  });

export default AddHoverBtn;
