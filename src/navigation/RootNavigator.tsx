// Minhaj Digital Library — Root Navigator
// Switches between Auth, Reader, and Admin flows based on authentication state.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import ReaderNavigator from './ReaderNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingState from '../components/LoadingState';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <ReaderNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
