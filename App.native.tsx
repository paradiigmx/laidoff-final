/**
 * Rattle Mobile App - React Native Entry Point
 * 
 * This is the mobile version of Rattle, converted from the web app.
 * All content and functionality is preserved.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppView } from './types';

// Import mobile storage adapter
import './mobile/storageAdapter';

// Import converted components (will be created)
// For now, using placeholders that will be replaced
import { HubScreen } from './mobile/screens/HubScreen';
import { SeveranceHubScreen } from './mobile/screens/SeveranceHubScreen';
import { UnemploymentScreen } from './mobile/screens/UnemploymentScreen';
import { JobFinderScreen } from './mobile/screens/JobFinderScreen';
import { MoneyScreen } from './mobile/screens/MoneyScreen';
import { MonetizationScreen } from './mobile/screens/MonetizationScreen';
import { AssistanceScreen } from './mobile/screens/AssistanceScreen';
import { ResumeScreen } from './mobile/screens/ResumeScreen';
import { CoachScreen } from './mobile/screens/CoachScreen';
import { FounderScreen } from './mobile/screens/FounderScreen';
import { SettingsScreen } from './mobile/screens/SettingsScreen';
import { ProfileScreen } from './mobile/screens/ProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Mobile-optimized menu configuration
// Grouped logically for better mobile UX
const menuConfig = [
  { name: 'Hub', component: HubScreen, icon: '🏠', key: AppView.HOME },
  { name: 'LaidOff', component: SeveranceHubScreen, icon: '💰', key: AppView.SEVERANCE_HUB },
  { name: 'Unemployment', component: UnemploymentScreen, icon: '🏛️', key: AppView.UNEMPLOYMENT },
  { name: 'Job Hunter', component: JobFinderScreen, icon: '🔍', key: AppView.JOBS },
  { name: 'Gigs', component: MoneyScreen, icon: '💸', key: AppView.MONEY },
  { name: 'Monetization', component: MonetizationScreen, icon: '📈', key: AppView.MONETIZATION },
  { name: 'Assistance', component: AssistanceScreen, icon: '🤝', key: AppView.ASSISTANCE },
  { name: 'Resume Lab', component: ResumeScreen, icon: '✨', key: AppView.RESUME },
  { name: 'Coaching', component: CoachScreen, icon: '🧠', key: AppView.COACH },
  { name: 'Founder', component: FounderScreen, icon: '🚀', key: AppView.FOUNDER },
  { name: 'Settings', component: SettingsScreen, icon: '⚙️', key: AppView.SETTINGS },
];

// Custom Drawer Content Component
const CustomDrawerContent = (props: any) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('rattle_dark').then((value) => {
      setDarkMode(value === 'true');
    });
  }, []);

  return (
    <View style={[styles.drawerContainer, darkMode && styles.drawerContainerDark]}>
      <View style={styles.drawerHeader}>
        <Text style={[styles.drawerTitle, darkMode && styles.drawerTitleDark]}>Rattle</Text>
        <Text style={[styles.drawerSubtitle, darkMode && styles.drawerSubtitleDark]}>
          Powered by Public Bar Association
        </Text>
      </View>
      <View style={styles.drawerMenu}>
        {menuConfig.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.drawerItem}
            onPress={() => props.navigation.navigate(item.name)}
          >
            <Text style={styles.drawerIcon}>{item.icon}</Text>
            <Text style={[styles.drawerLabel, darkMode && styles.drawerLabelDark]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function App() {
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('rattle_dark').then((value) => {
      const isDark = value === 'true' || (value === null && colorScheme === 'dark');
      setDarkMode(isDark);
    });
  }, [colorScheme]);

  const theme = darkMode ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Drawer.Navigator
        initialRouteName="Hub"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
          },
          headerTintColor: darkMode ? '#ffffff' : '#000000',
          headerTitle: 'Rattle',
          drawerStyle: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            width: 280,
          },
        }}
      >
        {menuConfig.map((item) => (
          <Drawer.Screen
            key={item.key}
            name={item.name}
            component={item.component}
            options={{
              drawerIcon: () => <Text>{item.icon}</Text>,
            }}
          />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  drawerContainerDark: {
    backgroundColor: '#1e293b',
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284c7',
    marginBottom: 4,
  },
  drawerTitleDark: {
    color: '#38bdf8',
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  drawerSubtitleDark: {
    color: '#94a3b8',
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  drawerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  drawerLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  drawerLabelDark: {
    color: '#f1f5f9',
  },
});

