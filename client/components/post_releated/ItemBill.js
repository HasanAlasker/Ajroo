import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";
import { usePosts } from "../../config/PostContext";

function ItemBill({ postId }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const {getPostById} = usePosts()
  const currentPost = getPostById(postId)

  return (
    <View style={styles.container}>
      { currentPost.price >= 1 ? (
        <AppText style={styles.text}>Requested {currentPost.requestDuration} {currentPost.requestUnit} for {currentPost.requestPrice} JD</AppText>
      ) : (
        <AppText style={styles.text}>Requested {currentPost.requestDuration} {currentPost.requestUnit} for Free</AppText>
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
