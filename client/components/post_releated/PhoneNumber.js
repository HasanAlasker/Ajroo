import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import AppText from "../../config/AppText";
import { useAlert } from "../../config/AlertContext";

function PhoneNumber({ phoneNumber, email }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { showInfo } = useAlert();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(phoneNumber || email);
    showInfo({
      title: "Copied!",
      message: `${phoneNumber ? "Phone number" : "Email"} copied to clipboard.`,
      confirmText: "Close",
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handleCopy}
    >
      <Feather name={phoneNumber ? "phone-call" : 'mail'} size={20} color={theme.main_text} />
      <AppText style={styles.text}>{phoneNumber || email}</AppText>
      <Feather
        name="copy"
        size={16}
        color={theme.main_text}
        style={styles.copyIcon}
      />
    </Pressable>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    pressed: {
      opacity: 0.6,
    },
    text: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.main_text,
    },
    copyIcon: {
      opacity: 0.5,
    },
  });

export default PhoneNumber;
