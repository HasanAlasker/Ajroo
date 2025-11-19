import React from "react";
import { View, StyleSheet } from "react-native";
import OfferCard from "./OfferCard";
import { useNavigation } from "@react-navigation/native";

function BuisnessPromo(props) {
  const navigation = useNavigation();
  return (
    <OfferCard
      icon={"museum"}
      title={"Own a Hardware or Gear Store?"}
      btnText={"Learn more"}
      startsAt={25}
      backColor={"green"}
      color={"always_white"}
      onPress={() => navigation.navigate("Subscription")}
    >
      Explore our Business plans for more features.
    </OfferCard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default BuisnessPromo;
