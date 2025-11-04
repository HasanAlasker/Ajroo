import { View, StyleSheet } from 'react-native';
import MyProfileContainer from './MyProfileContainer';
import NotificationBtn from './NotificationBtn';
import UserPicAndRateContainer from './UserPicAndRateContainer';
import BigPicAndUsername from './BigPicAndUsername';
import UserRate from './UserRate';
import SettingsBtn from './SettingsBtn';
import SeparatorComp from './SeparatorComp';
import BackBtn from './BackBtn';
import BlankBtn from './BlankBtn';

function TopChunkProfile({myProfile, isNotification, userName, userRate, sep, isPicDisabled, settingsPress, onImageChange, userImage}) {
  return (
    <View style={styles.container}>
        <MyProfileContainer>
          {myProfile ? <NotificationBtn isActive={isNotification}></NotificationBtn>: <BackBtn></BackBtn>}
          <UserPicAndRateContainer>
            <BigPicAndUsername
              initialImage={userImage}
              userName={userName}
              isEdit={myProfile}
              isPicDisabled={isPicDisabled}
              onImageChange={onImageChange}
            ></BigPicAndUsername>
            <UserRate userRating={userRate}></UserRate>
          </UserPicAndRateContainer>
          {myProfile ? <SettingsBtn onPress={settingsPress}></SettingsBtn> : <BlankBtn></BlankBtn>}
        </MyProfileContainer>
        <SeparatorComp>{sep}</SeparatorComp>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    width:'100%'
  },
})

export default TopChunkProfile;