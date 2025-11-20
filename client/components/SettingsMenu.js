import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import Constants from "expo-constants";

import BackContainer from "../components/BackContainer";
import MenuBackBtn from "./MenuBackBtn";
import MenuOption from "./MenuOption";
import SeparatorComp from "./SeparatorComp";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../config/UserContext";
import { Modal } from "react-native";
import { useAlert } from "../config/AlertContext";
import { openURL } from "../functions/openURL";

function SettingsMenu({ isVisible, onClose }) {
  const styles = useThemedStyles(getStyles);
  const { toggleTheme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { logout, isAdmin } = useUser();
  const { showAlert } = useAlert();

  if (!isVisible) return null;
  return (
    <Modal transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <BackContainer>
          <MenuBackBtn onClose={onClose} />
          <MenuOption
            text={isDarkMode ? "Light mode" : "Dark mode"}
            icon={"circle-half-full"}
            onPress={toggleTheme}
          />
          {/* <SeparatorComp style={styles.sep} />
          <MenuOption text={"Change language"} icon={"earth"} /> */}
          {!isAdmin && <SeparatorComp style={styles.sep} />}
          {!isAdmin && (
            <MenuOption
              text={"Privacy policy"}
              icon={"shield-check-outline"}
              onPress={() =>
                openURL("https://ajroo.netlify.app/privacy-policy", showAlert)
              }
            />
          )}
          {!isAdmin && <SeparatorComp style={styles.sep} />}
          {!isAdmin && (
            <MenuOption
              text={"Terms of service"}
              icon={"newspaper-variant-outline"}
              onPress={() =>
                openURL("https://ajroo.netlify.app/terms-of-service", showAlert)
              }
            />
          )}
          {!isAdmin && <SeparatorComp style={styles.sep} />}
          {!isAdmin && (
            <MenuOption
              text={"Subscription"}
              icon={"card-account-details-star-outline"}
              color={"purple"}
              onPress={() => navigation.navigate("Subscription")}
            />
          )}
          {isAdmin && <SeparatorComp style={styles.sep} />}
          {isAdmin && (
            <MenuOption
              text={"Suggestions"}
              icon={"chat-outline"}
              color={"green"}
              onPress={() => navigation.navigate("AdminSuggestions")}
            />
          )}
          {!isAdmin && <SeparatorComp style={styles.sep} />}
          {!isAdmin && (
            <MenuOption
              text={"Support"}
              icon={"headphones"}
              color={"green"}
              onPress={() => navigation.navigate("Suggestions")}
            />
          )}
          <SeparatorComp style={styles.sep} />
          <MenuOption
            text={"Log out"}
            icon={"logout"}
            color={"red"}
            onPress={logout}
          />
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
      zIndex: 120,
      // paddingTop: Constants.statusBarHeight,
      borderBottomRightRadius: 22,
      borderBottomLeftRadius: 22,
      paddingBottom: 20,
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
  });

export default SettingsMenu;
