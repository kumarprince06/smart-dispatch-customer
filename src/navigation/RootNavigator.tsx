import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import MainTabNavigator from './MainTabNavigator';
import CreateOrderScreen from '../screens/orders/CreateOrderScreen';
import ServicesScreen from '../screens/home/ServicesScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SavedAddressesScreen from '../screens/profile/SavedAddressesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import FavoriteRidersScreen from '../screens/profile/FavoriteRidersScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />
            <Stack.Screen name="Services" component={ServicesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            
            {/* Profile Screens */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="FavoriteRiders" component={FavoriteRidersScreen} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
