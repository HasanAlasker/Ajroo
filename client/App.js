import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

import { ThemeProvider, useTheme } from "./config/ThemeContext";
import { PostProvider } from "./config/PostContext";
import { UserProvider } from "./config/UserContext";
import { useUser } from "./config/UserContext";

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
import { View, ActivityIndicator } from "react-native";
import OfflineModal from "./components/general/OfflineModal";
import Dash from "./pages/admin/Dash";
import Search from "./pages/admin/Search";
import Reports from "./pages/admin/Reports";

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
    </Stack.Navigator>
  );
};
// Authenticated user navigation stack
const AdminStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dash"
      screenOptions={{ headerShown: false, animation: "none" }}
    >
      <Stack.Screen name="Dash" component={Dash} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Reports" component={Reports} />
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
  const { isAuthenticated, isAdmin, isLoading } = useUser();
  const { isDarkMode } = useTheme();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? "#262626" : "#ECECEC" },
        ]}
      >
        <ActivityIndicator size="large" color={"#AC2FFF"} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer>
        {(isAuthenticated && isAdmin) ? <AdminStack /> : isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
};

// App content wrapper
const AppContent = () => {
  return <AppNavigator />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <PostProvider>
            <AppContent />
          </PostProvider>
        </UserProvider>
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
