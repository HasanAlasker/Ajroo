import React from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import AppText from "../../config/AppText";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";

function NewsLog(props) {
  return (
    <SafeScreen>
      {/* <AppText>Ajroo News Log</AppText> */}
      <ScrollScreen></ScrollScreen>
      <Navbar/>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default NewsLog;
