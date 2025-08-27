import React from "react";
import { View, StyleSheet } from "react-native";
import ScrollScreen from "../../components/ScrollScreen";
import SafeScreen from "../../components/SafeScreen";
import Navbar from "../../components/Navbar";
import IndivisualPromo from "../../components/IndivisualPromo";
import OfferCard from "../../components/OfferCard";
import PostComponent from "../../components/PostComponent";

function Subscription(props) {
  return (
    <SafeScreen>
      <ScrollScreen>
        <PostComponent></PostComponent>
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

const styles = StyleSheet.create({
  container: {},
});

export default Subscription;
