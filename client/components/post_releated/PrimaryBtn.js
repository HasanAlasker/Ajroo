import { StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { useRoute } from "@react-navigation/native";
import RequestModal from "./RequestModal";
import { useState } from "react";
import RatingModal from "./RatingModal";
import { usePosts } from "../../config/PostContext";
import { useUser } from "../../config/UserContext";
import { useAlert } from "../../config/AlertContext";
import { deletePost, updateStatus } from "../../api/post";
import { deleteReport } from "../../api/report";
import { deleteRequest } from "../../api/request";
import { confirmReturn, markReturned } from "../../api/borrow";

function PrimaryBtn({
  title,
  isDisabled,
  status,
  pricePerDay,
  postId,
  reportId,
  ownerId,
  borrowerId,
  isMine,
  iBorrowed,
  iRequested,
  iGave,
  requestId,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const { updatePost, getPostById } = usePosts();
  const { user } = useUser();
  const { showAlert, showInfo } = useAlert();
  const passedUserId = iGave ? borrowerId : ownerId;

  // console.log("PrimaryBtn - iGave:", iGave); // Add this
  // console.log("PrimaryBtn - ownerId:", ownerId); // Add this
  // console.log("PrimaryBtn - borrowerId:", borrowerId); // Add this
  // console.log("PrimaryBtn - passedUserId:", passedUserId); // Add this

  const [visibleRequest, setVisibileRequest] = useState(false);
  const [visibleRating, setVisibileRating] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  // Get the actual post data to check request status
  const currentPost = getPostById(postId);
  // const iRequested = currentPost?.requesterId === user.id;
  // const iBorrowed = currentPost?.borrowerId === user.id;
  const isAdmin = user.role === "admin";

  const shouldBeDisabled = () => {
    if (isAdmin) return false;
    if (isDisabled) return true;
    if (iBorrowed && status === "pending_return") return true;
    if (!isMine && status === "disabled") return true;
    if (isMine && status === "pending" && (route.name === "Profile" || "Have"))
      return true;
    return false;
  };

  const disableButton = () => {
    return shouldBeDisabled() ? theme.ghost : theme.purple;
  };

  const renderBtnText = () => {
    if (isAdmin && route.name === "Reports") {
      return "Delete Report";
    }
    if (isAdmin && route.name === "Search") {
      return "Contact User";
    }
    if (isAdmin && route.name === "Blocks") {
      return "Delete Completely";
    }
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
        case "pending":
          if (route.name === "Profile" || "Have") return "Pending...";
          if (route.name === "Requests") return "show_accept_reject";
          break;
        default:
          return "Error";
      }
    }

    if (!isMine) {
      if (status === "disabled") return "Disabled";
      if (iRequested) return "Cancel Request";
      if (iBorrowed && status === "active") return "Mark Returned";
      if (iBorrowed && status === "pending_return") return "Pending Confirm...";
      if (iGave) return "Got It Back";
      return "Request";
    }

    return title || "Action";
  };

  // we should show accept/reject instead
  if (renderBtnText() === "show_accept_reject") {
    return null;
  }

  const handleRatingModalClose = () => {
    setVisibileRating(false);

    // Apply pending status update after modal closes
    if (pendingStatusUpdate) {
      updatePost(postId, { status: pendingStatusUpdate });
      setPendingStatusUpdate(null);
    }
  };

  const handlePress = async () => {
    const buttonText = renderBtnText();

    if (buttonText === "Delete Completely") {
      showAlert({
        title: "Delete completely?",
        message: "Are you sure you delete post? this can't be undone.",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await deletePost(postId);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Delete Report") {
      showAlert({
        title: "Delete Report?",
        message: "Are you sure you want to delete report?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await deleteReport(reportId);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Request") {
      setVisibileRequest(true);
    }

    if (buttonText === "Mark Returned") {
      showAlert({
        title: "Gave it back?",
        message: "Are you sure you returned item back?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await markReturned(requestId);
            setVisibileRating(true);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Got It Back") {
      showAlert({
        title: "Got it back?",
        message: "Are you sure you got this item back?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            setVisibileRating(true);
            await confirmReturn(requestId);
          } catch (error) {
            showInfo({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Disable") {
      showAlert({
        title: "Disable post?",
        message: "Are you sure you want to disable post?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await updateStatus(postId, { status: "disabled" });
          } catch (error) {
            showInfo({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Enable") {
      await updateStatus(postId, { status: "available" });
    }

    if (buttonText === "Cancel Request") {
      showAlert({
        title: "Cancel request?",
        message: "Are you sure you want to cancel request?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await deleteRequest(requestId);
          } catch (error) {
            showInfo({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        disabled={shouldBeDisabled()}
        style={[styles.container, { backgroundColor: disableButton() }]}
        onPress={handlePress}
      >
        <AppText style={styles.text}>{renderBtnText()}</AppText>
      </TouchableOpacity>

      <RequestModal
        isVisibile={visibleRequest}
        onClose={() => {
          setVisibileRequest(false);
        }}
        pricePerDay={pricePerDay}
        onRequestSubmit={() => {
          // The component will re-render automatically when post data changes
        }}
        postId={postId}
      />

      <RatingModal
        isOwner={iGave}
        isVisible={visibleRating}
        ratedItemId={postId}
        ratedUserId={passedUserId}
        onClose={handleRatingModalClose}
      />
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
