import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Add this import
import { createStackNavigator } from '@react-navigation/stack';
import { useUserAuth } from './context/UserContext';
import LoginPage from './auth/Login';
import SignupPage from './auth/Signup';
import HomePage from './pages/Home';
import WelcomePage from './pages/Welcome';
import ScanImage from './pages/ScanImage';
import HistoryPage from './pages/HistoryPage';
import DiseaseLibrary from './pages/DiseaseLibrary';
import CommunityForum from './pages/CommunityForum';
import CropCareTipsPage from './pages/CropCareTips';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomePage} options={{ headerShown: false }} />
    <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
    <Stack.Screen name="Signup" component={SignupPage} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
    <Stack.Screen name="Scan Image" component={ScanImage} options={{ headerShown: false }} />
    <Stack.Screen name="History Page" component={HistoryPage} options={{ headerShown: false }} />
    <Stack.Screen name="Disease Library" component={DiseaseLibrary} options={{ headerShown: false }} />
    <Stack.Screen name="Community Forum" component={CommunityForum} options={{ headerShown: false }} />
    <Stack.Screen name="Crop Care Tips" component={CropCareTipsPage} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user } = useUserAuth(); // Access the user state from UserContext

  return (
    <NavigationContainer> {/* Wrap the stack navigator in NavigationContainer */}
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
