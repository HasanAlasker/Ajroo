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
import { NotificationProvider } from "./config/NotificationContext";

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
import { useEffect, useState } from "react";
import LoadingCircle from "./components/general/LoadingCircle";
import Suggestions from "./pages/Users/Suggestions";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import Blocks from "./pages/admin/Blocks";

import Purchases, { LOG_LEVEL } from "react-native-purchases";
import {
  syncRevenueCatId,
  syncSubscriptionFromRevenueCat,
} from "./api/subscription";

const Stack = createNativeStackNavigator();

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

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const iosApiKey = "test_lAEugUCvMRUQkbQHVTHizTxlyMp";
        const androidApiKey = "goog_fjKLVlYgLyEfqqcFoVtyoTBwrsp";

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

  // Handle RevenueCat authentication
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

          await syncSubscriptionData(customerInfo, user.id);
        } catch (error) {
          console.error("❌ RevenueCat login error:", error);
        }
      }
    };

    handleUserAuthentication();
  }, [isAuthenticated, user?.id]);

  const syncSubscriptionData = async (customerInfo, userId) => {
    try {
      console.log("🔄 Starting subscription sync...");
      console.log("👤 User ID:", userId);
      
      const activeEntitlements = customerInfo?.entitlements?.active || {};
      const hasActiveSub = Object.keys(activeEntitlements).length > 0;
      
      if (hasActiveSub) {
        const entitlementKey = Object.keys(activeEntitlements)[0];
        const entitlement = activeEntitlements[entitlementKey];
        
        console.log("📦 Active entitlement:", entitlementKey);
        console.log("📦 Product ID:", entitlement.productIdentifier);
        
        // Map by product ID (more reliable)
        const productMapping = {
          "pro_monthly": "pro_monthly:pro",
          "business_starter": "business_starter:starter",
          "business_premium": "business_premium:premium",
        };
        
        let subscriptionType = productMapping[entitlement.productIdentifier];
        
        if (!subscriptionType) {
          // Fallback to entitlement ID mapping
          const entitlementMapping = {
            "pro": "pro_monthly:pro",
            "starter": "business_starter:starter",
            "premium": "business_premium:premium",
          };
          subscriptionType = entitlementMapping[entitlementKey.toLowerCase()];
        }
        
        if (!subscriptionType) {
          console.warn("⚠️ Unknown subscription, defaulting to free");
          subscriptionType = "individual_free";
        }
        
        console.log("🎯 Final subscription type:", subscriptionType);
        
        const syncData = {
          subscriptionType,
          revenueCatId: userId,
          productId: subscriptionType,
          expirationDate: entitlement.expirationDate || null,
          store: entitlement.store === "APP_STORE" ? "app_store" : 
                 entitlement.store === "PLAY_STORE" ? "play_store" : null,
          originalPurchaseDate: entitlement.originalPurchaseDate || null,
          willRenew: entitlement.willRenew || false,
          autoRenew: !entitlement.billingIssuesDetectedAt,
        };
        
        console.log("📤 Syncing to backend:", syncData);
        
        const result = await syncSubscriptionFromRevenueCat(syncData);
        
        if (result.ok) {
          console.log("✅ Subscription synced successfully");
        } else {
          console.error("❌ Sync failed:", result.status, result.data);
        }
      } else {
        console.log("ℹ️ No active subscription, setting to free");
        
        const freeData = {
          subscriptionType: "individual_free",
          revenueCatId: userId,
          productId: null,
          expirationDate: null,
          store: null,
          originalPurchaseDate: null,
          willRenew: false,
          autoRenew: false,
        };
        
        const result = await syncSubscriptionFromRevenueCat(freeData);
        
        if (result.ok) {
          console.log("✅ Free plan set successfully");
        } else {
          console.error("❌ Free plan sync failed:", result.status, result.data);
        }
      }
    } catch (error) {
      console.error("❌ Subscription sync error:", error.message);
    }
  };

  // Listen for subscription changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const customerInfoUpdateListener = Purchases.addCustomerInfoUpdateListener((info) => {
      console.log("🔔 Subscription updated from RevenueCat");
      syncSubscriptionData(info, user.id);
    });

    return () => {
      if (customerInfoUpdateListener && typeof customerInfoUpdateListener.remove === 'function') {
        customerInfoUpdateListener.remove();
      }
    };
  }, [isAuthenticated, user?.id]);


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
            <NotificationProvider>
              <PostProvider>
                <AppNavigator />
              </PostProvider>
            </NotificationProvider>
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