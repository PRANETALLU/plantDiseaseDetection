import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, StatusBar, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUserAuth } from '../context/UserContext';

const SignupPage = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useUserAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signUp(formData.email, formData.password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1526045431048-2cf8f4d3b1e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        }}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.overlay}>
              <View style={styles.container}>
                {/* Header with Back Button */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                  >
                    <Icon name="arrow-back" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>

                {/* Brand Section */}
                <View style={styles.brandSection}>
                  <View style={styles.logoContainer}>
                    <Icon name="eco" size={40} color="#4CAF50" />
                  </View>
                  <Text style={styles.brandName}>Join PlantCare</Text>
                  <Text style={styles.brandTagline}>Start protecting your plants with AI</Text>
                </View>

                {/* Signup Form */}
                <View style={styles.formContainer}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Fill in your details to get started</Text>
                  
                  <View style={styles.inputContainer}>
                    <Icon name="person" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full name"
                      placeholderTextColor="#A5A5A5"
                      value={formData.name}
                      onChangeText={(value) => updateFormData('name', value)}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon name="email" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#A5A5A5"
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon name="lock" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password (min 6 characters)"
                      placeholderTextColor="#A5A5A5"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon 
                        name={showPassword ? "visibility" : "visibility-off"} 
                        size={20} 
                        color="#757575" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor="#A5A5A5"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon 
                        name={showConfirmPassword ? "visibility" : "visibility-off"} 
                        size={20} 
                        color="#757575" 
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={[styles.signupButton, loading && styles.disabledButton]} 
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    <Text style={styles.signupButtonText}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By signing up, you agree to our Terms of Service and Privacy Policy
                    </Text>
                  </View>
                </View>

                {/* Login Link */}
                <View style={styles.loginSection}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 6,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    marginVertical: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#2E2E2E',
  },
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    elevation: 2,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  termsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    marginTop: 20,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  loginLink: {
    color: '#81C784',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignupPage;