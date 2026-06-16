// App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserAuthProvider } from './context/UserContext';
import RootNavigator from './RootNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <UserAuthProvider>
        <RootNavigator />
      </UserAuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
