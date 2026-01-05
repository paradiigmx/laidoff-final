# Mobile App Conversion Guide

This document outlines the conversion of Rattle from a web app to a React Native mobile app.

## Structure

The mobile app uses:
- React Native with Expo
- React Navigation for navigation
- AsyncStorage for local storage (replacing localStorage)
- All existing services and types preserved

## Key Changes

1. **Navigation**: Sidebar menu converted to React Navigation Drawer
2. **Storage**: localStorage → AsyncStorage
3. **Components**: All React web components converted to React Native components
4. **Styling**: Tailwind CSS → React Native StyleSheet
5. **Layout**: Desktop sidebar → Mobile drawer navigation

## Menu Order (Mobile-Optimized)

1. Hub
2. LaidOff
3. Unemployment
4. Job Hunter
5. Gigs
6. Monetization
7. Assistance
8. Resume Lab
9. Coaching
10. Founder
11. Settings


