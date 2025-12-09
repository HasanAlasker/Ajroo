import { View, StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import ScrollScreen from "../../components/general/ScrollScreen";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikDropBox from "../../components/form/FormikDropBox";
import FormikInput from "../../components/form/FormikInput";
import SubmitBtn from "../../components/form/SubmitBtn";
import { active, colors, yesNo } from "../../constants/DropOptions";
import { useState } from "react";
import AppText from "../../config/AppText";
import useThemedStyles from "../../hooks/useThemedStyles";
import useApi from "../../hooks/useApi";
import { createNews } from "../../api/news";
import { useAlert } from "../../config/AlertContext";
import { useNavigation } from "@react-navigation/native";

const validationSchema = Yup.object().shape({
  icon: Yup.string().optional(),

  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Please enter a title"),

  description: Yup.string()
    .min(10, "Please describe your suggestion in more detail")
    .max(5000, "Maximum 5000 characters")
    .required("Please enter a description"),

  backGroundColor: Yup.string().required("Please choose a background color"),

  borderColor: Yup.string().required("Please choose a border color"),

  textColor: Yup.string().required("Please choose a text color"),

  isActive: Yup.boolean()
    .required("Please specify if the suggestion is active")
    .typeError("Please select whether the suggestion is active"),

  displayDuration: Yup.number()
    .typeError("Display duration must be a number")
    .integer("Display duration must be an integer")
    .required("Please enter the display duration"),
});

const initialValues = {
  icon: "", // optional
  title: "",
  description: "",
  backGroundColor: "",
  borderColor: "",
  textColor: "",
  isActive: "",
  displayDuration: "", // int number
};

function AddNews(props) {
  const styles = useThemedStyles(getStyles);

  const [loading, setLoading] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const { showInfo } = useAlert();
  const navigation = useNavigation()

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    setLoading(true);
    try {
      const newsData = {
        icon: values.icon || "",
        title: values.title,
        description: values.description,
        backGroundColor: values.backGroundColor,
        borderColor: values.borderColor,
        textColor: values.textColor,
        isActive: values.isActive,
        displayDuration: values.displayDuration,
      };

      await createNews(newsData);

      showInfo({
        title: "Done!",
        message: "News added successfully to database",
        confirmText: "OK",
      });

      resetForm();
      setHasBeenSubmitted(false);
      navigation.navigate('NewsLog')
    } catch (err) {
      console.error("News error:", err.response?.data || err.message);
      showInfo({
        title: "Error",
        message:
          err.response?.data?.message ||
          "Failed to submit your news. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to submit your news. Please try again.",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <ScrollScreen>
        <AppText style={styles.text}>Share Ajroo News With Users!</AppText>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <>
              <FormikInput
                name="title"
                placeholder="Short title for news"
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name="description"
                placeholder="Description for news"
                isBox={true}
                multiline
                height={140}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikDropBox
                name="backGroundColor"
                placeholder="Select background color"
                items={colors}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikDropBox
                name="borderColor"
                placeholder="Select border color"
                items={colors}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikDropBox
                name="textColor"
                placeholder="Select text color"
                items={colors}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikDropBox
                name="isActive"
                placeholder="Should show in Home"
                items={yesNo}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name="displayDuration"
                placeholder="Display Duration (Days)"
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name="icon"
                placeholder="Icon before title (optional)"
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <SubmitBtn
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
                defaultText="Publish News"
                submittingText="Publishing..."
              />
            </>
          )}
        </Formik>
      </ScrollScreen>
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
      marginVertical: 40,
      color: theme.main_text,
      textAlign: "center",
    },
  });

export default AddNews;
