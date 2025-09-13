import { StyleSheet } from "react-native";
import TopOfPost from "../TopOfPost";
import ItmeImage from "./ItmeImage";
import ItemNameAndCat from "./ItemNameAndCat";
import Location from "./Location";
import ItemStatus from "./ItemStatus";
import LableContainer from "../LableContainer";
import ItemRating from "./ItemRating";
import ItemCondition from "./ItemCondition";
import RowLableCont from "../RowLableCont";
import PrimaryBtn from "./PrimaryBtn";
import PostComponent from "./PostComponent";
import useThemedStyles from "../../hooks/useThemedStyles";
import AcceptRejectBtn from "../AcceptRejectBtn";
import { useRoute } from "@react-navigation/native";
import PostMenu from "./PostMenu";
import { useState } from "react";
import ItemPricing from "./ItemPricing";
import EditPostModal from "../EditPostModal"; // Import the EditPostModal here
import { useUser } from "../../config/UserContext";

function Post({
  id,
  userId,
  requesterId,
  borrowerId,
  profilePic,
  name,
  date,
  image,
  itemName,
  itemCat,
  city,
  area,
  isMine,
  iBorrowed,
  status,
  rating,
  time,
  condition,
  title,
  isDisabled,
  pricePerDay,
}) {
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const { user } = useUser();

  const [isPostMenu, setIsPostMenu] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false); // Add edit modal state

  const handelMenu = () => {
    setIsPostMenu(!isPostMenu);
  };

  const handleEditPost = () => {
    setIsEditModal(true);
    setIsPostMenu(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModal(false);
  };

  return (
    <>
      <PostComponent style={styles.post}>
        <TopOfPost
          image={profilePic}
          name={name}
          date={date}
          onPressThree={handelMenu}
          postId={id}
          status={status}
          isMine={isMine}
        />
        <ItmeImage source={image} />
        <ItemNameAndCat
          itemName={itemName}
          itemCat={itemCat}
          pricePerDay={pricePerDay}
        />
        <LableContainer>
          {area && <Location city={city} area={area} />}
          <RowLableCont>
            <ItemStatus status={status} time={time} />
          </RowLableCont>
          <RowLableCont>
            {condition && <ItemCondition condition={condition} />}
            <ItemRating rating={rating ? rating : "Unrated Yet"} />
          </RowLableCont>
          {
            <PrimaryBtn
              title={title}
              isDisabled={isDisabled}
              status={status}
              isMine={isMine}
              iBorrowed={iBorrowed}
              pricePerDay={pricePerDay}
              postId={id}
            />
          }
          {route.name === "Requests" &&
            status === "pending" &&
            isMine === true && <AcceptRejectBtn postId={id} />}
        </LableContainer>
      </PostComponent>

      <PostMenu
        isMine={isMine}
        isVisible={isPostMenu}
        onClose={() => setIsPostMenu(false)}
        postId={id}
        onEditPress={handleEditPost} // Pass the edit handler
      />

      <EditPostModal
        postId={id}
        visible={isEditModal}
        onClose={handleCloseEditModal}
      />
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    post: {
      marginVertical: 20,
      zIndex: 50,
    },
  });

export default Post;
