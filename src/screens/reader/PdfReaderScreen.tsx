// Minhaj Digital Library — PDF Reader Screen
// Uses WebView as a fallback PDF viewer with loading/error states.
// react-native-pdf can be swapped in if native module compatibility is verified.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { Colors } from '../../theme/colors';
import {
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../../theme/spacing';

type RouteParams = {
  PdfReader: { pdfUrl: string; title: string };
};

// Extracts the file ID from Google Drive share links, e.g.
// https://drive.google.com/file/d/<id>/view, .../open?id=<id>, .../uc?id=<id>
const getGoogleDriveFileId = (url: string): string | null => {
  if (!/drive\.google\.com|docs\.google\.com/.test(url)) {
    return null;
  }
  const match = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  return match ? match[1] : null;
};

const getViewerUrl = (pdfUrl: string): string => {
  // Drive share links point to an HTML page, not the PDF itself,
  // so use Drive's own embedded preview for them.
  const driveFileId = getGoogleDriveFileId(pdfUrl);
  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }
  // Use Google Docs Viewer as a reliable cross-platform PDF renderer
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
};

const PdfReaderScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'PdfReader'>>();
  const navigation = useNavigation();
  const { pdfUrl, title } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const viewerUrl = getViewerUrl(pdfUrl);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
  }, []);

  const handleOpenExternal = useCallback(() => {
    Linking.openURL(pdfUrl).catch(() => { });
  }, [pdfUrl]);

  if (hasError) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <ErrorState
          message="Unable to load the PDF. The file may be unavailable or the URL is invalid."
          onRetry={handleRetry}
          fullScreen
        />
        <View style={styles.externalContainer}>
          <TouchableOpacity
            style={styles.externalButton}
            onPress={handleOpenExternal}
            activeOpacity={0.8}>
            <Text style={styles.externalButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* PDF Viewer */}
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scalesPageToFit
        allowFileAccess
        allowFileAccessFromFileURLs
        mixedContentMode="compatibility"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingState message={`Loading "${title}"...`} />
        </View>
      )}

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.bottomButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pdfTitle} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleOpenExternal}
          activeOpacity={0.7}>
          <Text style={styles.bottomButtonText}>External ↗</Text>
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
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  bottomButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySurface,
  },
  bottomButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  pdfTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  externalContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  externalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  externalButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

export default PdfReaderScreen;
