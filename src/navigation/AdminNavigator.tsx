// Minhaj Digital Library — Admin Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ManageBooksScreen from '../screens/admin/ManageBooksScreen';
import BookFormScreen from '../screens/admin/BookFormScreen';
import ManageCategoriesScreen from '../screens/admin/ManageCategoriesScreen';
import LibraryScreen from '../screens/reader/LibraryScreen';
import BookDetailsScreen from '../screens/reader/BookDetailsScreen';
import PdfReaderScreen from '../screens/reader/PdfReaderScreen';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const AdminNavigator: React.FC = () => {
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
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageBooks"
        component={ManageBooksScreen}
        options={{ title: 'Manage Books', headerShown: false }}
      />
      <Stack.Screen
        name="BookForm"
        component={BookFormScreen}
        options={({ route }: any) => ({
          title:
            route.params?.mode === 'edit' ? 'Edit Book' : 'Add Book',
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ title: 'Categories', headerShown: false }}
      />
      <Stack.Screen
        name="ReaderLibrary"
        component={LibraryScreen}
        options={{ title: 'Browse Library', headerShown: false }}
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
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
