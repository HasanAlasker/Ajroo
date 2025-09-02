import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  Dimensions
} from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";

import BackContainer from "../components/BackContainer";
import MenuBackBtn from "./MenuBackBtn";
import MenuOption from "./MenuOption";
import SeparatorComp from "./SeparatorComp";
import { usePosts } from "../config/PostContext";


const { height: screenHeight } = Dimensions.get('window');

function PostMenu({ isVisible, onClose, isMine, postId, onEditPress }) {
  const styles = useThemedStyles(getStyles);
  const { toggleTheme } = useTheme();
  const [reportMenu, setReportMenu] = useState(false);
  const { deletePost } = usePosts();
  
  const handleReportMenu = () => {
    setReportMenu(!reportMenu);
  };

  const handleEditPost = () => {
    if (onEditPress) {
      onEditPress(); 
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(postId);
      onClose(); // Close the menu after deleting
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (!isVisible) return null;
  
  return (
    <Modal transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <BackContainer>
          <MenuBackBtn onClose={onClose} />
          {!reportMenu && (
            <>
              <MenuOption text={"Share post"} icon={"share-outline"} />
              <SeparatorComp style={styles.sep} />
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
              ) : (
                <MenuOption
                  text={"Report post"}
                  icon={"bullhorn-variant"}
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
                  // onPress={() => handleReport("Item doesn't exist/fake listing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Misleading item description"}
                  icon={"information-off-outline"}
                  // onPress={() => handleReport("Misleading item description")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Unsafe or damaged item"}
                  icon={"shield-alert-outline"}
                  // onPress={() => handleReport("Unsafe or damaged item")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Spam or duplicate listing"}
                  icon={"content-copy"}
                  // onPress={() => handleReport("Spam or duplicate listing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Unreasonable pricing"}
                  icon={"currency-usd-off"}
                  // onPress={() => handleReport("Unreasonable pricing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Price doesn't match listing"}
                  icon={"currency-usd"}
                  // onPress={() => handleReport("Price doesn't match listing")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Prohibited item"}
                  icon={"cancel"}
                  // onPress={() => handleReport("Prohibited item")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Harassment or rude behavior"}
                  icon={"account-alert-outline"}
                  // onPress={() => handleReport("Harassment or rude behavior")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Suspicious activity"}
                  icon={"eye-off-outline"}
                  // onPress={() => handleReport("Suspicious activity")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Other"}
                  icon={"dots-horizontal"}
                  // onPress={() => handleReport("Other")}
                />
                <SeparatorComp style={styles.sep} />
                <MenuOption
                  text={"Cancel"}
                  icon={"close"}
                  color={"red"}
                  onPress={handleReportMenu}
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
    }
  });

export default PostMenu;