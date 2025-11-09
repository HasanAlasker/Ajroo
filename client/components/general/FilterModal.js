import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import useThemedStyles from "../../hooks/useThemedStyles";
import BackContainer from "../BackContainer";
import AppText from "../../config/AppText";
import AppForm from "../form/AppForm";
import {
  areas,
  categories,
  items,
  price,
  cities,
  condition,
  getAreasByCity,
  getItemsByCategory,
} from "../../constants/DropOptions";

import { Formik } from "formik";
import FormikDropBox from "../form/FormikDropBox";
import SubmitBtn from "../form/SubmitBtn";
import MenuBackBtn from "../MenuBackBtn";
import FormBtn from "../FormBtn";

function FilterModal({ isVisible, onClose }) {
  const styles = useThemedStyles(getStyles);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const initialValues = {
    category: "",
    item: "",
    price: "", // make it min / max price
    city: "",
    area: "",
    condition: "",
    // rating: ""
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setStatus, resetForm }
  ) => {
    setSubmitting(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.container}>
        <BackContainer style={styles.back}>
          <MenuBackBtn onClose={onClose} x={true} style={styles.close} />
        </BackContainer>

        <AppText style={styles.text}>Filter Search</AppText>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({
            values,
            errors,
            setFieldValue,
            setStatus,
            resetForm,
            handleSubmit,
          }) => {
            // Handle clear function - this gets access to resetForm
            const handleClear = () => {
              resetForm(); // Reset to initial values
              setHasBeenSubmitted(false); // Reset submission state
            };

            const [availableItems, setAvailableItems] = useState([]);
            const [availableAreas, setAvailableAreas] = useState([]);

            // Update available items when category changes
            useEffect(() => {
              if (values.category) {
                const categoryItems = getItemsByCategory(values.category);
                setAvailableItems(categoryItems);

                const currentItemValid = categoryItems.some(
                  (item) => item.value === values.item
                );
                if (values.item && !currentItemValid) {
                  setFieldValue("item", "");
                }
              } else {
                setAvailableItems([]);
                if (values.item) {
                  setFieldValue("item", "");
                }
              }
            }, [values.category]);

            // Update available areas when city changes
            useEffect(() => {
              if (values.city) {
                const cityAreas = getAreasByCity(values.city);
                setAvailableAreas(cityAreas);

                const currentAreaValid = cityAreas.some(
                  (area) => area.value === values.area
                );
                if (values.area && !currentAreaValid) {
                  setFieldValue("area", "");
                }
              } else {
                setAvailableAreas([]);
                if (values.area) {
                  setFieldValue("area", "");
                }
              }
            }, [values.city]);

            return (
              <ScrollView>
                <FormikDropBox
                  name="category"
                  placeholder="Select Category"
                  items={categories}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <FormikDropBox
                  name="item"
                  placeholder="Select Item"
                  items={availableItems}
                  disabled={!values.category || availableItems.length === 0}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <FormikDropBox
                  name="price"
                  placeholder="Select Price Per Day"
                  items={price}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <FormikDropBox
                  name="city"
                  placeholder="Select City"
                  items={cities}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <FormikDropBox
                  name="area"
                  placeholder="Select Area"
                  items={availableAreas}
                  disabled={!values.city || availableAreas.length === 0}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <FormikDropBox
                  name="condition"
                  placeholder="Select Condition"
                  items={condition}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                <SubmitBtn
                  defaultText="Search"
                  submittingText="Searching..."
                  setHasBeenSubmitted={setHasBeenSubmitted}
                  onPress={handleSubmit}
                />

                <FormBtn
                  title="Clear"
                  onPress={handleClear}
                  style={styles.clearButton}
                  textColor={"purple"}
                />
              </ScrollView>
            );
          }}
        </Formik>
      </View>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.post,
      borderBottomRightRadius: 22,
      borderBottomLeftRadius: 22,
      zIndex: 90,
      position: "absolute",
      width: "100%",
      paddingBottom: 40,
    },
    overlay: {
      position: "absolute",
      backgroundColor: theme.background,
      zIndex: 80,
      opacity: 0.5,
      flex: 1,
      inset: 0,
    },
    text: {
      color: theme.main_text,
      fontSize: 18,
      textAlign: "center",
      fontWeight: "bold",
    },
    back: {
      marginVertical: 0,
      marginTop: 13,
    },
    clearButton: {
      marginTop: 10,
      backgroundColor: theme.post,
      borderColor: theme.purple,
    },
    close: {
      marginBottom: 0,
    },
  });

export default FilterModal;
