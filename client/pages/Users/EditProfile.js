import { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopChunkProfile from "../../components/TopChunkProfile";
import FormikInput from "../../components/form/FormikInput";
import AppForm from "../../components/form/AppForm";
import SubmitBtn from "../../components/form/SubmitBtn";
import * as Yup from "yup";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";
import { useUser } from "../../config/UserContext";
import ErrorMessage from "../../components/form/ErrorMessage";
import { Formik } from "formik";
import { useAlert } from "../../config/AlertContext";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters long")
    .max(25, "Name must not exceed 25 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim()
    .required("Name is required"),

  phone: Yup.string()
    .required("Phone is required")
    .test(
      "phone-validation",
      "Please enter a valid phone number",
      function (value) {
        if (!value || value.trim() === "") return true;
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        const isValidFormat = phoneRegex.test(value);
        const isValidLength = value.length >= 10 && value.length <= 15;
        return isValidFormat && isValidLength;
      }
    ),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
});

function EditProfile({ rating, sep }) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateProfile, user, error } = useUser();
  const { showInfo } = useAlert();

  const initialValues = {
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    image: user?.avatar || "null",
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setHasBeenSubmitted(true);

    try {
      setLoading(true)
      const result = await updateProfile(user.id, values);

      if (result.success) {
        setStatus({
          type: "success",
          message: "Profile updated successfully!",
        });

        // Optional: Show error alert
        showInfo({
          title: "Success",
          message: "Profile updated successfully",
          confirmText: "Close",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      showInfo({
        title: "Error",
        message: "Something went wrong",
        confirmText: "Close",
      });
      setStatus({
        type: "error",
        message: error.message || "An unexpected error occurred.",
      });

      Alert.alert("Error", error.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
    setLoading(false)
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, setStatus }) => (
            <>
              <TopChunkProfile
                userName={user?.name}
                userImage={user?.avatar}
                userRate={rating || user?.rating || "Unrated"}
                isPicDisabled={false}
                sep={sep || "Edit Info"}
                onImageChange={(imageUri) => {
                  setFieldValue("image", imageUri);
                  setStatus(null);
                }}
              />

              <FormikInput
                name="name"
                placeholder="Name"
                hasBeenSubmitted={hasBeenSubmitted}
                penOn={true}
                autoCapitalize="words"
              />

              <FormikInput
                name="phone"
                placeholder="Phone"
                hasBeenSubmitted={hasBeenSubmitted}
                penOn={true}
                keyboardType="phone-pad"
              />

              <FormikInput
                name="email"
                placeholder="Email"
                hasBeenSubmitted={hasBeenSubmitted}
                penOn={true}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <SubmitBtn
                defaultText="Save"
                submittingText="Saving..."
                disabled={loading}
                setHasBeenSubmitted={setHasBeenSubmitted}
              />

              {/* Display context error if exists */}
              {error && <ErrorMessage error={error} />}
            </>
          )}
        </Formik>
      </KeyboardScrollScreen>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default EditProfile;
