import { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import AppText from "../config/AppText";
import PlusMinusBtn from "./PlusMinusBtn";
import CardModal from "./CardModal";
import RequestBtn from "./RequestBtn";
import { FontAwesome6 } from "@expo/vector-icons";
import useThemedStyles from "../hooks/useThemedStyles";
import { useTheme } from "../config/ThemeContext";
import { usePosts } from "../config/PostContext";

function RequestModal({ isVisibile, onClose, pricePerDay, onRequestSubmit, postId }) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const { updatePost } = usePosts();

  const [duration, setDuration] = useState(0);
  const [baseUnit, setBaseUnit] = useState(""); // Store base unit
  const [active, setActive] = useState(null);

  const increase = () => setDuration((prev) => Math.min(prev + 1, 99));
  const decrease = () => setDuration((prev) => Math.max(prev - 1, 1));

  const handleUnit = (units) => {
    setBaseUnit(units);
    setActive(units);

    if (units === "hours" && duration > 23) {
      setDuration(23);
    }
    if (units === "days" && duration > 29) {
      setDuration(29);
    }
    if (units === "weeks" && duration > 3) {
      setDuration(3);
    }
    if (units === "months" && duration > 12) {
      setDuration(12);
    }
    if (duration === 0) {
      setDuration(1); // Set to 1 when switching units if currently 0
    }
  };

  const disableIncrease = () => {
    if (baseUnit === "hours" && duration >= 23) return true;
    if (baseUnit === "days" && duration >= 29) return true;
    if (baseUnit === "weeks" && duration >= 3) return true;
    if (baseUnit === "months" && duration >= 12) return true;
  };
  const disabledButton = () => {
    return disableIncrease() ? 0.2 : 1;
  };
  const showPrice = () => {
    if (baseUnit === "hours") {
      return pricePerDay <= 25
        ? pricePerDay
        : Math.round((pricePerDay / 24) * duration);
    } else if (baseUnit === "days") return Math.round(pricePerDay * duration);
    else if (baseUnit === "weeks")
      return Math.round(pricePerDay * duration * 7);
    else if (baseUnit === "months")
      return Math.round(pricePerDay * duration * 30);
    else return "Invalid";
  };

  // Compute the display unit on each render
  const displayUnit = baseUnit
    ? duration === 1
      ? baseUnit.slice(0, -1)
      : baseUnit
    : "";

  const handleRequest = () => {
    updatePost(postId, {status : 'pending'})
    onRequestSubmit()
    onClose()
  };

  return (
    <CardModal isVisibile={isVisibile} onClose={onClose}>
      <AppText style={styles.text}>Duration</AppText>
      <View style={styles.addMinus}>
        <PlusMinusBtn icon={"minus"} onPress={decrease}></PlusMinusBtn>
        <AppText style={styles.number}>{duration}</AppText>
        <PlusMinusBtn
          icon={"plus"}
          onPress={increase}
          disabled={disableIncrease()}
          style={{ opacity: disabledButton() }}
        ></PlusMinusBtn>
      </View>
      <AppText style={styles.text}>Time unit</AppText>
      <View style={styles.buttons}>
        <View style={styles.buttons}>
          <RequestBtn
            title={"Hours"}
            isActive={active === "hours"}
            onPress={() => handleUnit("hours")}
          ></RequestBtn>
          <RequestBtn
            title={"Days"}
            isActive={active === "days"}
            onPress={() => handleUnit("days")}
          ></RequestBtn>
          <RequestBtn
            title={"Weeks"}
            isActive={active === "weeks"}
            onPress={() => handleUnit("weeks")}
          ></RequestBtn>
          <RequestBtn
            title={"Months"}
            isActive={active === "months"}
            onPress={() => handleUnit("months")}
          ></RequestBtn>
        </View>
      </View>
      {duration > 0 && displayUnit != "" && (
        <View style={styles.display}>
          <View style={styles.row}>
            <AppText style={styles.faded}>Requesting for:</AppText>
            <AppText style={styles.text}>
              {duration} {displayUnit}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText style={styles.faded}>Total cost:</AppText>
            {pricePerDay ? (
              <AppText style={styles.text}>
                {showPrice()}
                {" JD"}
              </AppText>
            ) : (
              <AppText style={styles.text}>Free</AppText>
            )}
          </View>
          {baseUnit === "hours" && pricePerDay > 0 && pricePerDay <= 25 && (
            <View style={styles.row}>
              <FontAwesome6
                name="circle-exclamation"
                color={theme.darker_gray}
              ></FontAwesome6>
              <AppText style={[styles.faded, styles.small]}>
                Items ≤ 25 JD are charged for a full day
              </AppText>
            </View>
          )}
        </View>
      )}
      {duration > 0 && displayUnit != "" && (
        <View style={styles.buttons}>
          <View style={styles.buttons}>
            <RequestBtn
              title={"Request"}
              isGreen={true}
              onPress={handleRequest}
            ></RequestBtn>
            <RequestBtn
              title={"Cancel"}
              isRed={true}
              onPress={onClose}
            ></RequestBtn>
          </View>
        </View>
      )}
      {(duration === 0 || displayUnit === "") && (
        <RequestBtn
          style={styles.fullBtn}
          title={"Cancel"}
          isRed={true}
          onPress={onClose}
        ></RequestBtn>
      )}
    </CardModal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: "90%",
      margin: "auto",

      backgroundColor: theme.post,
      zIndex: 250,
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 25,

      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,

      elevation: 6,
    },
    row: {
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    overlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: theme.background,
      opacity: 0.5,
    },
    text: {
      fontSize: 20,
      color: theme.main_text,
    },
    addMinus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 25,
      marginBottom: 10,
    },
    number: {
      fontSize: 85,
      color: theme.purple,
      fontWeight: "bold",
    },
    buttons: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
      rowGap: 20,
      justifyContent: "space-between",
      marginTop: 10,
    },
    display: {
      width: "100%",
      backgroundColor: theme.light_gray,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      gap: 10,
      marginTop: 30,
      marginBottom: 30,
    },
    faded: {
      color: theme.darker_gray,
      fontSize: 20,
    },
    fullBtn: {
      width: "100%",
      marginTop: 40,
    },
    small: {
      fontSize: 15,
    },
  });

export default RequestModal;
