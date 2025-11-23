import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import FormikDropBox from "../../components/form/FormikDropBox";
import { gender } from "../../constants/DropOptions";
import KeyboardScrollScreen from "../../components/general/KeyboardScrollScreen";
import AppText from "../../config/AppText";
import { verifyOtp, resendOtp } from "../../api/auth";
import { registerUser } from "../../api/user";
import { useUser } from "../../config/UserContext";

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
        const weakPatterns = [
          /(.)\1{2,}/,
          /123|234|345|456|567|678|789|890/,
          /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
          /qwer|asdf|zxcv|1234|admin|pass/i,
        ];
        return !weakPatterns.some((pattern) => pattern.test(value));
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
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Get verifyOtpAndLogin from UserContext
  const { verifyOtpAndLogin } = useUser();

  // OTP State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Refs for OTP inputs
  const otpInputs = useRef([]);

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
    setIsRegistering(true);
    setRegisterError("");

    const { confirmPassword, ...userData } = values;

    try {
      // Call register API directly (not through context)
      const response = await registerUser(userData);

      if (response && response.email) {
        // Registration successful, show OTP input
        setRegisteredEmail(values.email);
        setShowOtpInput(true);
        setCountdown(60);
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    } catch (error) {
      let errorMessage = "Registration failed";

      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered";
        } else if (error.message.includes("email address")) {
          errorMessage = "Please enter a valid email address";
        } else {
          errorMessage = error.message;
        }
      }

      setRegisterError(errorMessage);
    } finally {
      setIsRegistering(false);
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index, key) => {
    // Handle backspace
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
      // Use the UserContext function instead of handling locally
      const result = await verifyOtpAndLogin(registeredEmail, otpCode);

      if (result.success) {
        // Navigation will happen automatically via UserContext state change
        // The AppNavigator will detect isAuthenticated: true and navigate
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
      const result = await resendOtp({ email: registeredEmail });

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
            // Registration Form
            <AppForm
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <FormikInput
                name={"name"}
                placeholder={"Name"}
                autoCapitalize={"none"}
                icon={"user"}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name={"email"}
                placeholder={"Email"}
                autoCapitalize={"none"}
                icon={"mail"}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name={"phone"}
                placeholder={"Phone"}
                autoCapitalize={"none"}
                icon={"phone"}
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikDropBox
                name={"gender"}
                placeholder={"Gender"}
                hasBeenSubmitted={hasBeenSubmitted}
                items={gender}
                icon={"divide"}
              />

              <FormikInput
                name={"password"}
                placeholder={"Password"}
                autoCapitalize={"none"}
                icon={"lock"}
                isPassword
                hasBeenSubmitted={hasBeenSubmitted}
              />

              <FormikInput
                name={"confirmPassword"}
                placeholder={"Confirm password"}
                autoCapitalize={"none"}
                icon={"lock"}
                isPassword
                hasBeenSubmitted={hasBeenSubmitted}
              />

              {registerError && (
                <AppText style={styles.errorText}>{registerError}</AppText>
              )}

              <SubmitBtn
                defaultText="Register"
                submittingText="Registering..."
                disabled={isRegistering}
                setHasBeenSubmitted={setHasBeenSubmitted}
              />

              <SeparatorComp style={styles.sep}>Or</SeparatorComp>

              <RequestBtn
                style={[styles.btn, styles.border]}
                backColor={"post"}
                color={"purple"}
                title={"I have an account"}
                onPress={() => navigation.navigate("Login")}
              />
            </AppForm>
          ) : (
            // OTP Verification Section
            <View style={styles.otpContainer}>
              <AppText style={styles.otpTitle}>Verify Your Email</AppText>
              <AppText style={styles.otpSubtitle}>
                We've sent a 6-digit code to {"\n"}
                {registeredEmail}
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
                <AppText style={styles.errorText}>{otpError}</AppText>
              )}

              <RequestBtn
                style={styles.verifyBtn}
                backColor={"purple"}
                color={"post"}
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
    border: {
      borderColor: theme.purple,
    },
    errorText: {
      width:'90%',
      marginHorizontal:'auto',
      fontWeight:'bold',
      color: theme.red,
      marginVertical: 10,
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
      fontSize: 18,
      flex: 1,
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
      width: "auto ",
    },
  });

export default Signin;