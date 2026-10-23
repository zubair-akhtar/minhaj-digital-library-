// Minhaj Digital Library — Book Details Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { booksApi } from '../../api/booksApi';
import { getImageUrl } from '../../api/client';
import { Book } from '../../types/book';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { Colors } from '../../theme/colors';
import {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../theme/spacing';

type RouteParams = {
  BookDetails: { bookId: number; title: string };
};

const BookDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'BookDetails'>>();
  const navigation = useNavigation<any>();
  const { bookId } = route.params;

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await booksApi.getById(bookId);
      setBook(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load book details');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleReadPdf = useCallback(() => {
    if (book) {
      navigation.navigate('PdfReader', {
        pdfUrl: book.pdf_url,
        title: book.title,
      });
    }
  }, [book, navigation]);

  if (isLoading) {
    return <LoadingState message="Loading book details..." fullScreen />;
  }

  if (error || !book) {
    return (
      <ErrorState
        message={error || 'Book not found'}
        onRetry={fetchBook}
        fullScreen
      />
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Cover Image Section */}
        <View style={styles.coverSection}>
          <View style={styles.coverContainer}>
            {getImageUrl(book.cover_image) ? (
              <Image
                source={{ uri: getImageUrl(book.cover_image)! }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderIcon}>📖</Text>
                <Text style={styles.coverPlaceholderText}>No Cover</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>

          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{book.category_name}</Text>
            </View>
          </View>

          {/* Description */}
          {book.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About this book</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>
          ) : null}

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{book.category_name}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Author</Text>
              <Text style={styles.detailValue}>{book.author}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added</Text>
              <Text style={styles.detailValue}>
                {new Date(book.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Read Button */}
      <View style={styles.readButtonContainer}>
        <TouchableOpacity
          style={styles.readButton}
          onPress={handleReadPdf}
          activeOpacity={0.85}>
          <Text style={styles.readButtonIcon}>📄</Text>
          <Text style={styles.readButtonText}>Read PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverSection: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  coverContainer: {
    width: 160,
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.large,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderIcon: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  coverPlaceholderText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  infoSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 32,
  },
  author: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  categoryBadge: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadow.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.xs,
  },
  readButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  readButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadow.medium,
  },
  readButtonIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  readButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});

export default BookDetailsScreen;
