import { Octicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { useAlert } from "../config/AlertContext";
import { blockUser, unBlockUser } from "../api/user";


function BlockBtn({ onPress, profileId, isBlocked }) {

  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const {showAlert, showInfo} = useAlert()

  const handleBlock = async () => {
    showAlert({
        title: "Block user?",
        message: "Are you sure you want to block user?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
        try {
          await blockUser(profileId);
          onClose();
        } catch (error) {
          showInfo({
            title: "Error",
            message: "Post could not be deleted.",
            confirmText: "Close",
          });
        }
      },
    })
  }

    const handleUnBlock = async () => {
    showAlert({
        title: "Un-Block user?",
        message: "Are you sure you want to un block user?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
        try {
          await unBlockUser(profileId);
          onClose();
        } catch (error) {
          showInfo({
            title: "Error",
            message: "Post could not be deleted.",
            confirmText: "Close",
          });
        }
      },
    })
  }

  return (
    <View>
      <TouchableOpacity onPress={isBlocked ? handleUnBlock :handleBlock} style={[styles.container, {backgroundColor: isBlocked ? theme.green : theme.red}]}>
        <Octicons name={isBlocked ? "unlock" : "lock"} size={27} color={theme.always_white}></Octicons>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 10,
      width: 48,
      height: 48,
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default BlockBtn;
