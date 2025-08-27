import { StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { useRoute } from "@react-navigation/native";
import RequestModal from "./RequestModal";
import { useState } from "react";
import RatingModal from "./RatingModal";

function PrimaryBtn({
  title,
  isDisabled,
  isMine,
  iBorrowed,
  iRequested,
  status,
  pricePerDay
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);
  const route = useRoute();

  const shouldBeDisabled = () => {
    if (isDisabled) return true;
    if (!isMine && status === "disabled") return true;
    if (isMine && status === "requested" && route.name === "Profile")
      return true;
    return false;
  };

  const disableButton = () => {
    return shouldBeDisabled() ? theme.ghost : theme.purple;
  };

  const renderBtnText = () => {
    if (isMine) {
      switch (status) {
        case "available":
          return "Disable";
        case "taken":
        case "early":
        case "late":
          return "Got it back";
        case "disabled":
          return "Enable";
        case "requested":
          if (route.name === "Profile") return "Pending...";
          if (route.name === "Requests") return "show_accept_reject";
          break;
        default:
          return "Error";
      }
    }

    if (!isMine) {
      if (status === "disabled") return "Disabled";
      if (iRequested) return "Cancel Request";
      if (iBorrowed) return "Mark Returned";
      return "Request";
    }

    return title || "Action";
  };

  // we should show accept/reject instead
  if (renderBtnText() === "show_accept_reject") {
    return null;
  }

  const [visibleRequest, setVisibileRequest] = useState(false)
  const [visibleRating, setVisibileRating] = useState(false)
  const handlePress = () => {
    if(renderBtnText() === 'Request') setVisibileRequest(true)
    if(renderBtnText()==='Got it back' || renderBtnText() === 'Mark Returned') setVisibileRating(true)
  }


  return (
    <>
      <TouchableOpacity
        disabled={shouldBeDisabled()}
        style={[styles.container, { backgroundColor: disableButton() }]}
        onPress={handlePress} // don't forget this!
      >
        <AppText style={styles.text}>{renderBtnText()}</AppText>
      </TouchableOpacity>
      <RequestModal isVisibile={visibleRequest} onClose={()=> {setVisibileRequest(false)}} pricePerDay={pricePerDay}></RequestModal>
      <RatingModal isOwner={isMine} isVisible={visibleRating} onClose={()=>setVisibileRating(false)}></RatingModal>
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      backgroundColor: theme.purple,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      paddingTop: 4,
      paddingBottom: 7,
      alignItems: "center",
      marginTop: 20,
    },
    text: {
      color: theme.always_white,
      fontSize: 18,
      textAlign: "center",
      fontWeight: "bold",
      alignSelf: "center",
    },
  });

export default PrimaryBtn;
