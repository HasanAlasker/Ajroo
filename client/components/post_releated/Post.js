import { StyleSheet } from "react-native";
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
import EditPostModal from "../EditPostModal";
import { useUser } from "../../config/UserContext";
import ItemBill from "./ItemBill";
import ErrorBox from "../general/ErrorBox";
import PhoneNumber from "./PhoneNumber";
import { formatDate } from "../../functions/formatDate";
import Description from "./Description";

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
  type,
  itemName,
  itemCat,
  city,
  area,
  isMine,
  status,
  description,
  borrowStatus,
  rating,
  phoneNumber,
  condition,
  title,
  isDisabled,
  pricePerDay,
  sellPrice,
  reportReason,
  endDate,
  reporter,
  isDeleted,
  showUndelete,
  subscriptionType,
  isRequesterBlocked,
  isOwnerBlocked,
  userEmail,
  userPhone,
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
          subscriptionType={subscriptionType}
          isRequesterBlocked={isRequesterBlocked}
        />
        {(reportReason || (isDeleted && isMine)) && (
          <ErrorBox
            firstTitle={reportReason ? "Reason" : "Notice"}
            fistDetail={
              reportReason
                ? formatText(reportReason)
                : "This post has been temporarily disabled by the admins due to a suspected policy violation. It may be permanently removed."
            }
            secondTitle={reportReason ? "Reporter Id" : ""}
            secondDetail={formatText(reporter)}
          />
        )}

        <ItmeImage source={image} />
        {route.name != "Requests" && route.name != "Book" ? (
          <ItemNameAndCat
            itemName={formatText(itemName)}
            itemCat={formatText(itemCat)}
            pricePerDay={pricePerDay}
            sellPrice={sellPrice}
          />
        ) : (
          <ItemBill billId={borrowId} postId={id}></ItemBill>
        )}

        {description && <Description description={description} />}

        <LableContainer>
          {area && <Location city={formatText(city)} area={formatText(area)} />}
          {route.name === "Book" && phoneNumber && (
            <PhoneNumber phoneNumber={phoneNumber} />
          )}
          <RowLableCont>
            <ItemStatus status={status} endDate={endDate} />
            {condition && type === "sell" && (
              <ItemCondition condition={formatText(condition)} />
            )}
          </RowLableCont>
          <RowLableCont>
            {condition && type !== "sell" && (
              <ItemCondition condition={formatText(condition)} />
            )}
            {route.name !== "Book" &&
              route.name !== "Requests" &&
              type !== "sell" && (
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
              pricePerDay={pricePerDay || 0}
              postId={id}
              reportId={reportId}
              requestId={requestId}
              iGave={iGave}
              ownerId={ownerId}
              borrowerId={borrowerId}
              isDeleted={isDeleted}
              userEmail={userEmail}
              userPhone={userPhone}
              postType={type}
            />
          )}
          {route.name === "Requests" &&
            status === "pending" &&
            isMine === true && (
              <AcceptRejectBtn
                requestId={requestId}
                postId={id}
                isRequesterBlocked={isRequesterBlocked}
                isOwnerBlocked={isOwnerBlocked}
              />
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
        showUndelete={showUndelete}
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
      flex: 1,
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
