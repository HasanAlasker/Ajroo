import { View, StyleSheet } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import AppText from "../config/AppText";
import { Octicons } from "@expo/vector-icons";

function ItemStatus({status, type, time}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  const getColor = ()=>{  // Pure genius solution
    switch(status){
        case 'available': return theme.green
        case 'taken': return theme.red
        case 'disabled': return theme.sec_text
        case 'pending': return theme.orange
        case 'late': return theme.red
        case 'early': return theme.green 
    }
    
  }
  const getStatusText = () => {
    switch(status) {
      case "available": return "Available";
      case "disabled": return "Disabled"; 
      case 'pending': return "Pending"
      case "late": return `${time} late`;
      case "early": return `${time} left`;
      default: return "Taken";
    }
  }

  return (
    <View style={styles.container}>
      <Octicons name="clock" size={18} color={getColor()}></Octicons>
      <AppText style={[styles.text, {color: getColor()}]}>{getStatusText()}</AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    text: {
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default ItemStatus;
