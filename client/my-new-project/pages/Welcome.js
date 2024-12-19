import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Header from '../components/Header';

const WelcomePage = () => {
  return (
    <>
      <Header />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }} // Replace with your image URL
        style={styles.background}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to Plant Disease Detector</Text>
          <Text style={styles.subtitle}>
            Scan plants, identify diseases, and get tailored solutions for a healthier harvest!
          </Text>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Adds a semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#dcdcdc',
    textAlign: 'center',
  },
});

export default WelcomePage;
