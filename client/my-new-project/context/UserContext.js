// UserContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { supabase } from '../supabaseClient'; // Ensure the path to your supabase client is correct

// Create a context for user authentication
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUserAuth = () => useContext(UserContext);

// UserAuthProvider component to wrap around your application
export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store the current user
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    console.log('Initializing Supabase auth listener...');

    // Fetch the initial session when the component mounts
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('Session fetched:', session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Function to handle user sign-up
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Function to handle user sign-in
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Function to handle user log-out
  const logOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Provide the user data and authentication methods to the context
  return (
    <UserContext.Provider value={{ user, signUp, signIn, logOut }}>
      {!loading ? children : <Text>Loading...</Text>} {/* Show a loading indicator if needed */}
    </UserContext.Provider>
  );
};