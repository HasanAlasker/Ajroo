import { useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";
import Navbar from "../../components/general/Navbar";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "../../components/form/FormikInput";
import SubmitBtn from "../../components/form/SubmitBtn";
import { useAlert } from "../../config/AlertContext";
import { useUser } from "../../config/UserContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import { editAd } from "../../api/ads";
import { uploadImage } from "../../api/upload";
import AddImageBtn from "../../components/AddImageBtn";
import { useRoute, useNavigation } from "@react-navigation/native";
import Note from "../../components/general/Note";

const validationSchema = Yup.object().shape({
  image: Yup.mixed()
    .required("Please add an image")
    .test("file-type", "Please select a valid image file", (value) => {
      if (!value) return false;
      return value.uri || typeof value === "string";
    }),
  link: Yup.string()
    .url("Please enter a valid URL (e.g., https://example.com)")
    .required("Please enter your website or social media link")
    .matches(/^https?:\/\/.+/, "Link must start with http:// or https://"),
  displayDuration: Yup.number()
    .typeError("Display duration must be a number")
    .integer("Display duration must be a whole number")
    .min(1, "Minimum display duration is 1 day")
    .max(365, "Maximum display duration is 365 days")
    .required("Please enter the display duration in days"),
});

function EditAd() {
  const { showInfo } = useAlert();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const styles = useThemedStyles(getStyles);
  const route = useRoute();
  const navigation = useNavigation();

  const { adId, image, link, displayDuration } = route.params || {};

  // Handle missing params
  if (!adId) {
    showInfo({
      title: "Error",
      message: "Ad information is missing. Please try again.",
      confirmText: "OK",
      onConfirm: () => navigation.goBack(),
    });
    return null;
  }

  const initialValues = {
    image: image || null,
    link: link || "",
    displayDuration: displayDuration ? displayDuration.toString() : "",
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setLoading(true);
    try {
      let AdData = {
        link: values.link,
        displayDuration: parseInt(values.displayDuration),
      };

      // Only upload new image if it was changed
      if (values.image && values.image !== image) {
        const imageData = await uploadImage(values.image);
        AdData.image = imageData.url;
        AdData.imagePublicId = imageData.publicId;
      }

      await editAd(adId, AdData);

      showInfo({
        title: "Success!",
        message: "Your ad has been updated successfully.",
        confirmText: "OK",
        onConfirm: () => navigation.goBack(),
      });
    } catch (err) {
      console.error("Edit ad error:", err.response?.data || err.message);
      showInfo({
        title: "Update Failed",
        message:
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to update your ad. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to update your ad. Please try again.",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, setFieldValue, setStatus }) => (
            <>
              <AddImageBtn
                image={values.image}
                onImageChange={(imageUri) => {
                  setFieldValue("image", imageUri);
                  setStatus(null);
                }}
                error={hasBeenSubmitted && errors.image}
                errorMessage={errors.image}
              />

              <FormikInput
                name="link"
                placeholder="Your website or social media link (e.g., https://example.com)"
                hasBeenSubmitted={hasBeenSubmitted}
                isBox
                height={55}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <FormikInput
                name="displayDuration"
                placeholder="Display duration (in days)"
                hasBeenSubmitted={hasBeenSubmitted}
                keyboardType="numeric"
              />

              <Note
                title={"Note"}
                text={
                  "Changing the display duration will recalculate the expiration date from today."
                }
              />

              <SubmitBtn
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
                defaultText="Update Ad"
                submittingText="Updating..."
              />
            </>
          )}
        </Formik>
      </KeyboardScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {},
    text: {
      fontSize: 30,
      fontWeight: "normal",
      width: "90%",
      marginHorizontal: "auto",
      marginTop: 40,
      marginBottom: 10,
      color: theme.main_text,
      textAlign: "center",
    },
    subText: {
      fontSize: 16,
      width: "90%",
      marginHorizontal: "auto",
      marginBottom: 30,
      color: theme.darker_gray,
      textAlign: "center",
    },
    noteText: {
      fontSize: 14,
      width: "90%",
      marginHorizontal: "auto",
      marginVertical: 15,
      color: theme.darker_gray,
      textAlign: "center",
      lineHeight: 20,
    },
  });

export default EditAd;
