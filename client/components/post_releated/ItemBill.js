import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";
import { usePosts } from "../../config/PostContext";
import useApi from "../../hooks/useApi";
import { getPostById } from "../../api/post";
import { useEffect } from "react";

function ItemBill({ postId }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const currentPost = getPostById(postId)
  const {request: fetchedPost, data:post} = useApi(getPostById)  // you should get the request not the post

  useEffect(()=>{
    fetchedPost()
  },[postId])

  return (
    <View style={styles.container}>
      { post.pricePerDay >= 1 ? (
        <AppText style={styles.text}>Requested {post.requestDuration} {post.requestUnit} for {post.totalPrice} JD</AppText>
      ) : (
        <AppText style={styles.text}>Requested {post.requestDuration} {post.requestUnit} for Free</AppText>
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      fontSize: 20,
      color: theme.green,
      fontWeight: "bold",
    },
  });

export default ItemBill;
