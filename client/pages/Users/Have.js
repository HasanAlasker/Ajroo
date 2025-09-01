import { View, StyleSheet, FlatList } from "react-native";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import SafeScreen from "../../components/SafeScreen";
import useThemedStyles from "../../hooks/useThemedStyles";
import Post from "../../components/Post";
import ScrollScreen from "../../components/ScrollScreen";
import { usePosts } from "../../config/PostContext";
import {
  getCategoryLabel,
  getItemLabel,
  getCityLabel,
  getAreaLabel,
  getConditionLabel,
  getPriceLabel,
} from "../../constants/DropOptions";
import RatingModal from "../../components/RatingModal";
import { useUser } from "../../config/UserContext";

function Have(props) {
  const styles = useThemedStyles(getStyles);
  const { posts } = usePosts();
  const {getUserDisplayName, getUserId} = useUser();

  const renderPost = ({ item }) => {
    return (
      <Post
        id={item.id}
        profilePic={item.userImageUri}
        name={getUserDisplayName()}  // change when you have a useContext
        userId={getUserId()}  // change when you have a useContext
        image={item.image}
        itemCat={getCategoryLabel(item.category)}
        itemName={getItemLabel(item.item)} 
        pricePerDay={item.price}
        city={getCityLabel(item.city)} 
        area={getAreaLabel(item.area)} 
        condition={getConditionLabel(item.condition)}
        status={item.status}
        isMine={true}
        rating={item.rating}
        date={item.createdAt}
      />
    );
  };

  return (
    <SafeScreen>
      <SearchBar></SearchBar>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
      ></FlatList>
      {/* <ScrollScreen>
        <Post
          profilePic={require("../../assets/Pics/hasan.png")}
          name={"Hasan Alasker"}
          date={"12/ 1/ 2026"}
          itemName={"Lawn mower"}
          itemCat={"Garden"}
          city={"Amman"}
          area={"Jabal al kursi"}
          status={"taken"}
          rating={4.9}
          condition={"Slightly used"}
          time={""}
          isDisabled={false}
          pricePerDay={300}
        ></Post>
        <Post
          name={"Yazan Nabas"}
          date={"12/ 1/ 2026"}
          profilePic={require("../../assets/Pics/u1.png")}
          itemName={"Electric saw"}
          itemCat={"Tools"}
          city={"Amman"}
          area={"Al madinah al munawara Street"}
          status={"available"}
          rating={"Unrated"}
          condition={"Heavily used"}
          time={""}
          isDisabled={false}
        ></Post>
      </ScrollScreen> */}
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
  });

export default Have;
