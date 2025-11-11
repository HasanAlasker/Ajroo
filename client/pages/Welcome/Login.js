import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import SafeScreen from "../../components/general/SafeScreen";
import AppForm from "../../components/form/AppForm";
import Logo from "../../components/Logo";
import RequestBtn from "../../components/RequestBtn";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import FormikInput from "../../components/form/FormikInput";
import SubmitBtn from "../../components/form/SubmitBtn";
import SeparatorComp from "../../components/SeparatorComp";
import AppText from "../../config/AppText";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";

import { useUser } from "../../config/UserContext";
import ErrorMessage from "../../components/form/ErrorMessage";
import ErrorBox from "../../components/general/ErrorBox";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
  password: Yup.string().required("Password is required").trim(),
});
const initialValues = {
  password: "",
  email: "",
};

function Login(props) {
  const styles = useThemedStyles(getStyles);
  const navigation = useNavigation();
  const { login, error, isLoading, clearError } = useUser();
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  useEffect(() => {
    // clear errors when component mounts
    clearError();
  }, []);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setHasBeenSubmitted(true);

    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        // Navigation will happen automatically via UserContext state change
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to log in.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <Logo style={styles.logo}></Logo>
        <View style={styles.cont}>
          <AppForm
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <FormikInput
              name={"email"}
              placeholder={"Email"}
              autoCapitalize={"none"}
              icon={"mail"}
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            <FormikInput
              name={"password"}
              placeholder={"Password"}
              autoCapitalize={"none"}
              icon={"lock"}
              isPassword
              hasBeenSubmitted={hasBeenSubmitted}
            ></FormikInput>

            {/* Display context error if exists */}
            {error && <ErrorMessage error={error} />}

            <SubmitBtn
              disabled={isLoading}
              defaultText="Login"
              submittingText="Logging in..."
              setHasBeenSubmitted={setHasBeenSubmitted}
            ></SubmitBtn>

            {/* Add forgot password logic later when clear */}
            <TouchableOpacity>
              <AppText style={styles.forgot}>Forgot password?</AppText>
            </TouchableOpacity>

            <SeparatorComp style={styles.sep}>Or</SeparatorComp>

            <RequestBtn
              style={[styles.btn, styles.border]}
              backColor={"post"}
              color={"purple"}
              title={"Create account"}
              onPress={() => navigation.navigate("Signin")}
            ></RequestBtn>
          </AppForm>
        </View>
      </KeyboardScrollScreen>
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
    sep: {
      marginTop: 0,
    },
    errorText: {
      color: theme.red,
    },
    errorBox: {
      width: "90%",
      margin: "auto",
      marginTop: 50,
    },
  });

export default Login;
