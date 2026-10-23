// Minhaj Digital Library — Admin Home Screen

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../theme/spacing';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color = Colors.primary,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.85}>
    <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuInfo}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.menuArrow}>→</Text>
  </TouchableOpacity>
);

const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.headerTitle}>
            Welcome, {user?.name || 'Admin'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your digital library
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Management</Text>

        <MenuItem
          icon="📚"
          title="Manage Books"
          subtitle="Add, edit, or delete books"
          onPress={() => navigation.navigate('ManageBooks')}
        />

        <MenuItem
          icon="📂"
          title="Manage Categories"
          subtitle="Create and organize categories"
          onPress={() => navigation.navigate('ManageCategories')}
          color={Colors.info}
        />

        <MenuItem
          icon="📖"
          title="Browse Library"
          subtitle="View the library as a reader"
          onPress={() => navigation.navigate('ReaderLibrary')}
          color={Colors.success}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Account</Text>

        <MenuItem
          icon="🚪"
          title="Sign Out"
          subtitle="Log out of your account"
          onPress={handleLogout}
          color={Colors.error}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  adminBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  adminBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  menuTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  menuArrow: {
    fontSize: FontSize.lg,
    color: Colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.lg,
  },
});

export default AdminHomeScreen;
