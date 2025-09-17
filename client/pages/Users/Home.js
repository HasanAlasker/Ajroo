import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppText from '../../config/AppText'
import SearchBar from '../../components/general/SearchBar';

import useThemedStyles from "../../hooks/useThemedStyles";
import WelcomeCard from '../../components/WelcomeCard';
import SquareCard from '../../components/SquareCard';
import Navbar from '../../components/general/Navbar';
import SafeScreen from '../../components/general/SafeScreen';
import { useUser } from '../../config/UserContext';
import AlertModal from '../../components/general/AlertModal'

function Home(props) {
  const styles = useThemedStyles(getStyles);
  const {getUserDisplayName} = useUser()

  return (
    <SafeScreen>
      <SearchBar></SearchBar>
      <ScrollView >
        <WelcomeCard name={getUserDisplayName()}></WelcomeCard>
        <AppText style={styles.text}>
          What kind of item are you looking for?
        </AppText>
        <View style={styles.grid}>
          <SquareCard icon={'home'} name={'Household'} cardnum={1}></SquareCard>
          <SquareCard icon={'flower'} name={'Garden'} cardnum={3}></SquareCard>
          <SquareCard icon={'pliers'} name={'Tools'} cardnum={6}></SquareCard>
          <SquareCard icon={'bicycle'} name={'Sports'} cardnum={4}></SquareCard>
          <SquareCard icon={'tshirt-crew'} name={'Clothes'} cardnum={5}></SquareCard>
          <SquareCard icon={'fridge'} name={'Electronics'} cardnum={2}></SquareCard>
          <SquareCard icon={'calendar'} name={'Events'} cardnum={7}></SquareCard>
          <SquareCard icon={'book'} name={'Books'} cardnum={8}></SquareCard>
        </View>
      </ScrollView>
      <AlertModal></AlertModal>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  background:{
    flex:1,
    backgroundColor:theme.background
  },
  grid:{
    marginTop:25,
    marginBottom:55,
    width:'90%',
    flexDirection:'row',
    flexWrap:'wrap',
    marginHorizontal:'auto',
    justifyContent:'space-between',
    rowGap:20
  }
  ,text:{
    fontSize:30,
    fontWeight:'bold',
    width:'90%',
    marginHorizontal:'auto',
    marginTop:40,
    color:theme.main_text
  }
})

export default Home;