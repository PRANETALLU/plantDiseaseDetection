import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserAuth } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const { user, logOut } = useUserAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingBottom: 14,
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
    backgroundColor: '#388E3C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#FFC107',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
  },
});

export default Header;
