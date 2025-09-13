import { StyleSheet, View } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";

function PostComponent({ children, style }) {
  const styles = useThemedStyles(getStyles);

  return <View style={[styles.post, style]}>{children}</View>;
}
const getStyles = (theme) =>
  StyleSheet.create({
    post: {
      width: "90%",
      paddingHorizontal: 20,
      paddingVertical:20,
      borderRadius: 15,

      backgroundColor: theme.post,
      marginHorizontal: "auto",
      rowGap: 20,
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6,
    },
  });
export default PostComponent;
