import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface BottomNavItem {
  name: string;
  icon: string;
  label: string;
}

const bottomNavItems: BottomNavItem[] = [
  { name: 'Hub', icon: '🏠', label: 'Home' },
  { name: 'LaidOff', icon: '💰', label: 'LaidOff' },
  { name: 'Job Hunter', icon: '🔍', label: 'Jobs' },
  { name: 'Settings', icon: '⚙️', label: 'Settings' },
];

export const BottomNavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.container}>
      {bottomNavItems.map((item) => {
        const isActive = route.name === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.name)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  labelActive: {
    color: '#ff6b35',
    fontWeight: '700',
  },
});


