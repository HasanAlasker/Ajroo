import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import ScrollScreen from "../../components/general/ScrollScreen";
import SafeScreen from "../../components/general/SafeScreen";
import Navbar from "../../components/general/Navbar";
import OfferCard from "../../components/OfferCard";
import PostComponent from "../../components/post_releated/PostComponent";
import useThemedStyles from "../../hooks/useThemedStyles";
import { useTheme } from "../../config/ThemeContext";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import AppText from "../../config/AppText";
import Logo from "../../components/Logo";
import { useRevenueCat } from "../../hooks/RevenueCat";
import RequestBtn from "../../components/RequestBtn";
import LoadingCircle from "../../components/general/LoadingCircle";
import {
  updateSubscription,
  restoreSubscription,
} from "../../api/subscription";
import SeparatorComp from "../../components/SeparatorComp";
import { openURL } from "../../functions/openURL";
import { useAlert } from "../../config/AlertContext";

function Subscription(props) {
  const styles = useThemedStyles(getStyles);
  const { theme } = useTheme();
  const {
    offerings,
    customerInfo,
    loading,
    purchasePackage,
    restorePurchases,
    hasActiveSubscription,
    getActiveSubscriptionType,
    getPackageWithJDPrice,
    refreshCustomerInfo,
  } = useRevenueCat();

  const { showAlert } = useAlert();

  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [localActiveSubscription, setLocalActiveSubscription] = useState(null);

  // Update local state whenever customerInfo changes
  useEffect(() => {
    const activeSub = getActiveSubscriptionType();
    setLocalActiveSubscription(activeSub);
  }, [customerInfo]);

  // Map RevenueCat entitlement to backend subscription type
const mapEntitlementToSubscriptionType = (entitlement) => {
  const mapping = {
    pro: "pro_monthly:pro",
    starter: "business_starter:starter",
    premium: "business_premium:premium",
  };
  return mapping[entitlement] || "individual_free";
};

// Map product ID to store format
const mapProductIdToStore = (productId) => {
  if (productId?.includes("ios") || productId?.includes("apple")) {
    return "app_store";
  }
  if (productId?.includes("android") || productId?.includes("google")) {
    return "play_store";
  }
  return Platform.OS === "ios" ? "app_store" : "play_store";
};

const handlePurchase = async (packageToPurchase, planName) => {
  if (purchasing) return;
  setPurchasing(true);

  try {
    const result = await purchasePackage(packageToPurchase);

    if (result.success) {
      try {
        await refreshCustomerInfo();
        const newActiveSub = getActiveSubscriptionType();
        setLocalActiveSubscription(newActiveSub);

        // ✅ This now returns the full subscription type with suffix
        const subscriptionType = mapEntitlementToSubscriptionType(newActiveSub);

        console.log("🔄 Purchase - Entitlement:", newActiveSub);
        console.log("🔄 Purchase - Full Type:", subscriptionType);

        const activeEntitlements = result.customerInfo?.entitlements?.active || {};
        const activeEntitlement = activeEntitlements[newActiveSub];
        const expirationDate = activeEntitlement?.expirationDate;

        const updateData = {
          subscriptionType, // ✅ Now includes suffix
          revenueCatId: result.customerInfo?.originalAppUserId,
          productId: packageToPurchase.product.identifier,
          expirationDate: expirationDate || null,
          store: mapProductIdToStore(packageToPurchase.product.identifier),
          originalPurchaseDate: new Date().toISOString(),
          willRenew: activeEntitlement?.willRenew || true,
          autoRenew: !activeEntitlement?.billingIssuesDetectedAt,
        };

        console.log("📤 Sending to backend:", updateData);

        const apiResponse = await updateSubscription(updateData);

        if (apiResponse.ok) {
          Alert.alert(
            "Success! 🎉",
            `You've successfully subscribed to ${planName}!`,
            [{ text: "OK" }]
          );
        } else {
          console.error("❌ Backend update failed:", apiResponse.data);
          Alert.alert(
            "Warning",
            "Purchase successful but failed to update your account. Please contact support if the issue persists.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("❌ Error updating backend:", error);
        Alert.alert(
          "Warning",
          "Purchase successful but failed to sync with server. Your subscription is active. If issues persist, try 'Restore Purchases'.",
          [{ text: "OK" }]
        );
      }
    } else if (!result.error?.userCancelled) {
      Alert.alert(
        "Purchase Failed",
        result.error?.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    console.error("❌ Purchase error:", error);
    Alert.alert(
      "Purchase Failed",
      "An unexpected error occurred. Please try again.",
      [{ text: "OK" }]
    );
  } finally {
    setPurchasing(false);
  }
};

const handleRestore = async () => {
  if (restoring) return;
  setRestoring(true);

  try {
    const result = await restorePurchases();

    if (result.success) {
      try {
        const newActiveSub = getActiveSubscriptionType();
        setLocalActiveSubscription(newActiveSub);

        if (result.hasActiveEntitlement && newActiveSub) {
          // ✅ This now returns the full subscription type with suffix
          const subscriptionType = mapEntitlementToSubscriptionType(newActiveSub);

          console.log("🔄 Restore - Entitlement:", newActiveSub);
          console.log("🔄 Restore - Full Type:", subscriptionType);

          const activeEntitlements = result.customerInfo?.entitlements?.active || {};
          const activeEntitlement = activeEntitlements[newActiveSub];
          const expirationDate = activeEntitlement?.expirationDate;

          const restoreData = {
            subscriptionType, // ✅ Now includes suffix
            revenueCatId: result.customerInfo?.originalAppUserId,
            expirationDate: expirationDate || null,
            willRenew: activeEntitlement?.willRenew || false,
            autoRenew: !activeEntitlement?.billingIssuesDetectedAt,
          };

          console.log("📤 Restoring to backend:", restoreData);

          const apiResponse = await restoreSubscription(restoreData);

          if (apiResponse.ok) {
            Alert.alert(
              "Purchases Restored! ✅",
              `Your ${newActiveSub?.toUpperCase() || "subscription"} plan has been restored successfully!`,
              [{ text: "OK" }]
            );
          } else {
            console.error("❌ Backend restore failed:", apiResponse.data);
            Alert.alert(
              "Partially Restored",
              "Purchases restored locally but failed to sync with server. Please try again or contact support if the issue persists.",
              [{ text: "OK" }]
            );
          }
        } else {
          Alert.alert(
            "No Active Subscriptions",
            "No active subscriptions were found to restore.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("❌ Error restoring backend:", error);
        Alert.alert(
          "Partially Restored",
          "Purchases restored locally but failed to sync. Please try again later.",
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    }
  } catch (error) {
    console.error("❌ Restore error:", error);
    Alert.alert(
      "Restore Failed",
      "An unexpected error occurred. Please try again.",
      [{ text: "OK" }]
    );
  } finally {
    setRestoring(false);
  }
};

  // Get packages with JD prices
  const proPackage = getPackageWithJDPrice("pro_monthly");
  const starterPackage = getPackageWithJDPrice("business_starter");
  const premiumPackage = getPackageWithJDPrice("business_premium");

  if (loading) {
    return <LoadingCircle />;
  }

  // Check if packages are available
  const packagesAvailable = proPackage || starterPackage || premiumPackage;

  return (
    <SafeScreen>
      <ScrollScreen>
        <Logo slogan style={styles.logo} />

        {/* Active Subscription Banner */}
        {localActiveSubscription && (
          <PostComponent style={[styles.container, styles.activeBanner]}>
            <View style={styles.iconAndTitle}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={theme.green}
              />
              <AppText style={[styles.text, { color: theme.green }]}>
                Active: {localActiveSubscription.charAt(0).toUpperCase()+ localActiveSubscription.slice(1)} Plan
              </AppText>
            </View>
          </PostComponent>
        )}

        {/* No Packages Available Warning */}
        {!packagesAvailable && (
          <PostComponent style={[styles.container, styles.warningBanner]}>
            <View style={styles.iconAndTitle}>
              <MaterialIcons name="warning" size={24} color={theme.orange} />
              <AppText style={[styles.text, { color: theme.orange }]}>
                Subscription packages temporarily unavailable
              </AppText>
            </View>
            <AppText style={[styles.text, styles.faded, { marginTop: 10 }]}>
              Please check your internet connection or try again later.
            </AppText>
          </PostComponent>
        )}

        <PostComponent style={styles.container}>
          <View style={styles.iconAndTitle}>
            <MaterialIcons name={"paid"} size={28} color={theme.purple} />
            <AppText style={[styles.text, styles.title]}>
              Start Earning with Ajroo
            </AppText>
          </View>
          <AppText style={[styles.text, styles.faded]}>
            Whether you're an individual or a business, Ajroo helps you turn
            idle items into income.
          </AppText>
          <AppText style={[styles.text]}>Why Join Ajroo?</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            • Turn unused items into cash{"\n"}• Earn 1 JD/day up to 300 JD/day
            {"\n"}• Control your pricing and availability
          </AppText>
          <AppText style={[styles.text]}>How It Works</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            1. Subscribe - Choose a plan that fits you{"\n"}
            2. List items - Add photos, details and prices{"\n"}
            3. Start earning - Accept rental requests and make money
          </AppText>
          <View style={[styles.smallIconAndTitle]}>
            <FontAwesome6
              name="circle-exclamation"
              color={theme.darker_gray}
              style={{ paddingTop: 5 }}
            />
            <AppText style={[styles.note, styles.small]}>
              Note: Businesses must choose a business plan. Misuse may lead to
              account suspension.
            </AppText>
          </View>
        </PostComponent>

        {/* Free Plan */}
        <OfferCard
          backColor={"post"}
          color={"purple"}
          title={"Individual - Free"}
          icon={"lock-reset"}
          size={32}
        >
          List up to 2 posts for free, no rentals.{"\n\n"}
          Borrow items for free.
        </OfferCard>

        {/* Pro Plan */}
        <OfferCard
          backColor={"purple"}
          color={"always_white"}
          title={"Individual - Pro"}
          icon={"currency-exchange"}
          btnText={
            purchasing
              ? "Processing..."
              : localActiveSubscription === "pro"
              ? "Current Plan"
              : "Subscribe Now"
          }
          startNow={proPackage ? proPackage.jdPrice.replace(" JD", "") : "6"}
          onPress={() => {
            if (localActiveSubscription === "pro") return;
            if (proPackage) {
              handlePurchase(proPackage, "Individual - Pro");
            } else {
              Alert.alert(
                "Unavailable",
                "This package is temporarily unavailable. Please try again later.",
                [{ text: "OK" }]
              );
            }
          }}
          disabled={purchasing || !proPackage}
        >
          List up to 6 items for rental every month and make money.{"\n\n"}
          The profit is all yours - We don't take commission.
        </OfferCard>

        {/* Starter Plan */}
        <OfferCard
          backColor={"green"}
          color={"always_white"}
          title={"Business - Starter"}
          icon={"museum"}
          btnText={
            purchasing
              ? "Processing..."
              : localActiveSubscription === "starter"
              ? "Current Plan"
              : "Subscribe Now"
          }
          startNow={
            starterPackage ? starterPackage.jdPrice.replace(" JD", "") : "25"
          }
          onPress={() => {
            if (localActiveSubscription === "starter") return;
            if (starterPackage) {
              handlePurchase(starterPackage, "Business - Starter");
            } else {
              Alert.alert(
                "Unavailable",
                "This package is temporarily unavailable. Please try again later.",
                [{ text: "OK" }]
              );
            }
          }}
          disabled={purchasing || !starterPackage}
        >
          List up to 25 items for rental every month and make more money.
          {"\n\n"}
          Get a store badge - Displayed next to your user name.
        </OfferCard>

        {/* Premium Plan */}
        <OfferCard
          backColor={"gold"}
          color={"always_white"}
          title={"Business - Premium"}
          icon={"warehouse"}
          btnText={
            purchasing
              ? "Processing..."
              : localActiveSubscription === "premium"
              ? "Current Plan"
              : "Subscribe Now"
          }
          startNow={
            premiumPackage ? premiumPackage.jdPrice.replace(" JD", "") : "50"
          }
          onPress={() => {
            if (localActiveSubscription === "premium") return;
            if (premiumPackage) {
              handlePurchase(premiumPackage, "Business - Premium");
            } else {
              Alert.alert(
                "Unavailable",
                "This package is temporarily unavailable. Please try again later.",
                [{ text: "OK" }]
              );
            }
          }}
          disabled={purchasing || !premiumPackage}
        >
          List unlimited items and max out your profit every month.{"\n\n"}
          Get a store badge - Displayed next to your user name.{"\n\n"}
          List Real Estate and Transportation items.
        </OfferCard>

        <SeparatorComp children={"Manage Subscription"} />

        {/* Restore Purchases Button */}
        <PostComponent style={styles.container}>
          <AppText style={[styles.title, { color: theme.purple }]}>
            Sync Subscription
          </AppText>
          <AppText style={[styles.text, styles.faded]}>
            Use this to sync your subscription across your devices
          </AppText>
          <RequestBtn
            title={restoring ? "Restoring..." : "Restore Purchases"}
            color="always_white"
            backColor="purple"
            onPress={handleRestore}
            style={styles.restoreBtn}
            disabled={restoring}
          />
        </PostComponent>

        <PostComponent style={styles.container}>
          <AppText style={[styles.title, { color: theme.purple }]}>
            Want to cancel your subscription?
          </AppText>
          <AppText style={[styles.text, styles.faded]}>
            Note: Subscriptions are managed by{" "}
            {Platform.OS === "android"
              ? "Google Play Store"
              : "Apple App Store"}
            .{"\n\n"}
            To cancel, you need to do so through your{" "}
            {Platform.OS === "android" ? "Google Play" : "App Store"} account
            settings, not within the Ajroo app.
          </AppText>
          <RequestBtn
            title="Manage Subscription"
            color="always_white"
            backColor="purple"
            onPress={() => {
              const url =
                Platform.OS === "android"
                  ? "https://play.google.com/store/account/subscriptions"
                  : "https://apps.apple.com/account/subscriptions";
              openURL(url, showAlert);
            }}
            style={styles.restoreBtn}
          />
        </PostComponent>

        {/* Privacy & Terms */}
        <PostComponent style={styles.container}>
          <AppText style={[styles.text, styles.faded, { fontSize: 14 }]}>
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.
            {"\n\n"}• Subscriptions automatically renew unless cancelled{"\n"}•
            Payment charged to your store account{"\n"}• Auto-renewal can be
            turned off in account settings{"\n"}• Cancellation takes effect at
            end of billing period
          </AppText>
          <RequestBtn
            color="always_white"
            backColor="purple"
            title="Privacy Policy"
            onPress={() =>
              openURL("https://ajroo.netlify.app/privacy-policy", showAlert)
            }
            style={styles.restoreBtn}
          />
          <RequestBtn
            color="always_white"
            backColor="purple"
            title="Terms of Service"
            onPress={() =>
              openURL("https://ajroo.netlify.app/terms-of-service", showAlert)
            }
            style={styles.restoreBtn}
          />
        </PostComponent>
      </ScrollScreen>
      <Navbar />
    </SafeScreen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 15,
    },
    activeBanner: {
      backgroundColor: theme.post,
      borderColor: theme.green,
      borderWidth: 2,
    },
    warningBanner: {
      backgroundColor: theme.post,
      borderColor: theme.orange || "#FF9500",
      borderWidth: 2,
    },
    iconAndTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    smallIconAndTitle: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    text: {
      color: theme.purple,
      fontSize: 18,
      fontWeight: "bold",
      textAlignVertical: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.purple,
    },
    faded: {
      color: theme.main_text,
      fontWeight: "normal",
    },
    height: {
      lineHeight: 25,
    },
    small: {
      fontSize: 15,
      color: theme.darker_gray,
      fontWeight: "bold",
    },
    note: {
      flex: 1,
    },
    logo: {
      marginVertical: 20,
    },
    restoreBtn: {
      padding: 2,
      borderRadius: 10,
      width: "100%",
      marginTop: 10,
    },
  });

export default Subscription;
