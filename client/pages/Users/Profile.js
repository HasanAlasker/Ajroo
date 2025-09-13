import { StyleSheet } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import Navbar from "../../components/Navbar";
import TopChunkProfile from "../../components/TopChunkProfile";
import SettingsMenu from "../../components/SettingsMenu";
import { useState } from "react";
import IndivisualPromo from "../../components/IndivisualPromo";
import BuisnessPromo from "../../components/BuisnessPromo";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";


function Profile({ isNotification, myProfile = true }) {
  const [isMenu, setIsMenu] = useState(false);
  const { user } = useUser();

  return (
    <SafeScreen>
      <PostRenderer filterType={"allMine"} currentUserId={user.id} emptyMessage="You haven't posted yet">
        <SettingsMenu
          isVisible={isMenu}
          onClose={() => {
            setIsMenu(false);
          }}
        ></SettingsMenu>

        <TopChunkProfile
          isNotification={true} // change dynamicly
          myProfile={myProfile}
          userName={user.name}
          userRate={null}
          sep={"Items"}
          settingsPress={() => {
            setIsMenu(true);
          }}
        ></TopChunkProfile>

        <IndivisualPromo></IndivisualPromo>
        {/* <BuisnessPromo></BuisnessPromo> */}
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Profile;
