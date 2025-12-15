import { View, StyleSheet } from "react-native";
import AppText from "../config/AppText";
import CardModal from "../components/CardModal";
import RequestBtn from "../components/RequestBtn";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { usePosts } from "../config/PostContext";
import { useUser } from "../config/UserContext";
import ItmeImage from "../components/post_releated/ItmeImage";
import LableContainer from "../components/post_releated/LableContainer";
import ItemNameAndCat from "../components/post_releated/ItemNameAndCat";

function GetBackModal({
  isVisibile,
  onClose,
  pricePerDay,
  onRequestSubmit,
  postId,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { user } = useUser();
  const { updatePost } = usePosts();

  const handleYes = () => {
    updatePost(postId, {
      status: "available",
      borrowerId: null,
      requestDuration: null,
      requestUnit: null,
      requestPrice: null,
    });
    onClose();
  };

  return (
    <CardModal isVisibile={isVisibile}>
      <AppText style={styles.text}>Did you get this item back?</AppText>
      <View style={styles.box}>
        <ItmeImage />
        <LableContainer>
          <ItemNameAndCat
            itemCat={"Electronics"}
            itemName={"Nintendo Switch"}
            showPrice={false}
          />
        </LableContainer>
      </View>

      <View style={styles.buttons}>
        <View style={styles.buttons}>
          <RequestBtn
            title={"Yes"}
            isGreen={true}
            onPress={handleYes}
          ></RequestBtn>
          <RequestBtn title={"No"} isRed={true} onPress={onClose}></RequestBtn>
        </View>
      </View>
    </CardModal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    row: {
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      fontSize: 20,
      color: theme.main_text,
      fontWeight:'bold',
      marginBottom:10
    },
    buttons: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
      rowGap: 20,
      justifyContent: "space-between",
      marginTop: 10,
    },
    display: {
      width: "100%",
      backgroundColor: theme.light_gray,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      gap: 10,
      marginTop: 30,
      marginBottom: 30,
    },
    faded: {
      color: theme.darker_gray,
      fontSize: 20,
    },
    fullBtn: {
      width: "100%",
      marginTop: 40,
    },
    small: {
      fontSize: 15,
    },
    box:{
        gap:20,
        marginBottom:30,
        marginTop:20
    }
  });

export default GetBackModal;
