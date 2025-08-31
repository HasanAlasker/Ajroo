import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import ScrollScreen from "../../components/ScrollScreen";
import AppForm from "../../components/AppForm";
import Logo from "../../components/Logo";
import RequestBtn from "../../components/RequestBtn";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import FormikInput from "../../components/FormikInput";
import FormBtn from "../../components/FormBtn";
import SubmitBtn from "../../components/SubmitBtn";
import SeparatorComp from "../../components/SeparatorComp";
import AppText from "../../config/AppText";
import FormikDropBox from "../../components/FormikDropBox";
import { gender } from "../../constants/DropOptions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .matches(
      /^(?=.*[a-z])/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /^(?=.*[A-Z])/,
      "Password must contain at least one uppercase letter"
    )
    .matches(/^(?=.*\d)/, "Password must contain at least one number")
    .matches(
      /^(?=.*[@$!%*?&])/,
      "Password must contain at least one special character (@$!%*?&)"
    )
    .matches(/^[A-Za-z\d@$!%*?&]+$/, "Password contains invalid characters")
    .test(
      "no-common-patterns",
      "Password cannot contain common patterns",
      function (value) {
        if (!value) return true;

        // Check for common weak patterns
        const weakPatterns = [
          /(.)\1{2,}/, // 3+ repeated characters (aaa, 111)
          /123|234|345|456|567|678|789|890/, // Sequential numbers
          /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
          /qwer|asdf|zxcv|1234|admin|pass/i, // Common keyboard patterns and words
        ];

        return !weakPatterns.some((pattern) => pattern.test(value));
      }
    )
    .test(
      "no-personal-info",
      "Password should not contain personal information",
      function (value) {
        if (!value) return true;

        // Get other form values to check against
        const { name, email } = this.parent;

        if (
          name &&
          value.toLowerCase().includes(name.toLowerCase().split(" ")[0])
        ) {
          return false;
        }

        if (
          email &&
          value.toLowerCase().includes(email.toLowerCase().split("@")[0])
        ) {
          return false;
        }

        return true;
      }
    )
    .trim(),

  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),

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
  gender: Yup.string().required("Gender is required"),
});
const initialValues = {
  password: "",
  email: "",
  phone: "",
  name: "",
  gender: "",
  confirmPassword: "",
};

function Signin(props) {
  const styles = useThemedStyles(getStyles);
  const navigation = useNavigation();

  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const handleSubmit = (values, { setSubmitting, setStatus }) => {
    console.log("Login values:", values);
    setHasBeenSubmitted(true);

    setTimeout(() => {
      try {
        setStatus({
          type: "success",
          message: "Logged in successfully!",
        });
      } catch (error) {
        setStatus({ type: "error", message: "Failed to Log in." });
      } finally {
        setSubmitting(false);
      }
    }, 1500);

    navigation.navigate("Home"); // remove later when you are usin userContext and database
  };
  return (
    <SafeScreen>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom:40 }}
        enableOnAndroid={true}
        extraScrollHeight={60}
      >
        <Logo style={styles.logo}></Logo>
        <View style={styles.cont}>
          <AppForm
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <FormikInput
              name={"name"}
              placeholder={"Name"}
              autoCapitalize={false}
              icon={"user"}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <FormikInput
              name={"email"}
              placeholder={"Email"}
              autoCapitalize={false}
              icon={"mail"}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <FormikInput
              name={"phone"}
              placeholder={"Phone"}
              autoCapitalize={false}
              icon={"phone"}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <FormikDropBox
              name={"gender"}
              placeholder={"Gender"}
              hasBeenSubmitted={hasBeenSubmitted}
              items={gender}
              icon={"divide"}
            ></FormikDropBox>

            <FormikInput
              name={"password"}
              placeholder={"Password"}
              autoCapitalize={false}
              icon={"lock"}
              secureTextEntry={true}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <FormikInput
              name={"confirmPassword"}
              placeholder={"Confirm password"}
              autoCapitalize={false}
              icon={"lock"}
              secureTextEntry={true}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <SubmitBtn
              defaultText="Register"
              submittingText="Registering..."
              setHasBeenSubmitted={setHasBeenSubmitted}
            ></SubmitBtn>

            <SeparatorComp style={styles.sep}>Or</SeparatorComp>

            <RequestBtn
              style={[styles.btn, styles.border]}
              backColor={"post"}
              color={"purple"}
              title={"I have an account"}
              onPress={() => navigation.navigate("Login")}
            ></RequestBtn>
          </AppForm>
        </View>
      </KeyboardAwareScrollView>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    logo: {
      marginTop: 20,
    },
    btn: {
      width: "90%",
      marginHorizontal: "auto",
      borderRadius: 18,
      marginTop: 10,
    },
    border: { borderColor: theme.purple },
    forgot: {
      color: theme.purple,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 18,
    },
  });

export default Signin;
