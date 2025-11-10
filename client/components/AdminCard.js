import React from 'react';
import { View, StyleSheet } from 'react-native';
import PostComponent from './post_releated/PostComponent';
import AppText from '../config/AppText';
import useThemedStyles from '../hooks/useThemedStyles';
import { useTheme } from '../config/ThemeContext';

function AdminCard({title, value, color, backColor='purple', borderColor}) {
    const {theme} = useTheme()
    const styles = useThemedStyles(getStyles)
  return (
    <PostComponent style={[styles.card, {backgroundColor: theme[backColor], borderColor: theme[borderColor], width: "95%"}]}>
        <View style={styles.container}>
            <AppText style={[styles.text, {color:theme[color]}]}>{title} :</AppText>
            <AppText style={[styles.text, {color:theme[color], flex:1}]}>{value != null ? value : 'No data yet'}</AppText>
        </View>
    </PostComponent>
  );
}

const getStyles= (theme) => StyleSheet.create({
  container:{
    flexDirection:'row',
    gap:10
  },
  card:{
    borderWidth:2,
    marginVertical:10
  },
  text:{
    fontWeight:'bold',
    fontSize:18,
  }
})

export default AdminCard;