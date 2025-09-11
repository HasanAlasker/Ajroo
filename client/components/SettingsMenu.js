import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import Constants from "expo-constants";

import BackContainer from "../components/BackContainer";
import MenuBackBtn from "./MenuBackBtn";
import MenuOption from "./MenuOption";
import SeparatorComp from "./SeparatorComp";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../config/UserContext";

function SettingsMenu({ isVisible, onClose }) {
  const styles = useThemedStyles(getStyles);
  const {toggleTheme, isDarkMode} = useTheme()
  const navigation = useNavigation()
  const {logout} = useUser()
  
  if (!isVisible) return null;
  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <BackContainer>
          <MenuBackBtn onClose={onClose} />
          <MenuOption text={isDarkMode ? 'Light mode': 'Dark mode'} icon={"circle-half-full"} onPress={toggleTheme}/>
          <SeparatorComp style={styles.sep} />
          <MenuOption text={"Change language"} icon={"earth"} />
          <SeparatorComp style={styles.sep} />
          <MenuOption text={"Privacy policy"} icon={"shield-check-outline"} />
          <SeparatorComp style={styles.sep} />
          <MenuOption
            text={"Terms of service"}
            icon={"newspaper-variant-outline"}
          />
          <SeparatorComp style={styles.sep} />
          <MenuOption
            text={"Subscription"}
            icon={"card-account-details-star-outline"}
            color={'purple'}
            onPress={()=> navigation.navigate('Subscription')}
          />
          <SeparatorComp style={styles.sep} />
          <MenuOption text={"Support"} icon={"headphones"} color={"green"} />
          <SeparatorComp style={styles.sep} />
          <MenuOption text={"Log out"} icon={"logout"} color={"red"} onPress={logout}/>
        </BackContainer>
      </View>
    </>
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
