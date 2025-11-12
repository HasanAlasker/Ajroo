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
import PhoneNumber from "./PhoneNumber";

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
  userId,
  ownerId,
  borrowerId,
  iRequested,
  iBorrowed,
  iGave,
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
  borrowStatus,
  rating,
  phoneNumber,
  condition,
  title,
  isDisabled,
  pricePerDay,
  reportReason,
  endDate,
  reporter,
  isDeleted,
}) {
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const { user } = useUser();

  const [isPostMenu, setIsPostMenu] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false); // Add edit modal state

  // console.log("Post component - borrowerId:", borrowerId); // Add this
  // console.log("Post component - ownerId:", ownerId); // Add this

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
          userId={userId}
        />
        {(reportReason || isDeleted) && isMine && (
          <ErrorBox
            firstTitle={reportReason ? "Reason" : 'Note'}
            fistDetail={reportReason ? formatText(reportReason): "This post was disabled by the admins for a suspected violation" }
            secondTitle={reportReason ? "Reporter Id" : ''}
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
          {route.name === "Book" && phoneNumber && (
            <PhoneNumber phoneNumber={phoneNumber} />
          )}
          <RowLableCont>
            <ItemStatus status={status} endDate={endDate} />
          </RowLableCont>
          <RowLableCont>
            {condition && <ItemCondition condition={formatText(condition)} />}
            {route.name !== "Book" && route.name !== "Requests" && (
              <ItemRating rating={rating ? rating : "Unrated Yet"} />
            )}
          </RowLableCont>
          {!(
            (route.name === "Requests" &&
              status === "pending" &&
              isMine === true) ||
            (route.name === "Book" &&
              status === "pending_return" &&
              iGave === true)
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
              requestId={requestId}
              iGave={iGave}
              ownerId={ownerId}
              borrowerId={borrowerId}
              isDeleted={isDeleted}
            />
          )}
          {route.name === "Requests" &&
            status === "pending" &&
            isMine === true && (
              <AcceptRejectBtn requestId={requestId} postId={id} />
            )}
          {route.name === "Book" &&
            status === "pending_return" &&
            iGave === true && (
              <AcceptRejectBtn
                requestId={requestId}
                postId={id}
                iGave={iGave}
                ownerId={ownerId}
                borrowerId={borrowerId}
              />
            )}
        </LableContainer>
      </PostComponent>

      <PostMenu
        isMine={isMine}
        isVisible={isPostMenu}
        onClose={() => setIsPostMenu(false)}
        postId={id}
        onEditPress={handleEditPost} // Pass the edit handler
        isDeleted={isDeleted}
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
