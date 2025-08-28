import { useState, useEffect } from "react";
import { View, StyleSheet, Modal, ScrollView } from "react-native";
import AppForm from "./AppForm";
import FormikDropBox from "./FormikDropBox";
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
import SubmitBtn from "./SubmitBtn";
import { usePosts } from "../config/PostContext";
import useThemedStyles from "../hooks/useThemedStyles";

import * as Yup from "yup";
import { Formik } from "formik";
import FormBtn from "./FormBtn";

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

function EditPostModal({
  postId,
  visible,
  onClose,
}) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const { editPost, getPostById } = usePosts(); 
  const styles = useThemedStyles(getStyles);

  const existingPost = getPostById(postId);
  
  // If no post found, return null or show error
  if (!existingPost) {
    console.error(`Post with id ${postId} not found`);
    return null;
  }

  const initialValues = {
    category: existingPost.category || "",
    item: existingPost.item || "",
    price: existingPost.price || "", 
    city: existingPost.city || "",
    area: existingPost.area || "",
    condition: existingPost.condition || "",
    image: existingPost.image || null, 
  };

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    console.log("Edit form values:", values);

    try {
      setSubmitting(true);
  
      const updatedData = {
        category: values.category,
        item: values.item,
        price: values.price, 
        city: values.city,
        area: values.area,
        condition: values.condition,
        image: values.image, 
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
      }, 1000);

    } catch (error) {
      console.error('Error updating post:', error);
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
                <FormBtn title={'Cancel'} onPress={onClose} style={styles.cancel}></FormBtn>
              </ScrollView>
            );
          }}
        </Formik>
      </ScrollView>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {},
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  cancel:{
    backgroundColor:theme.red,
    borderColor:theme.red,
    marginTop:20
  },
  scroll:{
    paddingBottom:30,
    backgroundColor:theme.background
  }
});

export default EditPostModal;