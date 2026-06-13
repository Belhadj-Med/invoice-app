import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import CustomTabBar from './src/components/CustomTabBar';
import Toast from './src/components/Toast';
import DashboardScreen from './src/screens/DashboardScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ClientDetailScreen from './src/screens/ClientDetailScreen';
import CreateInvoiceScreen from './src/screens/CreateInvoiceScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CompanyInfoScreen from './src/screens/CompanyInfoScreen';
import DocumentTemplatesScreen from './src/screens/DocumentTemplatesScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function ClientsNavigator() {
  return (
    <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientsStack.Screen name="ClientsList" component={ClientsScreen} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} />
    </ClientsStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="CompanyInfo" component={CompanyInfoScreen} />
      <SettingsStack.Screen name="DocumentTemplates" component={DocumentTemplatesScreen} />
    </SettingsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false, 
        tabBarHideOnKeyboard: true,
        unmountOnBlur: true, // Clear navigation stack when tab loses focus
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clients" component={ClientsNavigator} />
      <Tab.Screen name="Preview" component={PreviewScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ animationEnabled: false }}
          />
          <RootStack.Group
            screenOptions={{
              presentation: 'modal',
              animationEnabled: true,
              cardStyle: { backgroundColor: 'transparent' },
            }}
          >
            <RootStack.Screen 
              name="CreateModal" 
              component={CreateInvoiceScreen}
              options={{
                cardOverlayEnabled: true,
                cardStyle: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
              }}
            />
          </RootStack.Group>
        </RootStack.Navigator>
        <Toast />
      </NavigationContainer>
    </>
  );
}

function AppContent() {
  const { onboardingComplete } = useApp();
  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }
  return <AppNavigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
