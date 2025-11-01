import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  Dimensions,
  Share,
} from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { useUser } from "../../config/UserContext";

import BackContainer from "../BackContainer";
import MenuBackBtn from "../MenuBackBtn";
import MenuOption from "../MenuOption";
import SeparatorComp from "../SeparatorComp";
import { useAlert } from "../../config/AlertContext";
import { deletePost, getPostById, softDelete, unDelete } from "../../api/post";
import { reportPost } from "../../api/report";
import useApi from "../../hooks/useApi";

const { height: screenHeight } = Dimensions.get("window");

function PostMenu({
  isVisible,
  onClose,
  isMine,
  postId,
  onEditPress,
  shareContent,
}) {
  const styles = useThemedStyles(getStyles);
  const [reportMenu, setReportMenu] = useState(false);
  const { showAlert, showInfo } = useAlert();
  const { user } = useUser();
  const {
    data: post,
    request: fetchPost,
    error,
    loading,
  } = useApi(getPostById);

  const isAdmin = user.role === "admin";

  useEffect(()=>{
    if(postId){
      fetchPost(postId)
    }
  },[])

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: shareContent?.message || "Check this out!",
        url: shareContent?.url || "",
        title: shareContent?.title || "Share",
      });

      if (result.action === Share.sharedAction) {
        // User shared
        onClose(); // Close AFTER sharing
      } else if (result.action === Share.dismissedAction) {
        // User dismissed
        onClose(); // Still close if dismissed
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while sharing");
    }
  };

  const handleReportMenu = () => {
    setReportMenu(!reportMenu);
  };

  const handleReporReason = async (reason) => {
    console.log(reason);
    await reportPost(postId, { reason: reason });
    setReportMenu(!reportMenu);
    onClose();

    showInfo({
      title: "Success",
      message: "Post report sent to admins to check.",
      confirmText: "Close",
    });
  };

  const handleEditPost = () => {
    if (onEditPress) {
      onEditPress();
    }
  };

  const handleDeletePost = () => {
    showAlert({
      title: "Delete Item",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deletePost(postId);
          onClose(); // Close the menu after deleting
        } catch (error) {
          showInfo({
            title: "Error",
            message: "Post could not be deleted.",
            confirmText: "Close",
          });
        }
      },
    });
  };

    const handleUnDelete = () => {
    showAlert({
      title: "UnDelete Item",
      message: "Do you want to unDelete post?",
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await unDelete(postId);
          onClose(); // Close the menu after deleting
        } catch (error) {
          showInfo({
            title: "Error",
            message: "Post could not be UnDeleted.",
            confirmText: "Close",
          });
        }
      },
    });
  };

  const handleSoftDelete = () => {
    // for admin deletion
    showAlert({
      title: "Soft Delete item",
      message: "Are you sure you want to delete this post?",
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
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <BackContainer>
          <MenuBackBtn
            onClose={!reportMenu ? onClose : () => setReportMenu(!reportMenu)}
          />
          {!reportMenu && (
            <>
              {!isAdmin && (
                <>
                  <MenuOption
                    text={"Share post"}
                    icon={"share-outline"}
                    onPress={handleShare}
                  />
                  <SeparatorComp style={styles.sep} />
                </>
              )}
              {isMine && (
                <MenuOption
                  text={"Edit post"}
                  icon={"pencil-outline"}
                  onPress={handleEditPost}
                />
              )}
              {isMine && <SeparatorComp style={styles.sep} />}
              {isMine ? (
                <MenuOption
                  text={"Delete post"}
                  icon={"delete-outline"}
                  color={"red"}
                  onPress={handleDeletePost}
                />
              ) : isAdmin && !post.isDeleted ? (
                <MenuOption
                  text={"Delete post"}
                  icon={"delete-outline"}
                  color={"red"}
                  onPress={handleSoftDelete}
                />
              ) : isAdmin && post.isDeleted ? (
                <MenuOption
                  text={"UnDelete post"}
                  icon={"arrow-u-left-top"}
                  color={"green"}
                  onPress={handleUnDelete}
                />
              ) : (
                <MenuOption
                  text={"Report post"}
                  icon={"bullhorn-variant-outline"}
                  color={"red"}
                  onPress={handleReportMenu}
                />
              )}
            </>
          )}

          {reportMenu && (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
              >
                <MenuOption
                  text={"Item doesn't exist/fake listing"}
                  icon={"alert-circle-outline"}
                  onPress={() =>
                    handleReporReason("Item doesn't exist/fake listing")
                  }
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Misleading item description"}
                  icon={"information-off-outline"}
                  onPress={() =>
                    handleReporReason("Misleading item description")
                  }
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Unsafe or damaged item"}
                  icon={"shield-alert-outline"}
                  onPress={() => handleReporReason("Unsafe or damaged item")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Spam or duplicate listing"}
                  icon={"content-copy"}
                  onPress={() => handleReporReason("Spam or duplicate listing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Unreasonable pricing"}
                  icon={"currency-usd-off"}
                  onPress={() => handleReporReason("Unreasonable pricing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Price doesn't match listing"}
                  icon={"currency-usd"}
                  onPress={() =>
                    handleReporReason("Price doesn't match listing")
                  }
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Prohibited item"}
                  icon={"cancel"}
                  onPress={() => handleReporReason("Prohibited item")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Harassment or rude behavior"}
                  icon={"account-alert-outline"}
                  onPress={() =>
                    handleReporReason("Harassment or rude behavior")
                  }
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Suspicious activity"}
                  icon={"eye-off-outline"}
                  onPress={() => handleReporReason("Suspicious activity")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Other"}
                  icon={"dots-horizontal"}
                  onPress={() => handleReporReason("Other")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Cancel"}
                  icon={"close"}
                  color={"red"}
                  onPress={() => handleReportMenu("")}
                />
              </ScrollView>
            </>
          )}
        </BackContainer>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      backgroundColor: theme.post,
      position: "absolute",
      zIndex: 98,
      borderTopRightRadius: 22,
      borderTopLeftRadius: 22,
      paddingBottom: 20,
      bottom: 0,
      paddingTop: 5,
    },
    sep: {
      width: "100%",
      marginTop: 5,
    },
    overlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: theme.background,
      zIndex: 90,
      opacity: 0.5,
    },
    scrollContainer: {
      maxHeight: screenHeight * 0.7, // Limit ScrollView height
    },
    scrollContent: {
      paddingBottom: 10, // Add some padding at the bottom
    },
  });

export default PostMenu;
