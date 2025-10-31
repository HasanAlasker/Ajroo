import React from "react";
import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import SearchBar from "../../components/general/SearchBar";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";


function Reports(props) {
  const {} = useApi()

  return (
    <SafeScreen>
      <PostRenderer
      
      >
        <SearchBar />
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Reports;
