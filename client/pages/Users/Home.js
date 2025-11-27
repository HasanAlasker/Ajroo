import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Button } from "react-native";
import AppText from "../../config/AppText";
import SearchBar from "../../components/general/SearchBar";
import ScrollScreen from "../../components/general/ScrollScreen";

import useThemedStyles from "../../hooks/useThemedStyles";
import WelcomeCard from "../../components/WelcomeCard";
import SquareCard from "../../components/SquareCard";
import Navbar from "../../components/general/Navbar";
import SafeScreen from "../../components/general/SafeScreen";
import { useUser } from "../../config/UserContext";
import AlertModal from "../../components/general/AlertModal";
import * as Notifications from "expo-notifications";

function Home({ navigation }) {
  const styles = useThemedStyles(getStyles);
  const { getUserDisplayName } = useUser();

  const handleCardPress = (categoryName) => {
    // Navigate to Have page with category filter
    navigation.navigate("Have", {
      category: categoryName,
      applyFilter: true,
    });
  };

  return (
    <SafeScreen>
      {/* <SearchBar></SearchBar> */}
      <ScrollScreen>
        <WelcomeCard />
        <AppText style={styles.text}>
          What kind of item are you looking for?
        </AppText>
        {/* <View style={{ padding: 20 }}>
          <Button
            title="🧪 Test Expo Push API"
            onPress={async () => {
              const myToken = "ExponentPushToken[u6jq-oNAA09YmIyotq4le5]"; // Replace with your actual token

              console.log("📤 Sending test push...");

              const response = await fetch(
                "https://exp.host/--/api/v2/push/send",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    to: myToken,
                    title: "API Test",
                    body: "Direct from Expo API",
                    sound: "default",
                  }),
                }
              );

              const result = await response.json();
              console.log("📥 API Response:", JSON.stringify(result, null, 2));

              if (result.data?.[0]?.status === "error") {
                console.error("❌❌❌ ERROR:", result.data[0].message);
                console.error("Details:", result.data[0].details);
              } else {
                console.log("✅ Push sent successfully!");
              }
            }}
          /> 
        </View>*/}
        <View style={styles.grid}>
          <SquareCard
            icon={"home"}
            name={"Household"}
            cardnum={1}
            onPress={() => handleCardPress("Household")}
          ></SquareCard>
          <SquareCard
            icon={"flower"}
            name={"Garden"}
            cardnum={3}
            onPress={() => handleCardPress("Garden")}
          ></SquareCard>
          <SquareCard
            icon={"pliers"}
            name={"Tools"}
            cardnum={6}
            onPress={() => handleCardPress("Tools")}
          ></SquareCard>
          <SquareCard
            icon={"bicycle"}
            name={"Sports"}
            cardnum={4}
            onPress={() => handleCardPress("Sports")}
          ></SquareCard>
          <SquareCard
            icon={"tshirt-crew"}
            name={"Clothes"}
            cardnum={5}
            onPress={() => handleCardPress("Clothes")}
          ></SquareCard>
          <SquareCard
            icon={"fridge"}
            name={"Electronics"}
            cardnum={2}
            onPress={() => handleCardPress("Electronics")}
          ></SquareCard>
          <SquareCard
            icon={"calendar"}
            name={"Events"}
            cardnum={7}
            onPress={() => handleCardPress("Events")}
          ></SquareCard>
          <SquareCard
            icon={"book"}
            name={"Books"}
            cardnum={8}
            onPress={() => handleCardPress("Books")}
          ></SquareCard>
        </View>
      </ScrollScreen>
      <AlertModal></AlertModal>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: theme.background,
    },
    grid: {
      marginTop: 25,
      marginBottom: 55,
      width: "90%",
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: "auto",
      justifyContent: "space-between",
      rowGap: 20,
    },
    text: {
      fontSize: 30,
      fontWeight: "bold",
      width: "90%",
      marginHorizontal: "auto",
      marginTop: 40,
      color: theme.main_text,
    },
  });

export default Home;
