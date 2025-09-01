import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const WelcomePage = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.title}>Plant Disease Detector</Text>
              <View style={styles.divider} />
              <Text style={styles.subtitle}>
                Scan plants, identify diseases, and get tailored solutions for a healthier harvest
              </Text>
              <Text style={styles.description}>
                Powered by AI technology to help farmers and gardeners protect their crops
              </Text>
            </View>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>📱</Text>
                </View>
                <Text style={styles.featureText}>Instant Scanning</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>🔬</Text>
                </View>
                <Text style={styles.featureText}>AI Diagnosis</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>💡</Text>
                </View>
                <Text style={styles.featureText}>Smart Solutions</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.getStartedButton}>
              <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Get Started</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    color: '#E8F5E9',
    fontWeight: '300',
    marginBottom: 5,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#E8F5E9',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    color: '#E8F5E9',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  getStartedButton: {
    width: width * 0.6,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
  },
  backButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default WelcomePage;