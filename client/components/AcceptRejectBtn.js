import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { usePosts } from "../config/PostContext";

function AcceptRejectBtn({ postId }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { updatePost, getPostById } = usePosts();

  const currentPost = getPostById(postId);

  const handleAccept = () => {
    // When accepting, move the requester to borrower and change status to taken
    updatePost(postId, {
      status: "taken",
      borrowerId: currentPost?.requesterId, // Move requester to borrower
      requesterId: null, // Clear the request
    });
  };

  const handleReject = () => {
    // When rejecting, clear the request and return to available
    updatePost(postId, {
      status: "available",
      requesterId: null, // Clear the request
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