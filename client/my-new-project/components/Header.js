import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserAuth } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Expo icons for better visuals

const Header = () => {
  const { user, logOut } = useUserAuth(); // Access user state from context
  const navigation = useNavigation(); // Access navigation from React Navigation

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.logoText}>PlantDetect</Text>

      <View style={styles.buttonContainer}>
        {user ? (
          <TouchableOpacity style={styles.headerButton} onPress={logOut}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.headerButton, styles.signupButton]}
              onPress={() => navigation.navigate('Signup')}
            >
              <Ionicons name="person-add-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Green header background for a plant theme
    padding: 15,
  },
  logoText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C', // Slightly darker green for buttons
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#FFC107', // Highlight Sign Up button with a yellow color
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default Header;
