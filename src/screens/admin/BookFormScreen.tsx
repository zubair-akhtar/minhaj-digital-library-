// Minhaj Digital Library — Book Form Screen (Admin)
// Reusable for both Add and Edit book operations.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { booksApi } from '../../api/booksApi';
import { categoriesApi } from '../../api/categoriesApi';
import { uploadApi } from '../../api/uploadApi';
import { getImageUrl } from '../../api/client';
import { Book, BookFormData } from '../../types/book';
import { Category } from '../../types/category';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import { Colors } from '../../theme/colors';
import {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../theme/spacing';

type RouteParams = {
  BookForm: {
    mode: 'add' | 'edit';
    book?: Book;
  };
};

const BookFormScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'BookForm'>>();
  const navigation = useNavigation<any>();
  const { mode, book } = route.params;
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [description, setDescription] = useState(book?.description || '');
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url || '');
  const [coverImage, setCoverImage] = useState(book?.cover_image || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    book?.category_id || null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err: any) {
        Alert.alert('Error', 'Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!author.trim()) {
      newErrors.author = 'Author is required';
    }
    if (!selectedCategoryId) {
      newErrors.category = 'Category is required';
    }
    if (!pdfUrl.trim()) {
      newErrors.pdf_url = 'PDF URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, author, selectedCategoryId, pdfUrl]);

  // Handle image selection & upload
  const handlePickImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 1200,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) {
        return;
      }

      const imageUri = result.assets[0].uri;
      setIsUploading(true);

      try {
        const uploadResult = await uploadApi.uploadCover(imageUri);
        setCoverImage(uploadResult.url || uploadResult.path);
        Alert.alert('Success', 'Cover image uploaded');
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open image picker');
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData: BookFormData = {
        title: title.trim(),
        author: author.trim(),
        category_id: selectedCategoryId!,
        description: description.trim() || undefined,
        cover_image: coverImage || undefined,
        pdf_url: pdfUrl.trim(),
      };

      if (isEdit && book) {
        await booksApi.update(book.id, formData);
        Alert.alert('Success', 'Book updated successfully');
      } else {
        await booksApi.create(formData);
        Alert.alert('Success', 'Book created successfully');
      }

      navigation.goBack();
    } catch (err: any) {
      const message = err.message || `Failed to ${isEdit ? 'update' : 'create'} book`;
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [
    title,
    author,
    description,
    pdfUrl,
    coverImage,
    selectedCategoryId,
    isEdit,
    book,
    validate,
    navigation,
  ]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Book' : 'Add New Book'}
        </Text>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
          {/* Cover Image */}
          <Text style={styles.sectionLabel}>Cover Image</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handlePickImage}
            disabled={isUploading}
            activeOpacity={0.8}>
            {isUploading ? (
              <LoadingState message="Uploading..." size="small" />
            ) : coverImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: getImageUrl(coverImage) || coverImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Text style={styles.changeImageText}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>
                  Tap to select cover image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form Fields */}
          <FormField
            label="Title"
            placeholder="Enter book title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
          />

          <FormField
            label="Author"
            placeholder="Enter author name"
            value={author}
            onChangeText={setAuthor}
            error={errors.author}
            required
          />

          {/* Category Picker */}
          <Text style={styles.sectionLabel}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryOption,
                  selectedCategoryId === cat.id &&
                  styles.categoryOptionActive,
                ]}
                onPress={() => {
                  setSelectedCategoryId(cat.id);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.categoryOptionText,
                    selectedCategoryId === cat.id &&
                    styles.categoryOptionTextActive,
                  ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField
            label="PDF URL"
            placeholder="https://example.com/book.pdf"
            value={pdfUrl}
            onChangeText={setPdfUrl}
            keyboardType="url"
            error={errors.pdf_url}
            required
          />

          <FormField
            label="Description"
            placeholder="Enter book description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {/* Submit Button */}
          {isLoading ? (
            <LoadingState
              message={isEdit ? 'Updating...' : 'Creating...'}
              size="small"
            />
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Book' : 'Add Book'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  required: {
    color: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  imagePickerButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    minHeight: 150,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  imagePlaceholderIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  changeImageText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    padding: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryOption: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  categoryOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  categoryOptionTextActive: {
    color: Colors.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.small,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});

export default BookFormScreen;
