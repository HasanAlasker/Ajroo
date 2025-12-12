import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import PostComponent from "./PostComponent";
import TopOfPost from "./TopOfPost";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { openURL } from "../../functions/openURL";
import { useAlert } from "../../config/AlertContext";
import { formatDate } from "../../functions/formatDate";
import { useUser } from "../../config/UserContext";
import { activateAd, deactivateAd, deleteAd, approveAd } from "../../api/ads";
import { useNavigation } from "@react-navigation/native";

function AdPost({
  adId,
  userId,
  userPic,
  userName,
  userSub,
  image,
  link,
  isApproved,
  isActive,
  expiresAt,
  createdAt,
  updatedAt,
  displayDuration,
  onAdUpdate, // Callback to refresh ad list
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role === "admin";

  const SubType = () => {
    if (userSub === "business_starter:starter") return "Starter";
    if (userSub === "business_premium:premium") return "Premium";
    return null;
  };

  const handleApprove = async () => {
    showAlert({
      title: "Approve Ad",
      message: "Are you sure you want to approve this ad?",
      confirmText: "Approve",
      cancelText: "Cancel",
      onConfirm: async () => {
        setLoading(true);
        try {
          await approveAd(adId);
          showAlert({
            title: "Success",
            message: "Ad approved successfully!",
            confirmText: "OK",
          });
          onAdUpdate?.();
        } catch (error) {
          showAlert({
            title: "Error",
            message: error.response?.data || "Failed to approve ad",
            confirmText: "OK",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleToggleActive = async () => {
    const action = isActive ? "deactivate" : "activate";
    showAlert({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Ad`,
      message: `Are you sure you want to ${action} this ad?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: "Cancel",
      onConfirm: async () => {
        setLoading(true);
        try {
          if (isActive) {
            await deactivateAd(adId);
          } else {
            await activateAd(adId);
          }
          showAlert({
            title: "Success",
            message: `Ad ${action}d successfully!`,
            confirmText: "OK",
          });
          onAdUpdate?.();
        } catch (error) {
          showAlert({
            title: "Error",
            message: error.response?.data || `Failed to ${action} ad`,
            confirmText: "OK",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDelete = async () => {
    showAlert({
      title: "Delete Ad",
      message: "Are you sure you want to delete this ad? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteAd(adId);
          showAlert({
            title: "Success",
            message: "Ad deleted successfully!",
            confirmText: "OK",
          });
          onAdUpdate?.();
        } catch (error) {
          showAlert({
            title: "Error",
            message: error.response?.data || "Failed to delete ad",
            confirmText: "OK",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = () => {
    navigation.navigate("EditAd", { adId, adData: {
      image,
      link,
      displayDuration,
      isApproved,
      isActive,
    }});
  };

  return (
    <PostComponent style={styles.container}>
      <View style={styles.topPad}>
        <TopOfPost
          date={"Sponsored"}
          image={userPic}
          isMine={false}
          name={userName}
          subscriptionType={SubType()}
          userId={userId}
          hideThree
        />
        
        {isAdmin && (
          <View style={styles.adminSection}>            
            {/* Status Info */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <AppText style={styles.label}>Status:</AppText>
                <View style={[styles.badge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <AppText style={[styles.badgeText, isActive ? styles.activeText : styles.inactiveText]}>
                    {isActive ? "Active" : "Inactive"}
                  </AppText>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <AppText style={styles.label}>Approval:</AppText>
                <View style={[styles.badge, isApproved ? styles.approvedBadge : styles.pendingBadge]}>
                  <AppText style={[styles.badgeText, isApproved ? styles.approvedText : styles.pendingText]}>
                    {isApproved ? "Approved" : "Pending"}
                  </AppText>
                </View>
              </View>

              <View style={styles.statusRow}>
                <AppText style={styles.label}>Duration:</AppText>
                <AppText style={styles.value}>
                  {displayDuration} day{displayDuration > 1 ? "s" : ""}
                </AppText>
              </View>

              <View style={styles.statusRow}>
                <AppText style={styles.label}>Created:</AppText>
                <AppText style={styles.value}>{formatDate(createdAt)}</AppText>
              </View>

              {expiresAt && (
                <View style={styles.statusRow}>
                  <AppText style={styles.label}>Expires:</AppText>
                  <AppText style={styles.value}>{formatDate(expiresAt)}</AppText>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!isApproved && (
                <Pressable 
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={handleApprove}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="check-circle" size={18} color={theme.always_white} />
                  <AppText style={styles.actionBtnText}>Approve</AppText>
                </Pressable>
              )}

              <Pressable 
                style={[styles.actionBtn, isActive ? styles.deactivateBtn : styles.activateBtn]}
                onPress={handleToggleActive}
                disabled={loading}
              >
                <MaterialCommunityIcons 
                  name={isActive ? "pause-circle" : "play-circle"} 
                  size={18} 
                  color={theme.always_white} 
                />
                <AppText style={styles.actionBtnText}>
                  {isActive ? "Deactivate" : "Activate"}
                </AppText>
              </Pressable>

              <Pressable 
                style={[styles.actionBtn, styles.editBtn]}
                onPress={handleEdit}
                disabled={loading}
              >
                <MaterialCommunityIcons name="pencil" size={18} color={theme.always_white} />
                <AppText style={styles.actionBtnText}>Edit</AppText>
              </Pressable>

              <Pressable 
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
                disabled={loading}
              >
                <MaterialCommunityIcons name="delete" size={18} color={theme.always_white} />
                <AppText style={styles.actionBtnText}>Delete</AppText>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Image source={{ uri: image }} style={styles.img} />
      
      <Pressable style={styles.btn} onPress={() => openURL(link, showAlert)}>
        <AppText style={styles.text}>Learn More</AppText>
        <MaterialCommunityIcons
          name="chevron-right-circle-outline"
          size={20}
          color={theme.always_white}
          style={{ paddingTop: 3 }}
        />
      </Pressable>
    </PostComponent>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 20,
      paddingHorizontal: 0,
      paddingVertical: 0,
      rowGap: 0,
    },
    topPad: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    btn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.purple,
      flex: 1,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    img: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: theme.post,
    },
    text: {
      color: theme.always_white,
      fontSize: 20,
    },
    
    // Admin Section Styles
    adminSection: {
      marginTop: 15,
      gap: 15,
    },
    statusContainer: {
      gap: 10,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontSize: 14,
      color: theme.darker_gray,
      fontWeight: "bold",
    },
    value: {
      fontSize: 14,
      fontWeight: "bold",
      right:3,
      color: theme.main_text,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    activeBadge: {
      backgroundColor: theme.green + "20",
    },
    activeText: {
      color: theme.green,
    },
    inactiveBadge: {
      backgroundColor: theme.darker_gray + "20",
    },
    inactiveText: {
      color: theme.darker_gray,
    },
    approvedBadge: {
      backgroundColor: theme.green + "20",
    },
    approvedText: {
      color: theme.green,
    },
    pendingBadge: {
      backgroundColor: theme.orange + "20",
    },
    pendingText: {
      color: theme.orange,
    },
    
    // Action Buttons
    actionButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 5,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      minWidth: "45%",
      justifyContent: "center",
    },
    actionBtnText: {
      color: theme.always_white,
      fontSize: 14,
      fontWeight: "600",
    },
    approveBtn: {
      backgroundColor: theme.green,
    },
    activateBtn: {
      backgroundColor: theme.blue,
    },
    deactivateBtn: {
      backgroundColor: theme.darker_gray,
    },
    editBtn: {
      backgroundColor: theme.purple,
    },
    deleteBtn: {
      backgroundColor: theme.red,
    },
  });

export default AdPost;