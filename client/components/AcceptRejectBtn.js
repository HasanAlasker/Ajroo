import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { confirmRequest, deleteRequest } from "../api/request";
import { useAlert } from "../config/AlertContext";
import { useRoute } from "@react-navigation/native";
import { confirmReturn, rejectConfirmation } from "../api/borrow";
import { useEffect, useState } from "react";
import RatingModal from "./post_releated/RatingModal";
import useApi from "../hooks/useApi";
import { getUserById } from "../api/user";
import { useUser } from "../config/UserContext";
import Purchases from "react-native-purchases";

function AcceptRejectBtn({
  postId,
  requestId,
  ownerId,
  borrowerId,
  iGave,
  isRequesterBlocked,
  isOwnerBlocked,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { showAlert, showInfo } = useAlert();
  const [visibleRating, setVisibleRating] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const { user } = useUser();

  const {
    data: fetchedUser,
    loading,
    request: fetchUser,
  } = useApi(getUserById);

  useEffect(() => {
    fetchUser(user.id);
  }, [user]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const activeSubscriptions = customerInfo.activeSubscriptions;
        
        if (activeSubscriptions.length > 0) {
          setUserSubscription(activeSubscriptions[0]);
        } else {
          setUserSubscription(null); // Free tier
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setUserSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const userPostCount = fetchedUser?.postCount;

  const postLimit = () => {
    if (userSubscription === "pro_monthly:pro") return 6;
    else if (userSubscription === "business_starter:starter") return 25;
    else if (userSubscription === "business_premium:premium") return -1; // unlimited
    else return 2; // free tier
  };

  const hasUserExceededLimit = () => {
    if (postLimit() === -1) return false;
    return userPostCount > postLimit();
  };

  const route = useRoute();

  const passedUserId = iGave ? borrowerId : ownerId;

  const shouldBeDisabled = () => {
    if (loading || subscriptionLoading) return true;
    if (route.name === "Requests") {
      if (hasUserExceededLimit()) return true;
      if (isOwnerBlocked) return true;
      if (isRequesterBlocked) return true;
    }
    return false;
  };

  useEffect(() => {
    if (!loading && !subscriptionLoading && hasUserExceededLimit() && !alertShown) {
      setAlertShown(true);

      setTimeout(() => {
        showInfo({
          title: "Post Limit",
          message:
            "You have more posts than your plan allows, delete some posts or upgrade your plan!",
          confirmText: "Close",
        });
      }, 100);
    }
  }, [fetchedUser, loading, subscriptionLoading]);

  const handleAccept = async () => {
    if (route.name === "Requests") {
      const data = {
        startDate: new Date().toISOString(),
      };

      showAlert({
        title: "Accept request?",
        message: "Are you sure you want to accept request?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await confirmRequest(requestId, data);
          } catch (error) {
            showAlert({
              title: "Error",
              message: "Something went wrong.",
              confirmText: "Close",
            });
          }
        },
      });
    } else if (route.name === "Book") {
      showAlert({
        title: "Got item back?",
        message: "Are you sure you got this item back?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await confirmReturn(requestId);
            setVisibleRating(true);
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
  };

  const handleRatingModalClose = () => {
    setVisibleRating(false);
  };

  const handleReject = async () => {
    if (route.name === "Requests") {
      showAlert({
        title: "Delete request?",
        message: "Are you sure you want to delete request?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await deleteRequest(requestId);
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
    if (route.name === "Book") {
      showAlert({
        title: "Didn't get item back?",
        message: "Are you sure you did not get this item back?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          try {
            await rejectConfirmation(requestId);
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
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          disabled={shouldBeDisabled()}
          style={[styles.accept, { opacity: shouldBeDisabled() ? 0.5 : 1 }]}
          onPress={handleAccept}
        >
          <AppText style={styles.text}>Accept</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reject]} onPress={handleReject}>
          <AppText style={[styles.text, { color: theme.purple }]}>
            Reject
          </AppText>
        </TouchableOpacity>
      </View>

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
      flexDirection: "row",
      justifyContent: "space-between",
    },
    accept: {
      backgroundColor: theme.purple,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      paddingTop: 2,
      paddingBottom: 5,
      alignItems: "center",
      marginTop: 20,
      width: "48%",
    },
    reject: {
      backgroundColor: theme.post,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      paddingTop: 2,
      paddingBottom: 5,
      alignItems: "center",
      marginTop: 20,
      width: "48%",
      borderWidth: 2,
      borderColor: theme.purple,
    },
    text: {
      color: theme.always_white,
      fontSize: 18,
      textAlign: "center",
      fontWeight: "bold",
      alignSelf: "center",
    },
  });

export default AcceptRejectBtn;