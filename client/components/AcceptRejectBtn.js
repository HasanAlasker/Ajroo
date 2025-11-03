import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { usePosts } from "../config/PostContext";
import { confirmRequest, deleteRequest } from "../api/request";
import { useAlert } from "../config/AlertContext";

function AcceptRejectBtn({ postId, requestId }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { showAlert, showInfo } = useAlert();

  const handleAccept = async () => {
    const data = {
      startDate: new Date().toISOString(),
    };
    const response = await confirmRequest(requestId, data);
    console.log(response);
  };

  const handleReject = async () => {
    showAlert({
      title: "Delete request?",
      message: "Are you sure you want to delete request?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          await deleteRequest(requestId);
        } catch (error) {
          showAlert({
            title: "Error",
            message: "Something went wrong.",
            confirmText: "Close",
          });
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.accept]} onPress={handleAccept}>
        <AppText style={styles.text}>Accept</AppText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.reject]} onPress={handleReject}>
        <AppText style={[styles.text, { color: theme.purple }]}>Reject</AppText>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    accept: {
      backgroundColor: theme.purple,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      paddingTop: 2,
      paddingBottom: 5,
      alignItems: "center",
      marginTop: 20,
      width: "48%",
    },
    reject: {
      backgroundColor: theme.post,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      paddingTop: 2,
      paddingBottom: 5,
      alignItems: "center",
      marginTop: 20,
      width: "48%",
      borderWidth: 2,
      borderColor: theme.purple,
    },
    text: {
      color: theme.always_white,
      fontSize: 18,
      textAlign: "center",
      fontWeight: "bold",
      alignSelf: "center",
    },
  });

export default AcceptRejectBtn;
