import { useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import TopNav from "../../components/TopNav";
import Navbar from "../../components/Navbar";
import ScrollScreen from "../../components/ScrollScreen";
import Post from "../../components/Post";
import { useUser } from "../../config/UserContext";
import PostRenderer from "../../components/PostRenderer";

function Requests(props) {
  const [activeTab, setActiveTab] = useState("Got");
  const { user } = useUser();

  const renderContent = () => {
    switch (activeTab) {
      case "Sent":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"iRequested"}
              emptyMessage="You haven't requested items yet"
            ></PostRenderer>

            {/* <Post
              name={"Ibrahim Mosa"}
              date={"12/ 1/ 2026"}
              profilePic={require("../../assets/Pics/u1.png")}
              // image={require("../../assets/Pics/hd.png")}
              itemName={"Hair Dryer"}
              itemCat={"Household"}
              area={"Al shmesani"}
              status={"available"}
              rating={"3.7"}
              condition={"Heavily used"}
              time={""}
              isMine={false}
              iRequested={true}
              isDisabled={false}
            ></Post> */}
          </>
        );
      case "Got":
        return (
          <>
            <PostRenderer
              currentUserId={user.id}
              filterType={"myRequested"}
              emptyMessage="You haven't received any requests yet"
            ></PostRenderer>
            {/* <Post
              name={"Mohammad Issa"}
              date={"12/ 1/ 2026"}
              profilePic={require("../../assets/Pics/u2.png")}
              // image={require("../../assets/Pics/vc.png")}
              itemName={"Vacuum Cleaner"}
              itemCat={"Tools"}
              area={"Airport Street"}
              status={"requested"}
              rating={"Unrated"}
              condition={"Very good"}
              time={""}
              isMine={true}
              isDisabled={false}
            ></Post> */}
          </>
        );
      default:
      // return <SentContent />;
    }
  };

  return (
    <SafeScreen>
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Requests;
