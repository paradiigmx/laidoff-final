import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserProfile, HubTask, HubReminder, BudgetItem } from '../../types';
import {
  getUserProfile,
  getHubTasks,
  getHubReminders,
  getBudgetItems,
} from '../../services/storageService';
import { AppView } from '../../types';

export const HubScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<any>();
  const styles = getStyles(isDark);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<HubTask[]>([]);
  const [reminders, setReminders] = useState<HubReminder[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'budget'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProfile(getUserProfile());
    setTasks(getHubTasks());
    setReminders(getHubReminders());
    setBudgetItems(getBudgetItems());
  };

  const quickActions = [
    { label: 'Build Resume', icon: '✨', screen: 'Resume Lab' },
    { label: 'Find Jobs', icon: '🔍', screen: 'Job Hunter' },
    { label: 'Coaching', icon: '🧠', screen: 'Coaching' },
    { label: 'Start Business', icon: '🚀', screen: 'Founder' },
  ];

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!</Text>
        <Text style={styles.heroSubtitle}>Your personal career hub</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reminders.length}</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{budgetItems.length}</Text>
          <Text style={styles.statLabel}>Budget Items</Text>
        </View>
      </View>
    </View>
  );

  const renderTasks = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Tasks & Reminders</Text>
      {tasks.length === 0 && reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tasks or reminders yet</Text>
        </View>
      ) : (
        <>
          {tasks.map((task, idx) => (
            <View key={idx} style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>
          ))}
          {reminders.map((reminder, idx) => (
            <View key={idx} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <Text style={styles.reminderTime}>
                {new Date(reminder.datetime).toLocaleString()}
              </Text>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderBudget = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Budget Overview</Text>
      {budgetItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No budget items yet</Text>
        </View>
      ) : (
        budgetItems.map((item, idx) => (
          <View key={idx} style={styles.budgetCard}>
            <Text style={styles.budgetName}>{item.name}</Text>
            <Text style={[styles.budgetAmount, item.type === 'income' && styles.budgetIncome]}>
              {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budget' && styles.tabActive]}
          onPress={() => setActiveTab('budget')}
        >
          <Text style={[styles.tabText, activeTab === 'budget' && styles.tabTextActive]}>
            Budget
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'budget' && renderBudget()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#ff6b35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94a3b8' : '#64748b',
  },
  tabTextActive: {
    color: '#ff6b35',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for bottom nav
  },
  tabContent: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#ff6b35', // Orange gradient
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff5f0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#1e293b',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1e293b',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1e293b',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  reminderCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1e293b',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  budgetCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1e293b',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
  },
  budgetIncome: {
    color: '#16a34a',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
    textAlign: 'center',
  },
});
