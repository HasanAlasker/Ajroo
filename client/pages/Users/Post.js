import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import AddImageBtn from "../../components/AddImageBtn";
import FormikDropBox from "../../components/form/FormikDropBox";

import { Formik } from "formik";
import * as Yup from "yup";

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
import SubmitBtn from "../../components/form/SubmitBtn";
import { usePosts } from "../../config/PostContext";
import { useUser } from "../../config/UserContext";

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

  image: Yup.string()
    .nullable()
    .required("Please add an image")
    .test("valid-uri", "Please select a valid image", (value) => {
      if (!value) return false;
      // Check if it's a valid URI string
      return typeof value === "string" && value.length > 0;
    }),

  price: Yup.string().required("Please choose pricing"),
});

function Post(props) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const { addPost } = usePosts();
  const { user } = useUser();
  const initialValues = {
    category: "",
    item: "",
    price: "",
    city: "",
    area: "",
    condition: "",
    image: null,
  };

  const handleSubmit = (values, { setSubmitting, setStatus, resetForm }) => {
    console.log("Post form values:", values);

    const userImageUri = user.avatar;
    const userId = user.id;
    const username = user.id;
    const status = "available";
    const rating = null;

    addPost({
      userImageUri,
      username,
      userId,
      image: values.image,
      category: values.category,
      item: values.item,
      price: values.price,
      city: values.city,
      area: values.area,
      condition: values.condition,
      status,
      rating,
    });
    setHasBeenSubmitted(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Your API call here
        setStatus({ type: "success", message: "Item posted successfully!" });
        resetForm();
        setHasBeenSubmitted(false); // Reset submission state
      } catch (error) {
        setStatus({
          type: "error",
          message: "Failed to post item. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    }, 500);
  };

  return (
    <SafeScreen>
      <ScrollScreen>
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
              <>
                <AddImageBtn
                  image={values.image} // This will now correctly show the image
                  onImageChange={(imageUri) => {
                    console.log("Image selected:", imageUri); // Debug log
                    setFieldValue("image", imageUri);
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
                ></SubmitBtn>
              </>
            );
          }}
        </Formik>
      </ScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Post;
