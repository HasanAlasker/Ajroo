import { useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";
import Navbar from "../../components/general/Navbar";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "../../components/form/FormikInput";
import FormikDropBox from "../../components/form/FormikDropBox";
import SubmitBtn from "../../components/form/SubmitBtn";
import { useAlert } from "../../config/AlertContext";
// import { addSuggestion } from "../../api/suggestions"; // you'll create this endpoint
import { useUser } from "../../config/UserContext";
import { makeSuggestion } from "../../api/suggestion";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";

// Suggestion categories
const suggestionTypes = [
  { label: "Feature Request", value: "feature" },
  { label: "Bug Report", value: "bug" },
  { label: "Improvement", value: "improvement" },
  { label: "Question", value: "question" },
  { label: "Other", value: "other" },
];

// Validation schema
const validationSchema = Yup.object().shape({
  type: Yup.string().required("Please select a suggestion type"),
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Please enter a title"),
  details: Yup.string()
    .min(10, "Please describe your suggestion in more detail")
    .required("Please enter a description"),
});

function Suggestions() {
  const { showInfo } = useAlert();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const styles = useThemedStyles(getStyles)

  const initialValues = {
    type: "",
    title: "",
    details: "",
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    setLoading(true);
    try {
      const suggestionData = {
        userId: user?._id,
        type: values.type,
        title: values.title,
        details: values.details,
      };

      await makeSuggestion(suggestionData);

      showInfo({
        title: "Thank you!",
        message: "Your suggestion has been submitted successfully.",
        confirmText: "OK",
      });

      resetForm();
      setHasBeenSubmitted(false);
    } catch (err) {
      console.error("Suggestion error:", err.response?.data || err.message);
      showInfo({
        title: "Error",
        message:
          err.response?.data?.message ||
          "Failed to submit your suggestion. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to submit your suggestion. Please try again.",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <AppText style={styles.text}>
          Share your suggestions and help shape the platform!
        </AppText>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <>
              <FormikDropBox
                name="type"
                placeholder="Select suggestion type"
                items={suggestionTypes}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name="title"
                placeholder="Short title for your suggestion"
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name="details"
                placeholder="Describe your idea or issue in detail"
                isBox={true}
                multiline
                height={140}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <SubmitBtn
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
                text="Submit Suggestion"
              />
            </>
          )}
        </Formik>
      </KeyboardScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {},
  text: {
    fontSize: 30,
    fontWeight: "normal",
    width: "90%",
    marginHorizontal: "auto",
    marginVertical: 40,
    color: theme.main_text,
    textAlign:'center'
  },
});

export default Suggestions;
