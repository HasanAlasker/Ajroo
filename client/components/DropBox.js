import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import AppText from "../config/AppText";
import BackContainer from "../components/BackContainer";
import MenuBackBtn from "../components/MenuBackBtn";
import MenuOption from "../components/MenuOption";
import SeparatorComp from "../components/SeparatorComp";
import useApi from "../hooks/useApi";
import { getUserById } from "../api/user";
import { useUser } from "../config/UserContext";
import LoadingCircle from "./general/LoadingCircle";

function DropBox({
  placeholder,
  penOn,
  items,
  onSelectItem,
  selectedValue,
  disabled,
  icon,
}) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { user } = useUser();

  const [modal, setModal] = useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  const {
    data: fetchedUser,
    request: fetchUser,
    loading,
    error: userError,
  } = useApi(getUserById);

  useEffect(() => {
    if (user?.id) {
      fetchUser(user.id);
    }
  }, [user?.id]);

  // Add debug logging
  useEffect(() => {
    if (fetchedUser) {
      console.log("Fetched User:", fetchedUser);
      console.log("Subscription:", fetchedUser.subscription);
      console.log("Product ID:", fetchedUser.subscription?.productId);
    }
  }, [fetchedUser]);

  if (loading && !fetchedUser) {
    return <LoadingCircle />;
  }

  const handlePress = () => {
    if (!disabled) {
      setModal(true);
    }
  };

  const userSubscription = fetchedUser?.subscription?.productId;

  const isSelectionDisabled = (placeholderText, label, value) => {
    // If user data is still loading, don't disable anything
    if (!fetchedUser) {
      console.log("User data still loading, allowing all options");
      return false;
    }

    console.log("Checking subscription:", userSubscription, "for placeholder:", placeholderText, "value:", value);

    // Free users (productId is null) can only post free items
    if (placeholderText === "Select Price Per Day" && value !== "0") {
      // If user has no subscription or is not on a paid plan
      if (
        !userSubscription ||
        (userSubscription !== "pro_monthly" &&
         userSubscription !== "business_premium" &&
         userSubscription !== "business_starter")
      ) {
        console.log("Price restriction applied - free users can only post free items");
        return true;
      }
    }

    // Only business_premium users can post in automotive or real estate categories
    if (
      placeholderText === "Select Category" &&
      (value === "automotive" || value === "realestate")
    ) {
      if (userSubscription !== "business_premium") {
        console.log("Category restriction applied - only business_premium can access automotive/realestate");
        return true;
      }
    }

    return false;
  };

  const handleSelectItem = (item) => {
    if (!isSelectionDisabled(placeholder, item.label, item.value)) {
      setModal(false);
      onSelectItem(item.value);
    }
  };

  const renderItem = ({ item }) => {
    const isDisabled = isSelectionDisabled(placeholder, item.label, item.value);

    return (
      <MenuOption
        text={item.label}
        onPress={() => handleSelectItem(item)}
        disabled={isDisabled}
        showLock={isDisabled}
      />
    );
  };

  return (
    <>
      <View>
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.container, disabled && styles.disabled]}
          disabled={disabled}
        >
          <View style={styles.left}>
            {penOn && <Feather name="edit-3" size={24} color={theme.purple} />}
            {icon && (
              <Feather name={icon} size={24} color={theme.purple}></Feather>
            )}
            <AppText
              style={[
                styles.text,
                disabled && styles.disabledText,
                !selectedItem && styles.placeholderText,
              ]}
            >
              {displayText}
            </AppText>
          </View>
          <Feather name="chevron-down" size={26} color={theme.purple} />
        </TouchableOpacity>
      </View>

      <Modal visible={modal && !disabled} animationType="slide" transparent>
        <View style={styles.modalContent}>
          <BackContainer style={styles.back}>
            <MenuBackBtn
              onClose={() => {
                setModal(false);
              }}
            />
          </BackContainer>

          <FlatList
            data={items}
            keyExtractor={(item) => item.value.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <SeparatorComp style={styles.sep} />}
            contentContainerStyle={styles.list}
          />
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    back: {
      marginVertical: 0,
      marginTop: 25,
    },
    container: {
      flexDirection: "row",
      borderRadius: 18,
      borderColor: theme.purple,
      borderWidth: 2,
      justifyContent: "space-between",
      backgroundColor: theme.post,
      paddingVertical: 5,
      paddingHorizontal: 15,
      width: "90%",
      marginHorizontal: "auto",
      marginTop: 20,
    },
    text: {
      color: theme.purple,
      fontWeight: "bold",
      fontSize: 16,
      textAlignVertical: "center",
    },
    left: {
      flexDirection: "row",
      gap: 10,
    },
    modalContent: {
      backgroundColor: theme.post,
      borderRadius: 20,
      flex: 1,
    },
    list: {
      width: "90%",
      marginHorizontal: "auto",
      paddingBottom: 20,
    },
    sep: {
      width: "100%",
      marginTop: 5,
      marginBottom: 5,
    },
    disabled: {
      opacity: 0.6,
    },
  });

export default DropBox;