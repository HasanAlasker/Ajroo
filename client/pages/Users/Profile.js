import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import TopChunkProfile from "../../components/TopChunkProfile";
import SettingsMenu from "../../components/SettingsMenu";
import { useState } from "react";
import IndivisualPromo from "../../components/IndivisualPromo";
import BuisnessPromo from "../../components/BuisnessPromo";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";
import useApi from "../../hooks/useApi";
import { getUserPosts } from "../../api/post";
import { useEffect } from "react";

function Profile({ isNotification, myProfile = true }) {
  const [isMenu, setIsMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const {
    data: posts,
    loading,
    error,
    request: fetchPosts,
  } = useApi(getUserPosts);

  useEffect(() => {
    fetchPosts(user.id);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(user.id);
    setRefreshing(false);
  };

  return (
    <SafeScreen>
      <PostRenderer
        fetchedPosts={posts}
        emptyMessage="You haven't posted yet"
        refreshing={refreshing}
        onRefresh={handleRefresh}
        currentUserId={user.id}
      >
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
