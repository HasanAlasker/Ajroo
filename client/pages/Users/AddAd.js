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
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import { createAd } from "../../api/ads";
import { uploadImage } from "../../api/upload";
import AddImageBtn from "../../components/AddImageBtn";
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

function AdAdd() {
  const { showInfo } = useAlert();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const styles = useThemedStyles(getStyles);

  const initialValues = {
    image: null,
    link: "",
    displayDuration: "",
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    setLoading(true);
    try {
      const imageData = await uploadImage(values.image);

      const AdData = {
        image: imageData.url,
        imagePublicId: imageData.publicId,
        link: values.link,
        displayDuration: parseInt(values.displayDuration),
      };
      console.log("Data: ", AdData);
      
      const res = await createAd(AdData);

      console.log("Res: ", res);

      showInfo({
        title: "Thank you!",
        message:
          "Your ad has been submitted and will be reviewed by our team within 24-48 hours.",
        confirmText: "OK",
      });

      resetForm();
      setHasBeenSubmitted(false);
    } catch (err) {
      console.error("Ad error:", err.response?.data || err.message);
      showInfo({
        title: "Error",
        message:
          err.response?.data?.message ||
          "Failed to submit your ad. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to submit your ad. Please try again.",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <AppText style={styles.text}>Submit Your Business Ad</AppText>

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
                height={100}
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

              <SubmitBtn
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
                text={loading ? "Submitting..." : "Submit Ad Request"}
              />

              <Note
                title={"Note"}
                text={
                  "After submitting, our team will review your ad and contact you to finalize pricing and display details."
                }
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
  });

export default AdAdd;
