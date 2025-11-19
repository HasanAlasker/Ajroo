import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import AppText from "../config/AppText";
import useThemedStyles from "../hooks/useThemedStyles";
import EditBtn from "./EditBtn";
import {
  selectImageFromLibrary,
  selectImageFromCamera,
} from "../functions/addImage";
import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../config/ThemeContext";
import { useUser } from "../config/UserContext";

function BigPicAndUsername({
  userName,
  initialImage = null,
  isEdit,
  isPicDisabled = true,
  onImageChange,
  allowCamera = true,
  subscriptionType,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const { user, updateProfile } = useUser();

  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);

  const handleImageSelection = () => {
    if (allowCamera) {
      Alert.alert("Select Image", "Choose an option", [
        {
          text: "Camera",
          onPress: handleCameraPress,
        },
        {
          text: "Photo Library",
          onPress: handleLibraryPress,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } else {
      handleLibraryPress();
    }
  };

  const handleLibraryPress = async () => {
    setIsLoading(true);
    try {
      const imageUri = await selectImageFromLibrary({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (imageUri) {
        setSelectedImage(imageUri);
        await updateProfile({ avatar: imageUri });
        if (onImageChange) {
          onImageChange(imageUri);
        }
      }
    } catch (error) {
      console.error("Error selecting image from library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraPress = async () => {
    setIsLoading(true);
    try {
      const imageUri = await selectImageFromCamera({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (imageUri) {
        setSelectedImage(imageUri);
        await updateProfile({ avatar: imageUri });
        if (onImageChange) {
          onImageChange(imageUri);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = () => {
    if (selectedImage) {
      Alert.alert("Image Options", "What would you like to do?", [
        {
          text: "Change Image",
          onPress: handleImageSelection,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } else {
      handleImageSelection();
    }
  };

  const imageToShow = selectedImage || user?.avatar;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={isPicDisabled || isLoading}
        onPress={handleImagePress}
        activeOpacity={0.7}
        style={styles.imagePlaceholder}
      >
        <Image
          style={styles.image}
          source={selectedImage ? { uri: selectedImage } : user.avatar}
        />
        {isEdit && <EditBtn />}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <MaterialCommunityIcons
              name="loading"
              color={theme.purple}
              size={80}
            />
          </View>
        )}
        {initialImage === null && (
          <View style={styles.default}>
            <MaterialCommunityIcons
              name="account"
              color={theme.light_gray}
              size={80}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Using Text component to properly inline the badge */}
      <Text style={styles.nameContainer}>
        <Text style={styles.text}>{userName}</Text>
        {(subscriptionType === "business_starter" ||
          subscriptionType === "business_premium") && (
          <Text style={styles.badgeText}>
            <MaterialCommunityIcons
              name={
                subscriptionType === "business_starter"
                  ? "check-circle"
                  : "crown"
              }
              size={subscriptionType === "business_starter" ? 24 : 26}
              color={
                subscriptionType === "business_starter"
                  ? theme.blue
                  : theme.purple
              }
            />
          </Text>
        )}
      </Text>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 40,
    },
    imagePlaceholder: {
      width: 150,
      height: 150,
      backgroundColor: theme.sec_text,
      borderRadius: 75,
      position: "relative",
    },
    image: {
      width: 150,
      height: 150,
      borderRadius: 75,
      resizeMode: "cover",
    },
    nameContainer: {
      textAlign: "center",
      maxWidth: "90%",
    },
    text: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.main_text,
    },
    badgeText: {
      // lineHeight: 32, // Match with text line height
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 75,
      justifyContent: "center",
      alignItems: "center",
    },
    default: {
      position: "absolute",
      inset: 0,
      borderRadius: 75,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: "white",
      fontSize: 12,
    },
  });

export default BigPicAndUsername;
