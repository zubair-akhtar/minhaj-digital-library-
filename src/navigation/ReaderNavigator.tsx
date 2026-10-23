// Minhaj Digital Library — Reader Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../screens/reader/LibraryScreen';
import BookDetailsScreen from '../screens/reader/BookDetailsScreen';
import PdfReaderScreen from '../screens/reader/PdfReaderScreen';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const ReaderNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Library"
        component={LibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={({ route }: any) => ({
          title: route.params?.title || 'Book Details',
        })}
      />
      <Stack.Screen
        name="PdfReader"
        component={PdfReaderScreen}
        options={({ route }: any) => ({
          title: route.params?.title || 'PDF Reader',
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default ReaderNavigator;
