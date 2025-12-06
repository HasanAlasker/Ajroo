import { StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import RequestModal from "./RequestModal";
import { useEffect, useState } from "react";
import RatingModal from "./RatingModal";
import { usePosts } from "../../config/PostContext";
import { useUser } from "../../config/UserContext";
import { useAlert } from "../../config/AlertContext";
import { deletePost, softDelete, unDelete, updateStatus } from "../../api/post";
import { deleteReport } from "../../api/report";
import { deleteRequest, sentRequests } from "../../api/request";
import { confirmReturn, markReturned } from "../../api/borrow";
import useApi from "../../hooks/useApi";
import { getUserById } from "../../api/user";
import * as Clipboard from "expo-clipboard";

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
  isDeleted,
  userEmail,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const navigation = useNavigation();
  const { updatePost, getPostById } = usePosts();
  const { user } = useUser();
  const { showAlert, showInfo } = useAlert();
  const passedUserId = iGave ? borrowerId : ownerId;

  const [visibleRequest, setVisibileRequest] = useState(false);
  const [visibleRating, setVisibileRating] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [btnText, setBtnText] = useState("");

  const isAdmin = user.role === "admin";

  const { data: fetchedUser, request: fethUser, loading } = useApi(getUserById);

  const {
    data: myRequests,
    loading: loadingRequests,
    request: fetchMyRequests,
  } = useApi(sentRequests);

  useEffect(() => {
    fethUser(user.id);
    fetchMyRequests(user.id);
  }, [user]);

  const isItemRequested = () => {
    return myRequests.some((request) => request.item._id === postId);
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(userEmail);
      showInfo({
        title: "Copied!",
        message: "Email copied to clipboard.",
        confirmText: "Close",
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to copy email.",
        confirmText: "Close",
      });
    }
  };

  const shouldBeDisabled = () => {
    if (isAdmin) return false;
    if (isDeleted) return true;
    // if (isItemRequested() && route.name === 'Have') return true;
    if (fetchedUser.isBlocked && route.name !== "Book") return true;
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
      return "Email User";
    }
    if (isAdmin && route.name === "Blocks") {
      return "Delete Completely";
    }
    if (isAdmin && route.name === "Profile" && !isDeleted) {
      return "Delete Post";
    }
    if (isAdmin && route.name === "Profile" && isDeleted) {
      return "Un-Delete Post";
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
      if (loadingRequests && route.name === "Have") return "Loading...";
      if (isItemRequested() && route.name === "Have")
        return "Pending Request...";
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
    // const buttonText = btnText || renderBtnText();
    const buttonText = renderBtnText();

    if (buttonText === "Pending Request...") navigation.navigate("Requests");

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

    if (buttonText === "Delete Post") {
      showAlert({
        title: "Soft-Delete post?",
        message: "Are you sure, you can restore it later.",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: async () => {
          try {
            await softDelete(postId);
            onClose();
          } catch (error) {
            showInfo({
              title: "Error",
              message: "Post could not be deleted.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Un-Delete Post") {
      showAlert({
        title: "Restore post?",
        message: "Are you sure you want to bring it back?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await unDelete(postId);
            onClose();
          } catch (error) {
            showInfo({
              title: "Error",
              message: "Post could not be deleted.",
              confirmText: "Close",
            });
          }
        },
      });
    }

    if (buttonText === "Email User") {
      handleCopy();
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
            // setBtnText("Enable")
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
      showInfo({
        title: "Success",
        message: "Post was enabled, refresh page to see it!"
      })
      // setBtnText("Disable")
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

  useEffect(() => {
    setBtnText(renderBtnText());
  }, [status, isDeleted, isMine]);

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
