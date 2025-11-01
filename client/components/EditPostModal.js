import { useState, useEffect } from "react";
import { View, StyleSheet, Modal, ScrollView } from "react-native";
import AppForm from "./form/AppForm";
import FormikDropBox from "./form/FormikDropBox";
import AddImageBtn from "./AddImageBtn";
import {
  areas,
  categories,
  items,
  price,
  cities,
  condition,
  getAreasByCity,
  getItemsByCategory,
} from "../constants/DropOptions";
import SubmitBtn from "./form/SubmitBtn";
import useThemedStyles from "../hooks/useThemedStyles";
import LoadingCircle from "../components/general/LoadingCircle";

import * as Yup from "yup";
import { Formik } from "formik";
import FormBtn from "./FormBtn";
import { editPost, getPostById } from "../api/post";
import useApi from "../hooks/useApi";
import { uploadImage } from "../api/upload";

const validationSchema = Yup.object().shape({
  category: Yup.string()
    .required("Please select a category")
    .oneOf(
      categories.map((cat) => cat.value),
      "Please select a valid category"
    ),

  item: Yup.string()
    .required("Please select an item")
    .test(
      "item-matches-category",
      "Please select a valid item for this category",
      function (value) {
        const { category } = this.parent;
        if (!category || !value) return true;

        const categoryItems = getItemsByCategory(category);
        return categoryItems.some((item) => item.value === value);
      }
    ),

  city: Yup.string()
    .required("Please select a city")
    .oneOf(
      cities.map((city) => city.value),
      "Please select a valid city"
    ),

  area: Yup.string()
    .required("Please select an area")
    .test(
      "area-matches-city",
      "Please select a valid area for this city",
      function (value) {
        const { city } = this.parent;
        if (!city || !value) return true;

        const cityAreas = getAreasByCity(city);
        return cityAreas.some((area) => area.value === value);
      }
    ),

  condition: Yup.string()
    .required("Please select item condition")
    .oneOf(
      condition.map((cond) => cond.value),
      "Please select a valid condition"
    ),

  image: Yup.mixed()
    .required("Please add an image")
    .test("file-type", "Please select a valid image file", (value) => {
      if (!value) return false;
      return value.uri || typeof value === "string";
    }),

  price: Yup.string().required("Please choose pricing"),
});

function EditPostModal({ postId, visible, onClose }) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const {
    data: post,
    request: fetchPost,
    error,
    loading,
  } = useApi(getPostById);
  const styles = useThemedStyles(getStyles);

  useEffect(() => {
    if (visible && postId) {
      fetchPost(postId);
    }
  }, [postId, visible]);

  if (loading) {
    return <LoadingCircle />;
  }

  if (!post) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.errorContainer}>
          <FormBtn title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  }

  const initialValues = {
    category: post.category || "",
    item: post.name || "",
    price: post.pricePerDay?.toString() || "",
    city: post.city || "",
    area: post.area || "",
    condition: post.condition || "",
    image: post.image || null,
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setStatus, resetForm }
  ) => {

    try {
      setSubmitting(true);

      let imageUrl = values.image;
      if (values.image && !values.image.startsWith("http")) {
        imageUrl = await uploadImage(values.image);
      }

      const updatedData = {
        category: values.category,
        name: values.item,
        pricePerDay: values.price,
        city: values.city,
        area: values.area,
        condition: values.condition,
        image: imageUrl,
      };

      await editPost(postId, updatedData);
      setHasBeenSubmitted(true);

      // Simulate API call success
      setTimeout(() => {
        setStatus({ type: "success", message: "Item updated successfully!" });
        setHasBeenSubmitted(false);
        if (onClose) {
          onClose(); // Close the modal
        }
        setSubmitting(false);
      }, 500);
    } catch (error) {
      console.error("Error updating post:", error);
      setStatus({
        type: "error",
        message: "Failed to update item. Please try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, setFieldValue, setStatus }) => {
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
              <ScrollView contentContainerStyle={styles.scroll}>
                <AddImageBtn
                  image={values.image}
                  onImageChange={(image) => {
                    setFieldValue("image", image);
                    setStatus(null);
                  }}
                  error={hasBeenSubmitted && errors.image}
                  errorMessage={errors.image}
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
                  setHasBeenSubmitted={setHasBeenSubmitted}
                  defaultText="Update Post"
                  submittingText="Updating..."
                />
                <FormBtn
                  title={"Cancel"}
                  onPress={onClose}
                  style={styles.cancel}
                ></FormBtn>
              </ScrollView>
            );
          }}
        </Formik>
      </ScrollView>
    </Modal>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
    scroll: {
      flex: 1,
      backgroundColor: theme.background,
    },
    cancel: {
      backgroundColor: theme.red,
      borderColor: theme.red,
      marginTop: 20,
    },
    scroll: {
      paddingBottom: 30,
      backgroundColor: theme.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: 20,
    },
  });

export default EditPostModal;
