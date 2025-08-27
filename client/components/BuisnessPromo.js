import React from "react";
import { View, StyleSheet } from "react-native";
import OfferCard from "./OfferCard";

function BuisnessPromo(props) {
  return (
    <OfferCard
      icon={"museum"}
      title={"Own a Hardware or Gear Store?"}
      btnText={"Learn more"}
      startsAt={25}
      color={"gold"}
    >
      Earn 1 JD to 300 JD per day by renting out what you already own.
    </OfferCard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default BuisnessPromo;
