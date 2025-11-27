import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
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
import { verifyOtp, resendOtp } from "../../api/auth";
import { loginUser } from "../../api/user";

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
  const { verifyOtpAndLogin, error, clearError } = useUser();
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // OTP State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {login} = useUser()

  // Refs for OTP inputs
  const otpInputs = useRef([]);

  useEffect(() => {
    clearError();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setHasBeenSubmitted(true);
    setIsLoggingIn(true);
    setLoginError("");

    try {
      // Call login API directly (not through context yet)
      const response = await loginUser(values);

      if (response && response.requiresVerification) {
        // User needs to verify OTP
        setLoginEmail(values.email);
        setShowOtpInput(true);
        setCountdown(60);
      } else if (response && response._id) {
        // User is verified, use context to complete login
        // The response already has the token in headers, so just verify with context
        const result = await await login(values.email, values.password);
        
        if (!result.success) {
          setLoginError(result.error || "Login failed");
        }
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.message) {
        if (error.message.includes("Invalid email or password")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("email address")) {
          errorMessage = "Please enter a valid email address";
        } else {
          errorMessage = error.message;
        }
      }

      setLoginError(errorMessage);
    } finally {
      setIsLoggingIn(false);
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index, key) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setOtpError("Please enter complete OTP code");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      // Use the UserContext function to verify and login
      const result = await verifyOtpAndLogin(loginEmail, otpCode);

      if (result.success) {
        // Navigation will happen automatically via UserContext state change
      } else {
        setOtpError(result.error || "Invalid OTP code");
        setOtp(["", "", "", "", "", ""]);
        otpInputs.current[0]?.focus();
      }
    } catch (error) {
      let errorMessage = "Failed to verify OTP";

      if (error.message) {
        if (error.message.includes("Invalid OTP")) {
          errorMessage = "Invalid OTP code";
        } else if (error.message.includes("expired")) {
          errorMessage = "OTP has expired. Please request a new one";
        } else {
          errorMessage = error.message;
        }
      }

      setOtpError(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      otpInputs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setOtpError("");

    try {
      const result = await resendOtp({ email: loginEmail });

      if (result.success) {
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        otpInputs.current[0]?.focus();
      } else {
        setOtpError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      setOtpError(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardScrollScreen>
        <Logo style={styles.logo}></Logo>
        <View style={styles.cont}>
          {!showOtpInput ? (
            // Login Form
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
              />

              <FormikInput
                name={"password"}
                placeholder={"Password"}
                autoCapitalize={"none"}
                icon={"lock"}
                isPassword
                hasBeenSubmitted={hasBeenSubmitted}
              />

              {loginError && (
                <ErrorMessage error={loginError} />
              )}
              {error && <ErrorMessage error={error} />}

              <SubmitBtn
                disabled={isLoggingIn}
                defaultText="Login"
                submittingText="Logging in..."
                setHasBeenSubmitted={setHasBeenSubmitted}
              />

              <TouchableOpacity onPress={() => setForgot(!forgot)}>
                <AppText style={styles.forgot}>Forgot password?</AppText>
              </TouchableOpacity>

              <SeparatorComp style={styles.sep}>Or</SeparatorComp>

              <RequestBtn
                style={[styles.btn, styles.border]}
                backColor={"post"}
                color={"purple"}
                title={"Create account"}
                onPress={() => navigation.navigate("Signin")}
              />

              {forgot && (
                <ErrorBox
                  color={"orange"}
                  style={styles.errorBox}
                  firstTitle={"Forgot Password"}
                  fistDetail={"Contact us at ajroo.contact@gmail.com"}
                />
              )}
            </AppForm>
          ) : (
            // OTP Verification Section
            <View style={styles.otpContainer}>
              <AppText style={styles.otpTitle}>Verify Your Email</AppText>
              <AppText style={styles.otpSubtitle}>
                Your account is not verified. {"\n"}
                We've sent a 6-digit code to {"\n"}
                {loginEmail}
              </AppText>

              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleOtpKeyPress(index, key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {otpError && (
                <ErrorMessage error={otpError} />
              )}

              <RequestBtn
                style={styles.verifyBtn}
                backColor={"purple"}
                color={"always_white"}
                title={isVerifying ? "Verifying..." : "Verify OTP"}
                onPress={handleVerifyOtp}
                disabled={isVerifying || otp.join("").length !== 6}
              />

              <View style={styles.resendContainer}>
                <AppText style={styles.resendText}>
                  Didn't receive the code?{" "}
                </AppText>
                <RequestBtn
                  style={styles.resendBtn}
                  backColor={"background"}
                  color={"purple"}
                  title={
                    countdown > 0
                      ? `Resend in ${countdown}s`
                      : isResending
                      ? "Sending..."
                      : "Resend OTP"
                  }
                  onPress={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                />
              </View>

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => {
                  setShowOtpInput(false);
                  setOtp(["", "", "", "", "", ""]);
                  setOtpError("");
                }}
              >
                <AppText style={styles.backToLoginText}>
                  Back to Login
                </AppText>
              </TouchableOpacity>
            </View>
          )}
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
    cont: {
      flex: 1,
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
      width:'90%',
      marginHorizontal:'auto',
      fontWeight:'bold',
      color: theme.red,
      marginVertical: 10,
    },
    errorBox: {
      width: "90%",
      margin: "auto",
      marginTop: 50,
      backgroundColor: theme.orange + 30,
    },
    otpContainer: {
      width: "90%",
      marginHorizontal: "auto",
      alignItems: "center",
      paddingVertical: 20,
    },
    otpTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.purple,
    },
    otpSubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 30,
      color: theme.main_text,
    },
    otpInputContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      marginBottom: 20,
    },
    otpInput: {
      flex: 1,
      height: 55,
      borderWidth: 2,
      borderColor: theme.purple,
      borderRadius: 10,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      backgroundColor: theme.post,
      color: theme.main_text,
    },
    verifyBtn: {
      width: "100%",
      borderRadius: 18,
      marginTop: 10,
    },
    resendContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 25,
      width: "100%",
      justifyContent: "space-around",
    },
    resendText: {
      fontSize: 16,
      color: theme.main_text,
    },
    resendBtn: {
      padding: 0,
      width: "auto",
    },
    backToLogin: {
      marginTop: 20,
    },
    backToLoginText: {
      color: theme.purple,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default Login;
