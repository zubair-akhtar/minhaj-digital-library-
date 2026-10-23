// Minhaj Digital Library — Library Screen (Reader)
// Shows categories, search, and book list with pull-to-refresh.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { booksApi } from '../../api/booksApi';
import { categoriesApi } from '../../api/categoriesApi';
import { Book } from '../../types/book';
import { Category } from '../../types/category';
import BookCard from '../../components/BookCard';
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

const SEARCH_DEBOUNCE_MS = 400;

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: logout },
    ]);
  }, [logout]);

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err: any) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch books
  const fetchBooks = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const params: any = {};
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (selectedCategory) {
          params.category_id = selectedCategory;
        }
        const data = await booksApi.getAll(params);
        setBooks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load books');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery, selectedCategory],
  );

  // Fetch books when filters change (with debounce for search)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchBooks();
    }, searchQuery ? SEARCH_DEBOUNCE_MS : 0);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [fetchBooks, searchQuery]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchBooks(false);
  }, [fetchBooks]);

  // Navigate to book details
  const handleBookPress = useCallback(
    (book: Book) => {
      navigation.navigate('BookDetails', { bookId: book.id, title: book.title });
    },
    [navigation],
  );

  // Category chip press
  const handleCategoryPress = useCallback(
    (categoryId: number | null) => {
      setSelectedCategory((prev) =>
        prev === categoryId ? null : categoryId,
      );
    },
    [],
  );

  // Render category chips
  const renderCategoryChips = () => (
    <View style={styles.chipsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: null, name: 'All' } as any, ...categories]}
        keyExtractor={(item) => String(item.id ?? 'all')}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => {
          const isActive =
            item.id === null
              ? selectedCategory === null
              : selectedCategory === item.id;
          return (
            <TouchableOpacity
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleCategoryPress(item.id)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  // Render book item
  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookCard book={item} onPress={handleBookPress} />
    ),
    [handleBookPress],
  );

  // Render list content
  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return <LoadingState message="Loading books..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={() => fetchBooks()} />;
    }

    if (books.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No books found"
          message={
            searchQuery
              ? `No results for "${searchQuery}"`
              : 'No books available in this category'
          }
        />
      );
    }

    return (
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBookItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Reader'} 👋</Text>
            <Text style={styles.headerSubtitle}>
              Discover your next great read
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books by title..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      {renderCategoryChips()}

      {/* Book List */}
      <View style={styles.content}>{renderContent()}</View>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadow.small,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  clearText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  chipsContainer: {
    marginTop: Spacing.md,
  },
  chipsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
});

export default LibraryScreen;
