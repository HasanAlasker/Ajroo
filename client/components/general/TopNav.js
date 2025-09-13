import { View, StyleSheet, TouchableOpacity } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../config/ThemeContext";

function TopNav({ activeTab, onTabChange }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const route = useRoute();

  const isActive = (tabName) => {
    return activeTab === tabName;
  };

  // Determine the correct tab values based on route
  const firstTab = route.name === "Book" ? "Given" : "Got";
  const secondTab = route.name === "Book" ? "Taken" : "Sent";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onTabChange(firstTab)}>
          <AppText style={[
            styles.text, 
            isActive(firstTab) && {color: theme.purple, fontWeight: 'bold'}
          ]}>
            {firstTab}
          </AppText>
        </TouchableOpacity>
        
        <View style={styles.line}></View>
        
        <TouchableOpacity onPress={() => onTabChange(secondTab)}>
          <AppText style={[
            styles.text,
            isActive(secondTab) && {color: theme.purple, fontWeight: 'bold'}
          ]}>
            {secondTab}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingTop: 15,
      borderBottomRightRadius: 30,
      borderBottomLeftRadius: 30,
      zIndex: 88,
      paddingBottom: 10,
      backgroundColor: theme.backgroundColor,
    },
    row: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    },
    text: {
      fontSize: 20,
      color: theme.sec_text,
    },
    line: {
      backgroundColor: theme.sec_text,
      height: 25,
      width: 2,
    },
  });

export default TopNav;