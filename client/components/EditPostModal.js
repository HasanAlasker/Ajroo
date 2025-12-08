import { useState, useEffect } from "react";
import { View, StyleSheet, Modal, ScrollView, Text } from "react-native";
import FormikDropBox from "./form/FormikDropBox";
import AddImageBtn from "./AddImageBtn";
import {
  categories,
  price,
  cities,
  condition,
  getAreasByCity,
  getItemsByCategory,
} from "../constants/DropOptions";
import SubmitBtn from "./form/SubmitBtn";
import useThemedStyles from "../hooks/useThemedStyles";
import LoadingCircle from "../components/general/LoadingCircle";
import FormikInput from "./form/FormikInput";

import * as Yup from "yup";
import { Formik } from "formik";
import FormBtn from "./FormBtn";
import { editPost, getPostById } from "../api/post";
import useApi from "../hooks/useApi";
import { uploadImage } from "../api/upload";
import { getUserById } from "../api/user";
import Purchases from "react-native-purchases";
import { useUser } from "../config/UserContext";

// Dynamic validation schema based on post type
const getValidationSchema = (postType) => {
  const baseSchema = {
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
    description: Yup.string()
      .min(
        10,
        "Please provide a more detailed description (at least 10 characters)"
      )
      .optional(),
  };

  // Add type-specific validation
  if (postType === "Rent" || postType === "rent") {
    baseSchema.price = Yup.string().required("Please choose pricing");
  } else if (postType === "Sell" || postType === "sell") {
    baseSchema.sellPrice = Yup.number()
      .typeError("Please enter a valid number for the price")
      .min(1, "The price must be at least 1")
      .required("A price is required to list your item");
  }

  return Yup.object().shape(baseSchema);
};

function EditPostModal({ postId, visible, onClose }) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [userPlan, setUserPlan] = useState("individual_free");
  const {user} = useUser()

  const styles = useThemedStyles(getStyles);

  const {
    data: post,
    request: fetchPost,
    error,
    loading,
  } = useApi(getPostById);

  const {
    data: fetchedUser,
    request: fetchUser,
    loading: fetching,
  } = useApi(getUserById);

  useEffect(() => {
    if (visible && postId) {
      fetchPost(postId);
    }
  }, [postId, visible]);

  useEffect(() => {
    if (user?.id) {
      fetchUser(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const checkUserSubscription = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const entitlements = customerInfo.entitlements.active;

        let planType = "individual_free";

        if (entitlements["premium"]) {
          planType = "business_premium:premium";
        } else if (entitlements["starter"]) {
          planType = "business_starter:starter";
        } else if (entitlements["pro"]) {
          planType = "pro_monthly:pro";
        }

        setUserPlan(planType);
        setSubscriptionError(null);

       
        
      } catch (error) {
        console.error("❌ Error checking subscription:", error);
        setSubscriptionError(error.message);
        setUserPlan("individual_free");
      }
    };

    if (fetchedUser) {
      checkUserSubscription();
    }
  }, [fetchedUser]);

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

  // Normalize post type to match frontend format (capitalize first letter)
  const postType =
    post.type?.charAt(0).toUpperCase() + post.type?.slice(1).toLowerCase() ||
    "Rent";

  const initialValues = {
    category: post.category || "",
    item: post.name || "",
    price: post.pricePerDay?.toString() || "",
    sellPrice: post.sellPrice || "",
    city: post.city || "",
    area: post.area || "",
    condition: post.condition || "",
    image: post.image || null,
    description: post.description || "",
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
        city: values.city,
        area: values.area,
        condition: values.condition,
        image: imageUrl,
        description: values.description,
      };

      // Add type-specific fields (type itself cannot be changed)
      if (postType === "Rent") {
        updatedData.pricePerDay = values.price;
      } else if (postType === "Sell") {
        updatedData.sellPrice = values.sellPrice;
      }

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
          validationSchema={getValidationSchema(postType)}
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

                {/* Display post type (non-editable) */}
                <View style={styles.typeIndicator}>
                  <Text style={styles.typeLabel}>Listing Type:</Text>
                  <Text style={styles.typeValue}>{postType}</Text>
                </View>

                <FormikDropBox
                  name="category"
                  placeholder="Select Category"
                  items={categories}
                  hasBeenSubmitted={hasBeenSubmitted}
                  userPlan={userPlan}
                />

                <FormikDropBox
                  name="item"
                  placeholder="Select Item"
                  items={availableItems}
                  disabled={!values.category || availableItems.length === 0}
                  hasBeenSubmitted={hasBeenSubmitted}
                />

                {postType === "Rent" && (
                  <FormikDropBox
                    name="price"
                    placeholder="Select Price Per Day"
                    items={price}
                    hasBeenSubmitted={hasBeenSubmitted}
                    userPlan={userPlan}
                  />
                )}

                {postType === "Sell" && (
                  <FormikInput
                    name="sellPrice"
                    placeholder="Enter Selling Price"
                    hasBeenSubmitted={hasBeenSubmitted}
                    keyboardType={"numeric"}
                  />
                )}

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

                {postType === "Sell" && (
                  <FormikInput
                    name="description"
                    placeholder="Description (optional)"
                    hasBeenSubmitted={hasBeenSubmitted}
                    isBox={true}
                    height={100}
                  />
                )}

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
    typeIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 15,
      backgroundColor: theme.post,
      borderRadius: 8,
      marginHorizontal: "5%",
      marginVertical: 10,
      gap: 10,
    },
    typeLabel: {
      fontSize: 16,
      color: theme.sec_text,
      fontWeight: "bold",
    },
    typeValue: {
      fontSize: 16,
      color: theme.purple,
      fontWeight: "bold",
    },
  });

export default EditPostModal;
