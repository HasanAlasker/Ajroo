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
import { useRoute } from "@react-navigation/native";
import { getUserById } from "../../api/user";
import LoadingCircle from "../../components/general/LoadingCircle";

function Profile({ isNotification }) {
  const [isMenu, setIsMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const route = useRoute();
  const userId = route?.params?.userId || user.id;
  const myProfile = user.id === userId;

  const {
    data: profile,
    request: fetchProfile,
    loading: userLoading,
    error: userError,
  } = useApi(getUserById);

  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);

  const {
    data: posts,
    loading,
    error,
    request: fetchPosts,
  } = useApi(getUserPosts);

  useEffect(() => {
    fetchPosts(userId);
  }, [userId]);

  if ((loading || userLoading) && (!posts || !profile)) {
    return <LoadingCircle />;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(userId);
    await fetchProfile(userId);
    setRefreshing(false);
  };

  return (
    <SafeScreen>
      <PostRenderer
        fetchedPosts={posts}
        emptyMessage="No available items to show"
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
          isNotification={false} // change dynamicly
          myProfile={myProfile}
          profileId={profile?._id}
          isBlocked={profile?.isBlocked}
          userImage={profile?.image || null}
          userName={profile?.name}
          userRate={profile?.rating || "Unrated Yet"}
          userPhone={profile?.phone}
          userEmail={profile?.email}
          sep={"Items"}
          settingsPress={() => {
            setIsMenu(true);
          }}
        ></TopChunkProfile>

        {user.role !== 'admin' && <IndivisualPromo></IndivisualPromo>}
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
