import React from "react";
import { View, StyleSheet } from "react-native";
import WelcomeCard from "../../components/WelcomeCard";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import PostComponent from "../../components/post_releated/PostComponent";
import AdminCard from "../../components/AdminCard";

function Dash(props) {
  return (
    <SafeScreen>
      <ScrollScreen>
        <View style={styles.container}>
          <AdminCard
            title={"Total Users"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Total Admins"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Total Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Active Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Disabled Posts"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Taken Items"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Active Reports"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Users Profit"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"App Profit"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Blocked Users"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Total Subscribers"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Individual - Free"}
            backColor={"post"}
            borderColor={"purple"}
            color={"purple"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Individual - Pro"}
            backColor={"purple"}
            borderColor={"purple"}
            color={"always_white"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Business - Starter"}
            backColor={"green"}
            borderColor={"green"}
            color={"always_white"}
            value={null}
          ></AdminCard>
          <AdminCard
            title={"Business - Premium"}
            backColor={"gold"}
            borderColor={"gold"}
            color={"always_white"}
            value={null}
          ></AdminCard>
        </View>
      </ScrollScreen>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {

  },
});

export default Dash;
