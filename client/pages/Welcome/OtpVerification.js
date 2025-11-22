import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import SafeScreen from "../../components/general/SafeScreen";
import Logo from "../../components/Logo";
import AppText from "../../config/AppText";
import RequestBtn from "../../components/RequestBtn";
import useThemedStyles from "../../hooks/useThemedStyles";
import { sendOtp, verifyOtp, resendOtp } from "../../api/auth";
import FormikInput from "../../components/form/FormikInput";
import AppForm from "../../components/form/AppForm";
import SubmitBtn from "../../components/form/SubmitBtn";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers"),
});

function OtpVerification() {
  const styles = useThemedStyles(getStyles);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { email, userData } = route.params; // Get email and userData from navigation params
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOtp = async (values, { setSubmitting, setStatus }) => {
    setHasBeenSubmitted(true);
    setError(null);

    try {
      const response = await verifyOtp({ 
        email, 
        otp: values.otp 
      });

      if (response.success) {
        // Get token from response (backend returns it in verify-otp response)
        const token = response.headers?.['x-auth-token'];
        
        if (!token) {
          console.error("No token received from backend");
          setError("Verification successful but authentication failed. Please login.");
          setTimeout(() => {
            navigation.navigate("Login");
          }, 2000);
          return;
        }
        
        // Store user data and token
        const user = {
          id: response._id,
          name: response.name,
          email: response.email,
          phone: response.phone,
          gender: response.gender,
          avatar: response.image || null,
          isRated: response.isRated || false,
          rating: response.rating || null,
          ratingCount: response.ratingCount || 0,
          role: response.role || "user",
          revenueCatUserId: response.revenueCatUserId || null,
          isBlocked: response.isBlocked || false,
        };

        await AsyncStorage.setItem("@ajroo_user", JSON.stringify(user));
        await AsyncStorage.setItem("@ajroo_token", token);

        // Navigate to authenticated area - reset navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setStatus({
          type: "error",
          message: response.message || "Invalid OTP",
        });
        setError(response.message || "Invalid OTP");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to verify OTP";
      setStatus({
        type: "error",
        message: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await resendOtp({ email });
      
      if (response.success) {
        setTimer(60);
        setCanResend(false);
        // Optionally show success message
      } else {
        setError(response.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <Logo style={styles.logo} />
        
        <View style={styles.content}>
          <AppText style={styles.title}>Verify Your Email</AppText>
          <AppText style={styles.subtitle}>
            Enter the 6-digit code sent to
          </AppText>
          <AppText style={styles.email}>{email}</AppText>

          <AppForm
            initialValues={{ otp: "" }}
            validationSchema={validationSchema}
            onSubmit={handleVerifyOtp}
          >
            <FormikInput
              name="otp"
              placeholder="000000"
              icon="lock"
              keyboardType="number-pad"
              maxLength={6}
              hasBeenSubmitted={hasBeenSubmitted}
              autoFocus
            />

            {error && <AppText style={styles.errorText}>{error}</AppText>}

            <SubmitBtn
              defaultText="Verify OTP"
              submittingText="Verifying..."
              setHasBeenSubmitted={setHasBeenSubmitted}
            />
          </AppForm>

          <View style={styles.resendContainer}>
            {!canResend ? (
              <AppText style={styles.timerText}>
                Resend OTP in {timer}s
              </AppText>
            ) : (
              <RequestBtn
                title={isResending ? "Sending..." : "Resend OTP"}
                onPress={handleResendOtp}
                disabled={isResending}
                style={styles.resendBtn}
                backColor="transparent"
                color="purple"
              />
            )}
          </View>

          <RequestBtn
            title="Change Email"
            onPress={() => navigation.goBack()}
            style={[styles.changeEmailBtn, styles.border]}
            backColor="post"
            color="purple"
          />
        </View>
      </View>
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    logo: {
      marginTop: 20,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
      color: theme.main_text,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.sec_text,
      marginBottom: 5,
    },
    email: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
      color: theme.purple,
      marginBottom: 30,
    },
    errorText: {
      color: theme.error || "red",
      fontSize: 14,
      textAlign: "center",
      marginVertical: 10,
    },
    resendContainer: {
      alignItems: "center",
      marginTop: 20,
    },
    timerText: {
      fontSize: 14,
      color: theme.sec_text,
    },
    resendBtn: {
      width: "auto",
      paddingHorizontal: 20,
    },
    changeEmailBtn: {
      width: "90%",
      marginHorizontal: "auto",
      borderRadius: 18,
      marginTop: 20,
    },
    border: {
      borderColor: theme.purple,
    },
  });

export default OtpVerification;