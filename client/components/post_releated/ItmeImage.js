import { View, StyleSheet, Image } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";

function ItmeImage({source}) {
  const styles = useThemedStyles(getStyles);

  return <View style={styles.itemImage}>
    <Image source={{uri: source}} style={styles.image}></Image>
  </View>;
}

const getStyles = (theme) => StyleSheet.create({
  itemImage: {
      width: "100%",
      height: "250",
      backgroundColor: theme.sec_text,
      borderRadius: 15,
      overflow:'hidden'
    },
    image:{
      width:'100%',
      height:'250',
      resizeMode:'cover'
    }
});

export default ItmeImage;
