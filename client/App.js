import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import { ThemeProvider, useTheme } from "./config/ThemeContext";
import { PostProvider } from "./config/PostContext";
import { UserProvider } from "./config/UserContext";
import { useUser } from "./config/UserContext";
import { AlertProvider } from "./config/AlertContext";

import Home from "./pages/Users/Home";
import Have from "./pages/Users/Have";
import Post from "./pages/Users/Post";
import Book from "./pages/Users/Book";
import Profile from "./pages/Users/Profile";
import Requests from "./pages/Users/Requests";
import EditProfile from "./pages/Users/EditProfile";
import Promo from "./pages/Users/Promo";
import Subscription from "./pages/Users/Subscription";

import Welcome from "./pages/Welcome/Welcome";
import Login from "./pages/Welcome/Login";
import Signin from "./pages/Welcome/Signin";
import OfflineModal from "./components/general/OfflineModal";
import Dash from "./pages/admin/Dash";
import Search from "./pages/admin/Search";
import Reports from "./pages/admin/Reports";
import { useEffect, useState, useRef } from "react";
import LoadingCircle from "./components/general/LoadingCircle";
import Suggestions from "./pages/Users/Suggestions";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import Blocks from "./pages/admin/Blocks";

import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "./functions/notificationToken";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { syncRevenueCatId, updateSubscription } from "./api/subscription";

const Stack = createNativeStackNavigator();

// Get android channel id for notifications
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default Notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Authenticated user navigation stack
const AuthenticatedStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: "none" }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Have" component={Have} />
      <Stack.Screen name="Post" component={Post} />
      <Stack.Screen name="Book" component={Book} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Requests" component={Requests} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Promo" component={Promo} />
      <Stack.Screen name="Subscription" component={Subscription} />
      <Stack.Screen name="Suggestions" component={Suggestions} />
    </Stack.Navigator>
  );
};

// Admin navigation stack
const AdminStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dash"
      screenOptions={{ headerShown: false, animation: "none" }}
    >
      <Stack.Screen name="Dash" component={Dash} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Blocks" component={Blocks} />
      <Stack.Screen name="AdminSuggestions" component={AdminSuggestions} />
    </Stack.Navigator>
  );
};

// Non-authenticated user navigation stack
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false, animation: "none" }}
  >
    <Stack.Screen name="Welcome" component={Welcome} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signin" component={Signin} />
  </Stack.Navigator>
);

// Main navigation component that switches based on auth state
const AppNavigator = () => {
  const { isAuthenticated, isAdmin, isLoading, user } = useUser();
  const { isDarkMode } = useTheme();
  const notificationListener = useRef();
  const responseListener = useRef();

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Configure RevenueCat
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const iosApiKey = "test_lAEugUCvMRUQkbQHVTHizTxlyMp";
        const androidApiKey = "test_lAEugUCvMRUQkbQHVTHizTxlyMp";

        if (Platform.OS === "ios") {
          await Purchases.configure({ apiKey: iosApiKey });
        } else if (Platform.OS === "android") {
          await Purchases.configure({ apiKey: androidApiKey });
        }

        console.log("✅ RevenueCat configured");
      } catch (error) {
        console.error("❌ RevenueCat configuration error:", error);
      }
    };

    initializeRevenueCat();
  }, []);

  // Handle user authentication and RevenueCat login
  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const revenueCatUserId = user.id;
          console.log("🔐 Logging in to RevenueCat with ID:", revenueCatUserId);

          // Log in user to RevenueCat
          const { customerInfo } = await Purchases.logIn(revenueCatUserId);
          console.log("✅ RevenueCat user logged in");

          // Sync with backend to ensure user has RevenueCat ID
          const response = await syncRevenueCatId();
          if (response.ok) {
            console.log("✅ RevenueCat ID synced with backend");
          } else {
            console.error("❌ Failed to sync RevenueCat ID:", response.data);
          }

          // **NEW: Sync subscription data from RevenueCat**
          await syncSubscriptionData(customerInfo);
        } catch (error) {
          console.error("❌ RevenueCat login error:", error);
        }
      }
    };

    handleUserAuthentication();
  }, [isAuthenticated, user?.id]);

  // **NEW: Add this helper function**
  // In App.js, update the syncSubscriptionData function:

const syncSubscriptionData = async (customerInfo) => {
  try {
    const activeEntitlements = customerInfo?.entitlements?.active || {};
    
    // Check if user has any active subscription
    const hasActiveSub = Object.keys(activeEntitlements).length > 0;
    
    if (hasActiveSub) {
      // Get the first active entitlement
      const entitlementKey = Object.keys(activeEntitlements)[0];
      const entitlement = activeEntitlements[entitlementKey];
      
      // Map entitlement to subscription type
      const mapping = {
        pro: "individual_pro",
        starter: "business_starter",
        premium: "business_premium",
      };
      
      const subscriptionType = mapping[entitlementKey] || "individual_free";
      
      // Prepare sync data
      const syncData = {
        subscriptionType,
        revenueCatId: customerInfo.originalAppUserId,
        productId: entitlement.productIdentifier,
        expirationDate: entitlement.expirationDate,
        store: entitlement.store === "APP_STORE" ? "app_store" : "play_store",
        originalPurchaseDate: entitlement.originalPurchaseDate,
        willRenew: entitlement.willRenew,
        autoRenew: !entitlement.billingIssuesDetectedAt,
      };
      
      console.log("🔄 Syncing subscription data:", syncData);
      
      const { syncSubscriptionFromRevenueCat } = await import("./api/subscription");
      const result = await syncSubscriptionFromRevenueCat(syncData);
      
      if (result.ok) {
        console.log("✅ Subscription synced from RevenueCat");
      } else {
        console.error("❌ Failed to sync subscription:", result.data);
      }
    } else {
      // **NEW: No active subscription, update to individual_free**
      console.log("ℹ️ No active subscription found, updating to individual_free");
      
      const freeData = {
        subscriptionType: "individual_free",
        revenueCatId: customerInfo.originalAppUserId,
        productId: null, // No product ID for free plan
        expirationDate: null,
        store: null,
        originalPurchaseDate: null,
        willRenew: false,
        autoRenew: false,
      };
      
      const { syncSubscriptionFromRevenueCat } = await import("./api/subscription");
      const result = await syncSubscriptionFromRevenueCat(freeData);
      
      if (result.ok) {
        console.log("✅ Updated to individual_free plan");
      } else {
        console.error("❌ Failed to update to free plan:", result.data);
      }
    }
  } catch (error) {
    console.error("❌ Error syncing subscription data:", error);
  }
};

  // Handle push notifications
  useEffect(() => {
    if (isAuthenticated) {
      // Register for push notifications
      registerForPushNotifications();

      // Listen for notifications received while app is foregrounded
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("📬 Notification received!");
          console.log("Title:", notification.request.content.title);
          console.log("Body:", notification.request.content.body);
          console.log("Data:", notification.request.content.data);
        });

      // Listen for user interactions with notifications
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("👆 Notification tapped!");
          console.log("Response:", response);
          // TODO: Handle navigation based on notification data
          // Example: if (response.notification.request.content.data.screen) { navigate(...) }
        });

      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        }
      };
    }
  }, [isAuthenticated]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingCircle />;
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer>
        {isAuthenticated && isAdmin ? (
          <AdminStack />
        ) : isAuthenticated ? (
          <AuthenticatedStack />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </>
  );
};

export default function App() {
  const [backModal, setBackModal] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <UserProvider>
            <PostProvider>
              <AppNavigator />
              {/* This modal shows for the item owner when the borrower
                claims that he returned the item */}
              {/* <GetBackModal
                isVisibile={true}
                onClose={() => {
                  setBackModal(backModal);
                }}
              /> */}
            </PostProvider>
          </UserProvider>
        </AlertProvider>
        <OfflineModal />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
