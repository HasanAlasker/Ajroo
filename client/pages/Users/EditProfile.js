import { useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import TopChunkProfile from "../../components/TopChunkProfile";
import FormikInput from "../../components/form/FormikInput";
import SubmitBtn from "../../components/form/SubmitBtn";
import * as Yup from "yup";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";
import { useUser } from "../../config/UserContext";
import ErrorMessage from "../../components/form/ErrorMessage";
import { Formik } from "formik";
import { useAlert } from "../../config/AlertContext";
import useApi from "../../hooks/useApi";
import { getUserById, updateUser } from "../../api/user";
import LoadingCircle from "../../components/general/LoadingCircle";
import ErrorBox from "../../components/general/ErrorBox";
import { uploadImage } from "../../api/upload";
import { useTheme } from "../../config/ThemeContext";
import useThemedStyles from "../../hooks/useThemedStyles";
import Note from "../../components/general/Note";

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
  const [submitting, setSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState();
  const { user, error } = useUser();
  const { showInfo } = useAlert();

  const {
    data: profile,
    request: fetchProfile,
    loading: fetchingProfile,
  } = useApi(getUserById);

  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();

  useEffect(() => {
    fetchProfile(user.id);
  }, []);

  if (!profile || fetchingProfile) {
    return <LoadingCircle />;
  }

  const initialValues = {
    name: profile?.name,
    phone: profile?.phone,
    email: profile?.email,
    image: profile?.image,
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setHasBeenSubmitted(true);

    try {
      setSubmitting(true);

      // Only upload if it's a new local image (not an HTTP URL)
      let imageUrl = values.image;
      let imagePublicId = profile?.imagePublicId;

      // Only process image if it exists and is a new local image
      if (
        values.image &&
        typeof values.image === "string" &&
        !values.image.startsWith("http")
      ) {
        const imageData = await uploadImage(values.image);
        imageUrl = imageData.url;
        imagePublicId = imageData.publicId;
      } else if (!values.image) {
        // If no image provided, keep the existing one or set to null
        imageUrl =
          profile?.image ||
          "https://res.cloudinary.com/dwiw2bprt/image/upload/v1762451339/bf496wsayryocrugd7kn.png";
      }

      // Pass the imageUrl (not values.image) to updateUser
      const result = await updateUser(user.id, {
        ...values,
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      if (result.ok) {
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

        // Update the profile data so it has the new image URL
        await fetchProfile(user.id);
      } else {
        setUpdateError(result.data.message);
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
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ setFieldValue, setStatus }) => (
            <>
              <TopChunkProfile
                userName={profile?.name}
                userImage={profile?.image}
                userRate={profile?.rating || "Unrated"}
                isPicDisabled={profile.gender === "female" ? true : false}
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

              {/* <FormikInput
                name="email"
                placeholder="Email"
                hasBeenSubmitted={hasBeenSubmitted}
                penOn={true}
                keyboardType="email-address"
                autoCapitalize="none"
              /> */}

              <SubmitBtn
                defaultText="Save"
                submittingText="Saving..."
                disabled={submitting}
                setHasBeenSubmitted={setHasBeenSubmitted}
              />

              <Note
                title={"Note"}
                text={
                  "Your phone number is used so interested users can contact you about your items."
                }
                style={styles.note}
              />

              {updateError && (
                <ErrorBox
                  style={styles.error}
                  firstTitle={"Update Failed"}
                  fistDetail={updateError}
                />
              )}

              {/* Display context error if exists */}
              {error && <ErrorMessage error={error} />}
            </>
          )}
        </Formik>
      </KeyboardScrollScreen>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    error: {
      width: "90%",
      margin: "auto",
    },
    container: {
      width: "100%",
    },
    note: {
      marginTop: 40,
    },
  });

export default EditProfile;
