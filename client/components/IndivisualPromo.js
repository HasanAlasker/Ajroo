import React from "react";
import { View, StyleSheet } from "react-native";
import OfferCard from "./OfferCard";

function IndivisualPromo(props) {
  return (
    <OfferCard
      icon={"currency-exchange"}
      title={"Want Passive Income?"}
      btnText={"Learn more"}
      startNow={6}
      color={"purple"}
    >
      Earn 1 JD to 300 JD per day by renting out what you already own.
    </OfferCard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default IndivisualPromo;
