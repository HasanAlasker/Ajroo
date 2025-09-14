import React from "react";
import { View, StyleSheet } from "react-native";
import WelcomeCard from "../../components/WelcomeCard";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import SearchBar from "../../components/general/SearchBar";

function Search(props) {
  return (
    <SafeScreen>
      <ScrollScreen>
        <SearchBar />
      </ScrollScreen>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Search;
