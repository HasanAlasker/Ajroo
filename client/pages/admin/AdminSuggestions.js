import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import AppText from "../../config/AppText";
import SafeScreen from "../../components/general/SafeScreen";
import SuggestionCard from "../../components/SuggestionCard";
import useApi from "../../hooks/useApi";
import { getSuggestions } from "../../api/suggestion";
import SuggestionRenderer from "../../components/SuggestionRenderer";
import LoadingCircle from "../../components/general/LoadingCircle";
import Navbar from "../../components/general/Navbar";

function AdminSuggestions(props) {
  const styles = useThemedStyles(getStyles);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: suggestion,
    request: fethSuggestion,
    loading,
    error,
  } = useApi(getSuggestions);

  useEffect(() => {
    fethSuggestion();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true)
    await fethSuggestion();
    setRefreshing(false)
  };

  console.log("Suggestion data:", suggestion); // Better logging

  if (loading && !suggestion) { // Only show loading on initial load
    return <LoadingCircle />;
  }
  
  return (
    <SafeScreen>
      <SuggestionRenderer
        fetchedPosts={suggestion || []} // Ensure it's always an array
        onRefresh={handleRefresh}
        refreshing={refreshing}
      >
        <AppText style={styles.text}>
          See user suggestions and questions
        </AppText>
      </SuggestionRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
    text: {
      fontSize: 30,
      width: "90%",
      marginVertical: 40,
      marginHorizontal: "auto",
      color: theme.main_text,
      textAlign: "center",
    },
  });

export default AdminSuggestions;