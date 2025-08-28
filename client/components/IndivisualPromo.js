import React from "react";
import { View, StyleSheet } from "react-native";
import OfferCard from "./OfferCard";
import { useNavigation } from "@react-navigation/native";

function IndivisualPromo(props) {
  const navigation = useNavigation()
  return (
    <OfferCard
      icon={"currency-exchange"}
      title={"Want Passive Income?"}
      btnText={"Learn more"}
      startNow={6}
      backColor={"purple"}
      color={'always_white'}
      onPress={()=> navigation.navigate('Subscription')}
    >
      Earn 1 JD to 300 JD per day by renting out what you already own.
    </OfferCard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default IndivisualPromo;
