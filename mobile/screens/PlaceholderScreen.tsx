import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { BottomNavBar } from '../components/BottomNavBar';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, description }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Version</Text>
          <Text style={styles.cardText}>
            This screen is being converted to React Native. All content and functionality will be preserved.
          </Text>
        </View>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 80, // Space for bottom nav
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: isDark ? '#334155' : '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
    lineHeight: 24,
  },
  card: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#1e293b',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: isDark ? '#cbd5e1' : '#475569',
    lineHeight: 22,
  },
});
