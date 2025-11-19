import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
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
import { updateSubscription, restoreSubscription } from "../../api/subscription";

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

  const [purchasing, setPurchasing] = useState(false);
  const [localActiveSubscription, setLocalActiveSubscription] = useState(null);

  // Update local state whenever customerInfo changes
  useEffect(() => {
    const activeSub = getActiveSubscriptionType();
    setLocalActiveSubscription(activeSub);
    console.log("🔄 Active subscription updated:", activeSub);
  }, [customerInfo]);

  // Map RevenueCat entitlement to backend subscription type
  const mapEntitlementToSubscriptionType = (entitlement) => {
    const mapping = {
      pro: "individual_pro",
      starter: "business_starter",
      premium: "business_premium",
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
    return "app_store"; // default
  };

  const handlePurchase = async (packageToPurchase, planName) => {
    setPurchasing(true);
    const result = await purchasePackage(packageToPurchase);
    setPurchasing(false);

    if (result.success) {
      try {
        // Force refresh to get latest entitlements
        await refreshCustomerInfo();

        // Get the active entitlement
        const newActiveSub = getActiveSubscriptionType();
        setLocalActiveSubscription(newActiveSub);

        // Update backend subscription
        const subscriptionType = mapEntitlementToSubscriptionType(newActiveSub);
        
        // Get expiration date from customerInfo
        const activeEntitlements = result.customerInfo?.entitlements?.active || {};
        const activeEntitlement = activeEntitlements[newActiveSub];
        const expirationDate = activeEntitlement?.expirationDate;

        const updateData = {
          subscriptionType,
          revenueCatId: result.customerInfo?.originalAppUserId,
          productId: packageToPurchase.product.identifier,
          expirationDate: expirationDate || null,
          store: mapProductIdToStore(packageToPurchase.product.identifier),
          originalPurchaseDate: new Date().toISOString(),
        };

        console.log("🔍 Active entitlement:", newActiveSub);
        console.log("🔍 Mapped subscription type:", subscriptionType);
        console.log("📤 Updating backend with:", updateData);

        const apiResponse = await updateSubscription(updateData);

        if (apiResponse.ok) {
          console.log("✅ Backend subscription updated successfully");
          Alert.alert(
            "Success! 🎉",
            `You've successfully subscribed to ${planName}!`,
            [{ text: "OK" }]
          );
        } else {
          console.error("❌ Backend update failed:", apiResponse.data);
          Alert.alert(
            "Warning",
            "Purchase successful but failed to update your account. Please contact support.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("❌ Error updating backend:", error);
        Alert.alert(
          "Warning",
          "Purchase successful but failed to update your account. Please contact support.",
          [{ text: "OK" }]
        );
      }
    } else if (!result.error?.userCancelled) {
      Alert.alert(
        "Purchase Failed",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const result = await restorePurchases();
    setPurchasing(false);

    if (result.success) {
      try {
        // Update local state after restore
        const newActiveSub = getActiveSubscriptionType();
        setLocalActiveSubscription(newActiveSub);

        if (result.hasActiveEntitlement && newActiveSub) {
          // Update backend with restored subscription
          const subscriptionType = mapEntitlementToSubscriptionType(newActiveSub);
          
          const activeEntitlements = result.customerInfo?.entitlements?.active || {};
          const activeEntitlement = activeEntitlements[newActiveSub];
          const expirationDate = activeEntitlement?.expirationDate;

          const restoreData = {
            subscriptionType,
            revenueCatId: result.customerInfo?.originalAppUserId,
            expirationDate: expirationDate || null,
          };

          console.log("📤 Restoring backend with:", restoreData);

          const apiResponse = await restoreSubscription(restoreData);

          if (apiResponse.ok) {
            console.log("✅ Backend subscription restored successfully");
            Alert.alert(
              "Purchases Restored! ✅",
              `Your ${newActiveSub?.toUpperCase() || "subscription"} plan has been restored successfully!`,
              [{ text: "OK" }]
            );
          } else {
            console.error("❌ Backend restore failed:", apiResponse.data);
            Alert.alert(
              "Warning",
              "Purchases restored but failed to update your account. Please contact support.",
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
          "Warning",
          "Purchases restored but failed to update your account. Please contact support.",
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Get packages with JD prices
  const proPackage = getPackageWithJDPrice("pro_monthly");
  const starterPackage = getPackageWithJDPrice("business_starter");
  const premiumPackage = getPackageWithJDPrice("business_premium");

  if (loading) {
    return <LoadingCircle />;
  }

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
                Active: {localActiveSubscription.toUpperCase()} Plan
              </AppText>
            </View>
          </PostComponent>
        )}

        <PostComponent style={styles.container}>
          <View style={styles.iconAndTitle}>
            <MaterialIcons
              name={"paid"}
              size={28}
              color={theme.purple}
            />
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
            - Turn unused items into cash.{"\n"}- Earn 1 JD/day up to 300
            JD/day.{"\n"}- Control your pricing and availability.{"\n"}
          </AppText>
          <AppText style={[styles.text]}>How It Works?</AppText>
          <AppText style={[styles.text, styles.faded, styles.height]}>
            1- Subscribe - Choose a plan that fits you.{"\n"}
            2- List items - Add photos, details and prices.{"\n"}
            3- Start earning - Accept rental requests and make money.{"\n"}
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
          List up to 2 posts for free, no rentals {"\n\n"}
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
              : "Subscribe now"
          }
          startNow={proPackage ? proPackage.jdPrice.replace(" JD", "") : 6}
          onPress={() => {
            if (localActiveSubscription === "pro") return;
            if (proPackage) handlePurchase(proPackage, "Individual - Pro");
          }}
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
              : "Subscribe now"
          }
          startNow={
            starterPackage ? starterPackage.jdPrice.replace(" JD", "") : 25
          }
          onPress={() => {
            if (localActiveSubscription === "starter") return;
            if (starterPackage)
              handlePurchase(starterPackage, "Business - Starter");
          }}
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
              : "Subscribe now"
          }
          startNow={
            premiumPackage ? premiumPackage.jdPrice.replace(" JD", "") : 50
          }
          onPress={() => {
            if (localActiveSubscription === "premium") return;
            if (premiumPackage)
              handlePurchase(premiumPackage, "Business - Premium");
          }}
        >
          List unlimited items and max out your profit every month.{"\n\n"}
          Get a store badge - Displayed next to your user name.{"\n\n"}
          List Realestate and Transportation items.
        </OfferCard>

        {/* Restore Purchases Button */}
        <PostComponent style={styles.container}>
          <RequestBtn
            title="Restore Purchases"
            color="post"
            backColor="purple"
            onPress={handleRestore}
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
    },
    faded: {
      color: theme.main_text,
      fontWeight: "regular",
    },
    height: {
      lineHeight: 25,
    },
    small: {
      fontSize: 15,
      color: theme.darker_gray,
      fontWeight: "bold",
    },
    logo: {
      marginVertical: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    loadingText: {
      color: theme.main_text,
      fontSize: 16,
    },
    restoreBtn: {
      padding: 2,
      borderRadius: 10,
      width: "100%",
    },
  });

export default Subscription;