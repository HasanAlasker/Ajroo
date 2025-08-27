import {useState} from "react";
import { View, StyleSheet } from "react-native";
import CardModal from "./CardModal";
import RequestBtn from "./RequestBtn";
import RatingStars from "./RatingStars";

function RatingModal({ isVisible, onClose, isOwner }) {
  const [currentRating, setCurrentRating] = useState(0);

  const handleRatingChange = (newRating) => {
    setCurrentRating(newRating);
  };

  const handleConfirm = () => {
    // Only proceed if rating is greater than 0
    if (currentRating > 0) {
      // You can pass the rating to parent component if needed
      // onClose(currentRating);
      onClose();
    }
  };

  const isDisabled = currentRating === 0;

  return (
    <CardModal isVisibile={isVisible}>
      <RatingStars onRatingChange={handleRatingChange}></RatingStars>
      <RatingStars onRatingChange={handleRatingChange}></RatingStars>
      <RequestBtn
        isActive={true}
        style={[styles.btn, {opacity: isDisabled ? 0.5 : 1}]}
        title={"Confirm"}
        onPress={handleConfirm}
        disabled={isDisabled}
      ></RequestBtn>
    </CardModal>
  );
}

const styles = StyleSheet.create({
  container: {},
  btn: {
    width: "100%",
    marginTop:15
  },
});

export default RatingModal;