import { View, StyleSheet } from 'react-native';

function RowLableCont({children, style}) {
  return (
    <View style={[styles.container, style]}>
        {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flexDirection:'row',
    gap:30,
    alignItems:'center'
  },
})

export default RowLableCont;