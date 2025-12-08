import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import ScrollScreen from "../../components/general/ScrollScreen";
import Navbar from "../../components/general/Navbar";
import AddImageBtn from "../../components/AddImageBtn";
import FormikDropBox from "../../components/form/FormikDropBox";
import { addPost } from "../../api/post";

import { Formik } from "formik";
import * as Yup from "yup";

import {
  categories,
  price,
  cities,
  condition,
  getAreasByCity,
  getItemsByCategory,
} from "../../constants/DropOptions";
import SubmitBtn from "../../components/form/SubmitBtn";
import { useUser } from "../../config/UserContext";
import { useAlert } from "../../config/AlertContext";
import { uploadImage } from "../../api/upload";
import useApi from "../../hooks/useApi";
import { getUserById } from "../../api/user";
import Purchases from "react-native-purchases";
import {
  SUBSCRIPTION_LIMITS,
  canUserPost,
  getPostLimit,
} from "../../constants/subscriptionLimits";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import RequestBtn from "../../components/RequestBtn";
import FormikInput from "../../components/form/FormikInput";

// Fixed validation schema - conditional based on active type
const getValidationSchema = (active) => {
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
    image: Yup.string()
      .nullable()
      .required("Please add an image")
      .test("valid-uri", "Please select a valid image", (value) => {
        if (!value) return false;
        return typeof value === "string" && value.length > 0;
      }),
    description: Yup.string()
      .min(
        10,
        "Please provide a more detailed description (at least 10 characters)"
      )
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
  };

  // Add conditional validation based on active type
  if (active === "Rent") {
    baseSchema.price = Yup.string().required("Please choose pricing");
  } else if (active === "Sell") {
    baseSchema.sellPrice = Yup.number()
      .typeError("Please enter a valid number for the price")
      .min(1, "The price must be at least 1")
      .required("A price is required to list your item");
  }

  return Yup.object().shape(baseSchema);
};

const mapEntitlementToPlanType = (entitlementKey) => {
  const mapping = {
    pro: "pro_monthly:pro",
    starter: "business_starter:starter",
    premium: "business_premium:premium",
  };
  return mapping[entitlementKey] || "individual_free";
};

function Post(props) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState("individual_free");
  const [canPost, setCanPost] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [active, setActive] = useState("Rent");
  const { showInfo } = useAlert();
  const { user } = useUser();
  const styles = useThemedStyles(getStyles);

  const {
    data: fetchedUser,
    request: fetchUser,
    loading: fetching,
  } = useApi(getUserById);

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

        if (fetchedUser?.postCount !== undefined) {
          const canUserPostNow = canUserPost(fetchedUser.postCount, planType);
          setCanPost(canUserPostNow);

          const limit = getPostLimit(planType);

          if (limit !== -1 && fetchedUser.postCount >= limit) {
            showInfo({
              title: "Post Limit Reached",
              message: `You've reached your ${SUBSCRIPTION_LIMITS[planType].name} limit of ${limit} posts. Please upgrade to post more items.`,
              confirmText: "Upgrade",
            });
          }
        }
      } catch (error) {
        console.error("❌ Error checking subscription:", error);
        setSubscriptionError(error.message);
        setUserPlan("free");
        setCanPost(fetchedUser?.postCount < 2);
      }
    };

    if (fetchedUser) {
      checkUserSubscription();
    }
  }, [fetchedUser]);

  const initialValues = {
    category: "",
    item: "",
    price: "",
    sellPrice: "",
    description: "",
    city: "",
    area: "",
    condition: "",
    image: null,
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setStatus, resetForm }
  ) => {
    if (!canPost) {
      showInfo({
        title: "Post Limit Reached",
        message: `You've reached your posting limit. Please upgrade your subscription to post more items.`,
        confirmText: "Upgrade",
      });
      setSubmitting(false);
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(values.image);

      // Fixed: properly handle rent vs sell data
      const postData = {
        image: imageUrl,
        type: active,
        name: values.item,
        category: values.category,
        city: values.city,
        area: values.area,
        condition: values.condition,
        description: values.description,
      };

      // Add type-specific fields
      if (active === "Rent") {
        postData.pricePerDay = values.price;
      } else if (active === "Sell") {
        postData.sellPrice = values.sellPrice;
      }

      await addPost(postData);

      showInfo({
        title: "Success",
        message: "Post added successfully.",
        confirmText: "Got it",
      });

      await fetchUser(user.id);

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
      setLoading(false);
    }
  };

  const renderPostLimitInfo = () => {
    if (!fetchedUser) return null;

    const limit = getPostLimit(userPlan);
    const remaining =
      limit === -1 ? "∞" : Math.max(0, limit - (fetchedUser.postCount || 0));

    return (
      <View style={styles.limitInfo}>
        <Text style={styles.limitText}>
          Posts: {fetchedUser.postCount || 0} / {limit === -1 ? "∞" : limit}
        </Text>
        <Text style={styles.planText}>
          Plan: {SUBSCRIPTION_LIMITS[userPlan]?.name || "Free Plan"}
        </Text>
        {subscriptionError && (
          <Text style={styles.errorText}>
            ⚠️ Subscription check failed - using free plan
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeScreen>
      <ScrollScreen>
        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema(active)} // Dynamic validation
          onSubmit={handleSubmit}
        >
          {({ values, errors, setFieldValue, setStatus }) => {
            const [availableItems, setAvailableItems] = useState([]);
            const [availableAreas, setAvailableAreas] = useState([]);

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

            // Handle active state changes - clear type-specific fields
            useEffect(() => {
              if (active === "Rent") {
                setFieldValue("sellPrice", "");
              } else if (active === "Sell") {
                setFieldValue("price", "");
              }
            }, [active]);

            return (
              <>
                <AddImageBtn
                  image={values.image}
                  onImageChange={(imageUri) => {
                    setFieldValue("image", imageUri);
                    setStatus(null);
                  }}
                  error={hasBeenSubmitted && errors.image}
                  errorMessage={errors.image}
                  containerStyle={{ marginBottom: 0 }}
                  touchableAreaStyle={{
                    borderRadius: 0,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 20,
                    borderBottomWidth: 0,
                  }}
                />

                <View style={styles.select}>
                  <RequestBtn
                    title={"Rent"}
                    style={[styles.selectBtn, styles.rent]}
                    isActive={active === "Rent"}
                    onPress={() => setActive("Rent")}
                  />
                  <RequestBtn
                    title={"Sell"}
                    style={[styles.selectBtn, styles.sell]}
                    isActive={active === "Sell"}
                    onPress={() => setActive("Sell")}
                    disabled={userPlan === "individual_free"}
                    showLock
                  />
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

                {active === "Rent" && (
                  <FormikDropBox
                    name="price"
                    placeholder="Select Price Per Day"
                    items={price}
                    hasBeenSubmitted={hasBeenSubmitted}
                    userPlan={userPlan}
                  />
                )}

                {active === "Sell" && (
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

                <FormikInput
                  name="description"
                  placeholder="Description (optional)"
                  hasBeenSubmitted={hasBeenSubmitted}
                  isBox={true}
                  height={100}
                />

                <SubmitBtn
                  disabled={fetchedUser?.isBlocked || loading || !canPost}
                  setHasBeenSubmitted={setHasBeenSubmitted}
                />
                {renderPostLimitInfo()}
              </>
            );
          }}
        </Formik>
      </ScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
    limitInfo: {
      padding: 15,
      backgroundColor: theme.post,
      borderRadius: 8,
      marginBottom: 15,
      marginTop: 35,
      width: "90%",
      marginHorizontal: "auto",
    },
    select: {
      flexDirection: "row",
      width: "90%",
      marginHorizontal: "auto",
    },
    selectBtn: {
      width: "50%",
    },
    rent: {
      borderTopRightRadius: 0,
      borderTopLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    sell: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
    limitText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.darker_gray,
    },
    planText: {
      fontSize: 12,
      color: theme.sec_text,
      marginTop: 4,
    },
    errorText: {
      fontSize: 11,
      color: "#ff6b6b",
      marginTop: 4,
    },
  });

export default Post;
