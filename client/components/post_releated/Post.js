import { StyleSheet, View } from "react-native";
import TopOfPost from "./TopOfPost";
import ItmeImage from "./ItmeImage";
import ItemNameAndCat from "./ItemNameAndCat";
import Location from "./Location";
import ItemStatus from "./ItemStatus";
import LableContainer from "./LableContainer";
import ItemRating from "./ItemRating";
import ItemCondition from "./ItemCondition";
import RowLableCont from "./RowLableCont";
import PrimaryBtn from "./PrimaryBtn";
import PostComponent from "./PostComponent";
import useThemedStyles from "../../hooks/useThemedStyles";
import AcceptRejectBtn from "../AcceptRejectBtn";
import { useRoute } from "@react-navigation/native";
import PostMenu from "./PostMenu";
import { useState } from "react";
import ItemPricing from "./ItemPricing";
import EditPostModal from "../EditPostModal";
import { useUser } from "../../config/UserContext";
import ItemBill from "./ItemBill";
import AppText from "../../config/AppText";
import ErrorBox from "../general/ErrorBox";

// Format ISO date to DD/MM/YYYY
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Capitalize first letter and replace underscores with spaces
const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" ");
};

function Post({
  id,
  reportId,
  requestId,
  borrowId,
  // userId,
  iRequested,
  iBorrowed,
  profilePic,
  name,
  date,
  image,
  itemName,
  itemCat,
  city,
  area,
  isMine,
  status,
  rating,
  time,
  condition,
  title,
  isDisabled,
  pricePerDay,
  reportReason,
  endDate,
  reporter,
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
          date={formatDate(date)}
          onPressThree={handelMenu}
          postId={id}
          status={status}
          isMine={isMine}
        />
        {reportReason && (
          <ErrorBox
            firstTitle={"Reason"}
            fistDetail={formatText(reportReason)}
            secondTitle={"Reporter Id"}
            secondDetail={formatText(reporter)}
          />
        )}
        <ItmeImage source={image} />
        {route.name != "Requests" && route.name != "Book" ? (
          <ItemNameAndCat
            itemName={formatText(itemName)}
            itemCat={formatText(itemCat)}
            pricePerDay={pricePerDay}
          />
        ) : (
          <ItemBill billId={borrowId} postId={id}></ItemBill>
        )}

        <LableContainer>
          {area && <Location city={formatText(city)} area={formatText(area)} />}
          <RowLableCont>
            <ItemStatus status={status} endDate={endDate} />
          </RowLableCont>
          <RowLableCont>
            {condition && <ItemCondition condition={formatText(condition)} />}
            <ItemRating rating={rating ? rating : "Unrated Yet"} />
          </RowLableCont>
          {!(
            route.name === "Requests" &&
            status === "pending" &&
            isMine === true
          ) && (
            <PrimaryBtn
              title={title}
              isDisabled={isDisabled}
              status={status}
              isMine={isMine}
              iRequested={iRequested}
              iBorrowed={iBorrowed}
              pricePerDay={pricePerDay}
              postId={id}
              reportId={reportId}
            />
          )}
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
    reportReason: {
      color: theme.error_text,
      fontSize: 18,
      fontWeight: "bold",
    },
    display: {
      width: "100%",
      backgroundColor: theme.error_back,
      borderColor: theme.error_border,
      borderWidth: 2,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      gap: 10,
    },
  });

export default Post;
