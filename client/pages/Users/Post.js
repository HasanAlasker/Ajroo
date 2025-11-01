import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import AddImageBtn from "../../components/AddImageBtn";
import FormikDropBox from "../../components/form/FormikDropBox";
import { addPost } from "../../api/post";

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
import { useAlert } from "../../config/AlertContext";
import { uploadImage } from "../../api/upload";

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
  const { showInfo } = useAlert();

  const initialValues = {
    category: "",
    item: "",
    price: "",
    city: "",
    area: "",
    condition: "",
    image: null,
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setStatus, resetForm }
  ) => {
    try {
      const imageUrl = await uploadImage(values.image);

      const postData = {
        image: imageUrl,
        name: values.item,
        pricePerDay: values.price,
        category: values.category,
        city: values.city,
        area: values.area,
        condition: values.condition,
      };

      const response = await addPost(postData);

      showInfo({
        title: "Success",
        message: "Post added successfully.",
        confirmText: "Got it",
      });

      resetForm();
      setHasBeenSubmitted(false);
    } catch (err) {
      console.log("error posting: ", err);
      console.error("Error details:", err.response?.data || err.message);

      showInfo({
        title: "Error",
        message:
          err.response?.data?.message ||
          "Failed to post item. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to post item. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
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
