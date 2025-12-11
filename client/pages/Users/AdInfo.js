import React from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import PostComponent from "../../components/post_releated/PostComponent";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../config/ThemeContext";
import RequestBtn from "../../components/RequestBtn";
import { useNavigation } from "@react-navigation/native";

function AdInfo(props) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  const navigation = useNavigation()

  return (
    <SafeScreen style={styles.container}>
      <ScrollScreen>
        <AppText style={styles.textBig}>
          Promote Your Business on Ajroo!
        </AppText>

        <PostComponent style={styles.container}>
          <View style={styles.iconAndTitle}>
            <MaterialIcons name={"paid"} size={28} color={theme.purple} />
            <AppText style={[styles.text, styles.title]}>
              Business Advertising
            </AppText>
          </View>
          <AppText style={[styles.text, styles.faded]}>
            Reach local customers and grow your business with Ajroo's
            advertising platform.
          </AppText>

          <AppText style={[styles.text]}>Why Advertise on Ajroo?</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            • Reach your local community{"\n"}• Flexible pricing agreements
          </AppText>

          <AppText style={[styles.text]}>How It Works</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            1. Submit your ad - Upload image, link, and preferred duration
            {"\n"}
            2. Review & approval - Our team reviews within 24-48 hours
            {"\n"}
            3. Pricing agreement - We'll contact you to finalize terms
            {"\n"}
            4. Go live - Your ad starts reaching customers
          </AppText>

          <AppText style={[styles.text]}>Starting From</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            Flexible packages starting from 5 JD/day. Contact us for custom
            pricing based on your needs and budget.
          </AppText>

          <AppText style={[styles.text]}>Content Policy</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            All advertisements must comply with our guidelines. Prohibited
            content includes:{"\n"}• Tobacco, alcohol, or gambling promotions
            {"\n"}• Inappropriate or explicit imagery{"\n"}• Misleading or false
            claims{"\n"}• Discriminatory content
          </AppText>
          <RequestBtn
            title={"Advertise Now"}
            arrow={true}
            color={"always_white"}
            backColor={"purple"}
            style={styles.btn}
            onPress={()=>navigation.navigate('AddAd')}
          />
        </PostComponent>
      </ScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
    textBig: {
      fontSize: 30,
      fontWeight: "normal",
      width: "90%",
      marginHorizontal: "auto",
      marginVertical: 40,
      color: theme.main_text,
      textAlign: "center",
    },
    iconAndTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    smallIconAndTitle: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    container: {
      marginVertical: 15,
    },
    text: {
      color: theme.purple,
      fontSize: 18,
      fontWeight: "bold",
      textAlignVertical: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.purple,
    },
    faded: {
      color: theme.main_text,
      fontWeight: "normal",
    },
    height: {
      lineHeight: 25,
    },
    small: {
      fontSize: 15,
      color: theme.darker_gray,
      fontWeight: "bold",
    },
    note: {
      flex: 1,
    },
    logo: {
      marginVertical: 20,
    },
    btn: {
      padding: 2,
      borderRadius: 10,
      width: "100%",
      marginTop: 5,
    },
  });

export default AdInfo;
