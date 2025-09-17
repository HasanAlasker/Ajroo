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
          title={alertConfig.confirmText}
          isGreen={true}
          onPress={handleConfirm}
        />
        <RequestBtn 
          title={alertConfig.cancelText} 
          isRed={true} 
          onPress={handleCancel}
        />
      </View>
    </CardModal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    text: {
      fontSize: 20,
      color: theme.main_text,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center'
    },
    message: {
      fontSize: 16,
      color: theme.main_text,
      textAlign: 'center',
      marginBottom: 20,
    },
    buttons: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
      rowGap: 20,
      justifyContent: "space-between",
      marginTop: 10,
    },
  });

export default AlertModal;