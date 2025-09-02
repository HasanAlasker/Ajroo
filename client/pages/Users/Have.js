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
  const { user} = useUser();

  const renderPost = ({ item }) => {
    return (
      <Post
        id={item.id}
        profilePic={user.avatar}
        name={user.name}  
        userId={user.id} 
        image={item.image}
        itemCat={getCategoryLabel(item.category)}
        itemName={getItemLabel(item.item)} 
        pricePerDay={item.price}
        city={getCityLabel(item.city)} 
        area={getAreaLabel(item.area)} 
        condition={getConditionLabel(item.condition)}
        status={item.status}
        isMine={false}
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
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
  });

export default Have;
