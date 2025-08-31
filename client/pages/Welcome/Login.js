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

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .trim(),
});
const initialValues = {
  password: "",
  email: "",
};

function Login(props) {
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

    navigation.navigate('Home') // remove later when you are usin userContext and database

  };
  return (
    <SafeScreen>
      <ScrollScreen>
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
              autoCapitalize={false}
              icon={"mail"}
              hasBeenSubmitted={handleSubmit}
            ></FormikInput>

            <FormikInput
              name={"password"}
              placeholder={"Password"}
              autoCapitalize={false}
              icon={"lock"}
              secureTextEntry={true}
              hasBeenSubmitted={handleSubmit}
            ></FormikInput>

            <SubmitBtn
              defaultText="Login"
              submittingText="Logging in..."
              setHasBeenSubmitted={setHasBeenSubmitted}
            ></SubmitBtn>
            <TouchableOpacity>
                <AppText style={styles.forgot}>Forgot password?</AppText>
            </TouchableOpacity>
            <SeparatorComp style={styles.sep}>Or</SeparatorComp>

            <RequestBtn
            style={[styles.btn, styles.border]}
            backColor={"post"}
            color={"purple"}
            title={"Create account"}
            onPress={()=>navigation.navigate('Signin')}
          ></RequestBtn>

          </AppForm>
        </View>
      </ScrollScreen>
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
      marginTop:10
    },
    border: { borderColor: theme.purple },
    forgot:{
        color:theme.purple,
        fontSize:16,
        fontWeight:'bold',
        textAlign:'center',
        marginVertical:18
    },
    sep:{
        marginTop:0
    }
  });

export default Login;
