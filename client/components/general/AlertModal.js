import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../config/AppText";
import CardModal from "../CardModal";
import RequestBtn from "../RequestBtn";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { useAlert } from "../../config/AlertContext";

function AlertModal() {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { alertConfig, handleConfirm, handleCancel } = useAlert();

  return (
    <CardModal isVisibile={alertConfig.isVisible}>
      <AppText style={styles.text}>{alertConfig.title}</AppText>
      {alertConfig.message && (
        <AppText style={styles.message}>{alertConfig.message}</AppText>
      )}

      <View style={styles.buttons}>
        <RequestBtn
          title={alertConfig.isLoading ? "Loading..." : alertConfig.confirmText}
          isGreen={true}
          onPress={handleConfirm}
          disabled={alertConfig.isLoading}
          style={alertConfig.type === "info" ? styles.fullWidthButton : null}
        />
        {alertConfig.type === "confirm" && (
          <RequestBtn
            title={alertConfig.cancelText}
            isRed={true}
            onPress={handleCancel}
            disabled={alertConfig.isLoading}
          />
        )}
      </View>
    </CardModal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    text: {
      fontSize: 22,
      color: theme.main_text,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
    message: {
      fontSize: 18,
      color: theme.darker_gray,
      textAlign: "center",
      marginBottom: 20,
    },
    buttons: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
      rowGap: 20,
      justifyContent: "space-between",
      marginTop: 20,
    },
    fullWidthButton: {
      width: "100%",
    },
  });

export default AlertModal;
