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

        {/* <Post
          area={"Al Jandaweel"}
          condition={"Brand new"}
          date={"12/ 1/ 2024"}
          name={user.name}
          profilePic={user.avatar}
          // image={require('../../assets/Pics/tv.png')}
          itemName={"Television"}
          itemCat={"Electronics"}
          isMine={true}
          status={"requested"}
          rating={"4.3"}
          iBorrowed={false}
          iRequested={false}
        ></Post>
        <Post
          area={"Al Jandaweel"}
          condition={"Brand new"}
          date={"12/ 1/ 2024"}
          name={user.name}
          profilePic={user.avatar}
          // image={require('../../assets/Pics/tv.png')}
          itemName={"Television"}
          itemCat={"Electronics"}
          isMine={true}
          status={"taken"}
          rating={"4.3"}
          iBorrowed={false}
          iRequested={false}
        ></Post>
        <Post
          area={"Al Jandaweel"}
          condition={"Brand new"}
          date={"12/ 1/ 2024"}
          name={user.name}
          profilePic={user.avatar}
          // image={require('../../assets/Pics/tv.png')}
          itemName={"Television"}
          itemCat={"Electronics"}
          isMine={true}
          status={"available"}
          rating={"4.3"}
          iBorrowed={false}
          iRequested={false}
        ></Post>
        <Post
          area={"Al Jandaweel"}
          condition={"Brand new"}
          date={"12/ 1/ 2024"}
          name={user.name}
          profilePic={user.avatar}
          // image={require('../../assets/Pics/tv.png')}
          itemName={"Television"}
          itemCat={"Electronics"}
          isMine={true}
          status={"disabled"}
          rating={"4.3"}
          iBorrowed={false}
          iRequested={false}
        ></Post> */}
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Profile;
