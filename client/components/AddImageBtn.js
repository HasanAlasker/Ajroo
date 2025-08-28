import { Image, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../config/AppText";
import { selectImageFromLibrary, selectImageFromCamera } from "../functions/addImage";
import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

function AddImageBtn({
  image,
  onImageChange,
  error,
  errorMessage,
  allowCamera = true,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelection = () => {
    if (allowCamera) {
      // Show options for camera or library
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
        aspect: [4, 3.8], // Better aspect ratio for general images
      });

      console.log("Selected image URI:", imageUri); // Debug log
      if (imageUri && onImageChange) {
        onImageChange(imageUri);
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
        aspect: [4, 3.8], // Better aspect ratio for general images
      });

      console.log("Camera image URI:", imageUri); // Debug log
      if (imageUri && onImageChange) {
        onImageChange(imageUri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = () => {
    if (image) {
      // If image exists, show options to change or remove
      Alert.alert("Image Options", "What would you like to do?", [
        {
          text: "Change Image",
          onPress: handleImageSelection,
        },
        {
          text: "Remove Image",
          onPress: () => onImageChange && onImageChange(null),
          style: "destructive",
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

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={handleImagePress}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {image ? (
            // Show image with overlay
            <View style={styles.imageContainer}>
              <Image 
                style={styles.image} 
                source={{ uri: image }}
                onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                onLoad={() => console.log("Image loaded successfully")}
              />
              <View style={styles.overlay}>
                <MaterialCommunityIcons
                  name="pencil"
                  color={theme.always_white}
                  size={24}
                />
              </View>
            </View>
          ) : (
            // Show placeholder
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons
                name={isLoading ? "loading" : "image-plus"}
                color={theme.purple}
                size={80}
              />
              <AppText style={styles.text}>
                {isLoading ? "Loading..." : "Add Image"}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {error && errorMessage && (
        <ErrorMessage error={errorMessage} />
      )}
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      height: 270,
      marginHorizontal: "auto",
      marginBottom: 10,
      marginTop: 25,
      alignSelf: 'center', // Better centering
    },
    touchableArea: {
      flex: 1,
      backgroundColor: theme.post,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.purple,
      overflow: "hidden",
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'transparent',
    },
    text: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.purple,
      marginTop: 10,
      textAlign: 'center',
    },
    imageContainer: {
      flex: 1,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: "cover",
    },
    overlay: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 20,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default AddImageBtn;