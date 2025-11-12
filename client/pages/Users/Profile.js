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
import ErrorBox from "../../components/general/ErrorBox";

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

        {user.role !== "admin" && !profile?.isBlocked && (
          <IndivisualPromo></IndivisualPromo>
        )}
        {profile?.isBlocked && myProfile && (
          <ErrorBox
            style={styles.err}
            firstTitle={"Notice"}
            fistDetail={
              "Your account has been suspended for violating our policy.You can still return borrowed items and give back those listed on the Book page."
            }
            secondTitle={"What to do"}
            secondDetail={"If you believe this is a mistake, contact us through Support in Settings."}
          />
        )}
        {/* <BuisnessPromo></BuisnessPromo> */}
      </PostRenderer>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  err: {
    width: "90%",
    margin: "auto",
  },
});

export default Profile;
