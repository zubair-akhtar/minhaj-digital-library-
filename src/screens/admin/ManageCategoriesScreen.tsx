// Minhaj Digital Library — Manage Categories Screen (Admin)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import { categoriesApi } from '../../api/categoriesApi';
import { Category } from '../../types/category';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../theme/colors';
import {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../theme/spacing';

const ManageCategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = useCallback(async () => {
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert('Error', 'Category name is required');
      return;
    }
    if (name.length < 2) {
      Alert.alert('Error', 'Category name must be at least 2 characters');
      return;
    }

    setIsCreating(true);
    try {
      const created = await categoriesApi.create({ name });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      Alert.alert('Success', `Category "${created.name}" created`);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message || 'Failed to create category',
      );
    } finally {
      setIsCreating(false);
    }
  }, [newCategoryName]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories(false);
  }, [fetchCategories]);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>📂</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDate}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return <LoadingState message="Loading categories..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => fetchCategories()}
        fullScreen
      />
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <Text style={styles.headerSubtitle}>
          {categories.length} categories
        </Text>
      </View>

      {/* Create Category Form */}
      <View style={styles.createSection}>
        <Text style={styles.createTitle}>Create New Category</Text>
        <View style={styles.createRow}>
          <TextInput
            style={styles.createInput}
            placeholder="Category name..."
            placeholderTextColor={Colors.textLight}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoCapitalize="words"
            editable={!isCreating}
          />
          <TouchableOpacity
            style={[
              styles.createButton,
              isCreating && styles.createButtonDisabled,
            ]}
            onPress={handleCreateCategory}
            disabled={isCreating}
            activeOpacity={0.85}>
            <Text style={styles.createButtonText}>
              {isCreating ? '...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category List */}
      {categories.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No categories"
          message="Create your first category above"
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
  },
  createSection: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.small,
  },
  createTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  createInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  categoryName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  categoryDate: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});

export default ManageCategoriesScreen;
