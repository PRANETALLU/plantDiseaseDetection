// App.js
import React from 'react';
import { UserAuthProvider } from './context/UserContext';  // Import the UserAuthProvider
import RootNavigator from './RootNavigator';  // Import the RootNavigator

const App = () => {
  return (
    <UserAuthProvider>
      <RootNavigator />
    </UserAuthProvider>
  );
};

export default App;
