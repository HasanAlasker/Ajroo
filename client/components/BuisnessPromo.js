import React from "react";
import { View, StyleSheet } from "react-native";
import OfferCard from "./OfferCard";
import { useNavigation } from "@react-navigation/native";

function BuisnessPromo(props) {
  const navigation = useNavigation()
  return (
    <OfferCard
      icon={"museum"}
      title={"Own a Hardware or Gear Store?"}
      btnText={"Learn more"}
      startsAt={25}
      backColor={'gold'}
      color={"always_white"}
      onPress={()=> navigation.navigate('Subscription')}
    >
      Earn 1 JD to 300 JD per day by renting out what you already own.
    </OfferCard>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default BuisnessPromo;
