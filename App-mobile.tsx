/**
 * Rattle Mobile App - React Native Entry Point
 * 
 * This is the mobile version of Rattle, converted from the web app.
 * All content and functionality is preserved.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppView } from './types';

// Import mobile storage adapter
import './mobile/storageAdapter';

// Import screen components
import {
  HubScreen,
  SeveranceHubScreen,
  UnemploymentScreen,
  JobFinderScreen,
  MoneyScreen,
  MonetizationScreen,
  AssistanceScreen,
  ResumeScreen,
  CoachScreen,
  FounderScreen,
  SettingsScreen,
  ProfileScreen,
} from './mobile/screens';

const Drawer = createDrawerNavigator();

// Mobile-optimized menu configuration
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

  const styles = getDrawerStyles(darkMode);

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeaderGradient}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Rattle</Text>
          <Text style={styles.drawerSubtitle}>
            Powered by Public Bar Association
          </Text>
        </View>
      </View>
      <ScrollView style={styles.drawerScroll}>
        <View style={styles.drawerMenu}>
          {menuConfig.map((item) => {
            const isActive = props.state.routes[props.state.index]?.name === item.name;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.drawerItem, isActive && styles.drawerItemActive]}
                onPress={() => props.navigation.navigate(item.name)}
              >
                <Text style={styles.drawerIcon}>{item.icon}</Text>
                <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const getDrawerStyles = (darkMode: boolean) => StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
  },
  drawerHeaderGradient: {
    backgroundColor: '#ff6b35', // Orange gradient start
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e55a2b',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingBottom: 20,
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#fff5f0',
    marginTop: 4,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#334155' : '#f1f5f9',
  },
  drawerItemActive: {
    backgroundColor: '#fff5f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  drawerIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: darkMode ? '#f1f5f9' : '#1e293b',
  },
  drawerLabelActive: {
    color: '#ff6b35',
    fontWeight: '700',
  },
});

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
  const headerStyle = {
    backgroundColor: '#ff6b35', // Orange gradient
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Drawer.Navigator
        initialRouteName="Hub"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle,
          headerTintColor: '#ffffff',
          headerTitle: 'Rattle',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: '#ffffff',
          },
          drawerStyle: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            width: 280,
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {menuConfig.map((item) => (
          <Drawer.Screen
            key={item.key}
            name={item.name}
            component={item.component}
            options={{
              drawerIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>{item.icon}</Text>
              ),
            }}
          />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
