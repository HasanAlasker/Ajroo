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
import { createNews, editNews } from "../../api/news";
import { useAlert } from "../../config/AlertContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";

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
});

function EditNews(props) {
  const styles = useThemedStyles(getStyles);

  const [loading, setLoading] = useState(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const { showInfo } = useAlert();

  const route = useRoute();
  const navigation = useNavigation();
  const {
    id,
    backGroundColor,
    textColor,
    borderColor,
    title,
    description,
    icon,
  } = route.params;

  const initialValues = {
    icon: icon || "", // optional
    title: title,
    description: description,
    backGroundColor: backGroundColor,
    borderColor: borderColor,
    textColor: textColor,
  };
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
      };

      await editNews(id, newsData);

      showInfo({
        title: "Done!",
        message: "News updated successfully",
        confirmText: "OK",
        onConfirm: () => navigation.navigate("NewsLog"),
      });

      resetForm();
      setHasBeenSubmitted(false);
    } catch (err) {
      console.error("News error:", err.response?.data || err.message);
      showInfo({
        title: "Error",
        message:
          err.response?.data?.message ||
          "Failed to update your news. Please try again.",
        confirmText: "OK",
      });
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to update your news. Please try again.",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <AppText style={styles.text}>Edit News</AppText>
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

              <FormikInput
                name="icon"
                placeholder="Icon before title (optional)"
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <SubmitBtn
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
                defaultText="Update News"
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
      marginVertical: 40,
      color: theme.main_text,
      textAlign: "center",
    },
  });

export default EditNews;
