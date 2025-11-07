import {useState} from "react";
import { StyleSheet, ScrollView } from "react-native";
import CardModal from "../CardModal";
import RequestBtn from "../RequestBtn";
import RatingStars from "../RatingStars";
import { rateUser } from "../../api/user";
import { rateItem } from "../../api/post";

function RatingModal({ isVisible, onClose, isOwner, ratedUserId, ratedItemId }) {
  const [itemRating, setItemRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const handleRatingChange = (ratingType, newRating) => {
    if (ratingType === 'item') {
      setItemRating(newRating);
    } else if (ratingType === 'user') {
      setUserRating(newRating);
    }
  };

  const handleConfirm = async () => {
    if (isOwner) {
      // Owner only needs to rate the borrower
      if (userRating > 0) {
        await rateUser(ratedUserId, userRating)
        onClose({ userRating });
      }
    } else {
      // Borrower needs to rate both item and owner
      if (itemRating > 0 && userRating > 0) {
        const responseOne = await rateUser(ratedUserId, userRating)
        const responseTwo =await rateItem(ratedItemId, itemRating)
        onClose({ itemRating, userRating });
      }
    }
  };

  const isDisabled = () => {
    if (isOwner) {
      return userRating === 0;
    } else {
      return itemRating === 0 || userRating === 0;
    }
  };

  return (
    <CardModal isVisibile={isVisible}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {isOwner ? (
          // Owner only rates the borrower
          <RatingStars
            onRatingChange={handleRatingChange}
            ratingType="user"
            title="Rate the borrower"
            subtitle="How was your experience with the person who borrowed your item?"
          />
        ) : (
          // Borrower rates both item and owner
          <>
            <RatingStars
              onRatingChange={handleRatingChange}
              ratingType="item"
              title="Rate the item"
              subtitle="How would you rate the quality and condition of this item?"
            />
            
            <RatingStars
              onRatingChange={handleRatingChange}
              ratingType="user"
              title="Rate the owner"
              subtitle="How was your experience with the item owner?"
            />
          </>
        )}

        <RequestBtn
          isActive={!isDisabled()}
          style={[styles.btn, {opacity: isDisabled() ? 0.5 : 1}]}
          title={"Submit Rating" + (isOwner ? "" : "s")}
          onPress={handleConfirm}
          disabled={isDisabled()}
        />
        
      </ScrollView>
    </CardModal>
  );
}

const styles = StyleSheet.create({
  container: {},
  btn: {
    width: "100%",
    marginTop: 15,
  },
});

export default RatingModal;