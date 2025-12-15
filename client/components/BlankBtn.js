import { Feather } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";

function BlankBtn({onPress}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <View onPress={onPress} style={styles.container}>
      <Feather name="arrow-left" size={27} color={theme.background}></Feather>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor:theme.background,
    padding:8,
    width:48,
    height:48,
    borderRadius:"50%",
    justifyContent:'center',
    alignItems:'center',
    borderColor:theme.background,
    borderWidth:2
  },
});

export default BlankBtn;
