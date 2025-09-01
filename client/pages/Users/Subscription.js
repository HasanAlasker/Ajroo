import React from "react";
import { View, StyleSheet } from "react-native";
import ScrollScreen from "../../components/ScrollScreen";
import SafeScreen from "../../components/SafeScreen";
import Navbar from "../../components/Navbar";
import IndivisualPromo from "../../components/IndivisualPromo";
import OfferCard from "../../components/OfferCard";
import PostComponent from "../../components/PostComponent";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import AppText from "../../config/AppText";
import Logo from "../../components/Logo";

function Subscription(props) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  return (
    <SafeScreen>
      <ScrollScreen>
        <Logo slogan style={styles.logo}/>
        <PostComponent style={styles.container}>
          <View style={styles.iconAndTitle}>
            <MaterialIcons
              name={"paid"}
              size={28}
              color={theme.purple}
            ></MaterialIcons>
            <AppText style={[styles.text, styles.title]}>
              Start Earning with Ajroo
            </AppText>
          </View>
          <AppText style={[styles.text, styles.faded]}>
            Whether you're an individual or a business, Ajroo helps you turn
            idle items into income.
          </AppText>
          <AppText style={[styles.text]}>Why Join Ajroo?</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            - Turn unused items into cash.{"\n"}- Earn 1 JD/day up to 300
            JD/day.{"\n"}- Control your pricing and availability.{"\n"}
          </AppText>
          <AppText style={[styles.text]}>How It Works?</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            1- Subscirbe - Choose a plan that fits you.{"\n"}
            2- List items - Add photos, details and prices.{"\n"}
            3- Start earning - Accept rental requests and make money.{"\n"}
          </AppText>
          <View style={styles.iconAndTitle}>
            <FontAwesome6
              name="circle-exclamation"
              color={theme.darker_gray}
            ></FontAwesome6>
            <AppText style={[styles.note, styles.small]}>
              Note: Businesses must choose a business plan. Misuse may lead to account suspension.
            </AppText>
          </View>
        </PostComponent>
        <OfferCard
          backColor={"post"}
          color={"purple"}
          title={"Individual - Free"}
          icon={"lock-reset"}
          size={32}
        >
          List and borrow items for free, no rentals
        </OfferCard>
        <OfferCard
          backColor={"purple"}
          color={"always_white"}
          title={"Individual - Pro"}
          icon={"currency-exchange"}
          btnText={"Subscribe now"}
          startNow={6}
        >
          List up to 10 items for rental every month and make money.{"\n\n"}
          The profit is all yours - We don’t take commesion.
        </OfferCard>
        <OfferCard
          backColor={"green"}
          color={"always_white"}
          title={"Business - Starter"}
          icon={"museum"}
          btnText={"Subscribe now"}
          startNow={25}
        >
          List up to 50 items for rental every month and make more money.
          {"\n\n"}
          Get a store badge - Displayed next to your user name.{"\n\n"}
          Featured placement - Your listings show more often.
        </OfferCard>
        <OfferCard
          backColor={"gold"}
          color={"always_white"}
          title={"Business - Premium"}
          icon={"warehouse"}
          btnText={"Subscribe now"}
          startNow={50}
        >
          List unlimited items and max out your profit every month.{"\n\n"}
          Get a store badge - Displayed next to your user name.{"\n\n"}
          Priority search ranking - Your listings show on top to increase your
          earning.{"\n\n"}
          Get analytics to keep up with your business and maximize your wining.
        </OfferCard>
      </ScrollScreen>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 15,
    },
    iconAndTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    text: {
      color: theme.purple,
      fontSize: 18,
      fontWeight: "bold",
      textAlignVertical:'center'
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
    },
    faded: {
      color: theme.main_text,
      fontWeight: "regular",
    },
    height: {
      lineHeight: 25,
    },
    small: {
      fontSize: 15,
      color:theme.darker_gray,
      fontWeight:'bold'
    },
    logo:{
      marginVertical:20
    }
  });

export default Subscription;
