import { View, StyleSheet } from "react-native";
import AppText from "../../config/AppText";
import ScrollScreen from "../../components/general/ScrollScreen";
import useThemedStyles from "../../hooks/useThemedStyles";
import SquareCard from "../../components/SquareCard";
import Navbar from "../../components/general/Navbar";
import SafeScreen from "../../components/general/SafeScreen";

function Home({ navigation }) {
  const styles = useThemedStyles(getStyles);

  const handleCardPress = (categoryName) => {
    // Navigate to Have page with category filter
    navigation.navigate("Have", {
      category: categoryName,
      applyFilter: true,
    });
  };

  return (
    <SafeScreen>
      {/* <SearchBar></SearchBar> */}
      <ScrollScreen>
        {/* <WelcomeCard /> */}

        <AppText style={styles.text}>
          What kind of item are you looking for?
        </AppText>
        <View style={styles.grid}>
          <SquareCard
            icon={"car"}
            name={"Vehicles"}
            cardnum={9}
            onPress={() => handleCardPress("Vehicles")}
          ></SquareCard>
          <SquareCard
            icon={"home-city"}
            name={"Real-Estate"}
            cardnum={6}
            onPress={() => handleCardPress("RealEstate")}
          ></SquareCard>
          <SquareCard
            icon={"pliers"}
            name={"Tools"}
            cardnum={5}
            onPress={() => handleCardPress("Tools")}
          ></SquareCard>
          <SquareCard
            icon={"fridge"}
            name={"Electronics"}
            cardnum={7}
            onPress={() => handleCardPress("Electronics")}
          ></SquareCard>
          <SquareCard
            icon={"home"}
            name={"Household"}
            cardnum={4}
            onPress={() => handleCardPress("Household")}
          ></SquareCard>
          <SquareCard
            icon={"sofa"}
            name={"Furniture"}
            cardnum={11}
            onPress={() => handleCardPress("Furniture")}
          ></SquareCard>
          <SquareCard
            icon={"flower"}
            name={"Garden"}
            cardnum={3}
            onPress={() => handleCardPress("Garden")}
          ></SquareCard>
          <SquareCard
            icon={"teddy-bear"}
            name={"Baby & Kids"}
            cardnum={2}
            onPress={() => handleCardPress("Baby_Kids")}
          ></SquareCard>
          <SquareCard
            icon={"tshirt-crew"}
            name={"Clothes"}
            cardnum={1}
            onPress={() => handleCardPress("Clothes")}
          ></SquareCard>
          <SquareCard
            icon={"bicycle"}
            name={"Sports"}
            cardnum={10}
            onPress={() => handleCardPress("Sports")}
          ></SquareCard>
          <SquareCard
            icon={"book"}
            name={"Books"}
            cardnum={8}
            onPress={() => handleCardPress("Books")}
          ></SquareCard>
          <SquareCard
            icon={"calendar"}
            name={"Events"}
            cardnum={12}
            onPress={() => handleCardPress("Events")}
          ></SquareCard>
        </View>
      </ScrollScreen>
      <Navbar></Navbar>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: theme.background,
    },
    grid: {
      marginTop: 25,
      marginBottom: 55,
      width: "90%",
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: "auto",
      justifyContent: "space-between",
      rowGap: 20,
    },
    text: {
      fontSize: 30,
      fontWeight: "bold",
      width: "90%",
      marginHorizontal: "auto",
      marginTop: 30,
      color: theme.main_text,
    },
  });

export default Home;
