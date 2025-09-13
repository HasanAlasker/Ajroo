import { useState } from "react";
import { StyleSheet } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopChunkProfile from "../../components/TopChunkProfile";
import FormikInput from "../../components/form/FormikInput";
import AppForm from "../../components/form/AppForm";
import SubmitBtn from "../../components/SubmitBtn";

import * as Yup from "yup";
import KeyboardScrollScreen from "../../components/KeyboardScrollScreen";
import { useUser } from "../../config/UserContext";
import { Formik } from "formik";


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
    .required()
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

function EditProfile({ userName, image, number, email, rating, sep }) {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const { updateProfile, user } = useUser();

  const initialValues = {
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    image: user.avatar || null,
  };

  const handleSubmit = (values, { setSubmitting, setStatus }) => {
    console.log("Profile form values:", values);
    setHasBeenSubmitted(true);
    updateProfile(values);
    

    setTimeout(() => {
      try {
        setStatus({
          type: "success",
          message: "Profile updated successfully!",
        });
      } catch (error) {
        setStatus({ type: "error", message: "Failed to update profile." });
      } finally {
        setSubmitting(false);
      }
    }, 1500);
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
                userName={user.name}
                userRate={rating || "Unrated"}
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
                setHasBeenSubmitted={setHasBeenSubmitted}
              ></SubmitBtn>
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
