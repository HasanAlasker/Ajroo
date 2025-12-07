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
import {
  categories,
  price,
  cities,
  condition,
  getAreasByCity,
  getItemsByCategory,
  type,
} from "../../constants/DropOptions";

import { Formik } from "formik";
import FormikDropBox from "../form/FormikDropBox";
import SubmitBtn from "../form/SubmitBtn";
import MenuBackBtn from "../MenuBackBtn";
import FormBtn from "../FormBtn";
import { searchPosts } from "../../api/post";

function FilterModal({ isVisible, onClose, onSearchResults }) {
  const styles = useThemedStyles(getStyles);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const initialValues = {
    category: "",
    item: "",
    price: "",
    city: "",
    area: "",
    condition: "",
    type: "",
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setStatus, resetForm }
  ) => {
    try {
      setHasBeenSubmitted(true);

      // Build activeFilters from Formik values
      const activeFilters = {};

      // Type
      if (values.type) {
        activeFilters.type = values.type;
      }

      // Category
      if (values.category) {
        activeFilters.category = values.category;
      }
      
      // Item (maps to "name" in backend)
      if (values.item) {
        activeFilters.name = values.item;
      }

      // Price - parse the price range (e.g., "10-50")
      if (values.price) {
        const priceStr = values.price.toString();
        if (priceStr.includes("-")) {
          const [min, max] = priceStr.split("-");
          if (min) activeFilters.minPrice = min.trim();
          if (max) activeFilters.maxPrice = max.trim();
        }
      }

      // City
      if (values.city) {
        activeFilters.city = values.city;
      }

      // Area
      if (values.area) {
        activeFilters.area = values.area;
      }

      // Condition
      if (values.condition) {
        activeFilters.condition = values.condition;
      }

      // console.log("FilterModal: Sending filters:", activeFilters);

      // Check if at least one filter is selected
      if (Object.keys(activeFilters).length === 0) {
        // console.log("FilterModal: No filters selected");
        setStatus({ error: "Please select at least one filter" });
        setSubmitting(false);
        return;
      }

      // Make API call directly (not using useApi hook)
      const response = await searchPosts(activeFilters);
      // console.log("FilterModal: Full API response:", response);

      // Extract data from response
      const results = response.data || response || [];
      // console.log("FilterModal: Extracted results:", results.length, "posts");

      // Send results back to parent
      if (onSearchResults) {
        onSearchResults(results);
        // console.log("FilterModal: Results sent to parent");
      }

      // Close modal after successful search
      onClose();
    } catch (error) {
      // console.log("FilterModal: Search error:", error);
      // console.log("FilterModal: Error details:", error.response || error.message);
      setStatus({ error: "Search failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
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
            status,
            resetForm,
            handleSubmit,
            isSubmitting,
          }) => {
            // Handle clear function
            const handleClear = () => {
              resetForm();
              setHasBeenSubmitted(false);
              setStatus(null);
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
                  name="type"
                  placeholder="Select Post Type"
                  items={type}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

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

                {/* <FormikDropBox
                  name="price"
                  placeholder="Select Price Per Day"
                  items={price}
                  hasBeenSubmitted={hasBeenSubmitted}
                /> */}

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

                {status && status.error && (
                  <AppText style={styles.errorText}>{status.error}</AppText>
                )}

                <SubmitBtn
                  defaultText="Search"
                  submittingText="Searching..."
                  setHasBeenSubmitted={setHasBeenSubmitted}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
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
    errorText: {
      color: "red",
      textAlign: "center",
      marginVertical: 10,
      fontSize: 14,
    },
  });

export default FilterModal;
