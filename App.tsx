import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator, navTheme } from './src/navigation/TabNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { Colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.bg}
          translucent={Platform.OS === 'android'}
        />
        <NavigationContainer theme={navTheme}>
          <TabNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}