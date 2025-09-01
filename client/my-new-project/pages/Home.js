import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUserAuth } from '../context/UserContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomePage = () => {
  const { user } = useUserAuth();
  const navigation = useNavigation(); 

  const cardData = [
    { route: "Scan Image", icon: "camera-alt", text: "Scan Plant Disease", color: '#4CAF50', bgColor: '#E8F5E9' },
    { route: "Disease Library", icon: "menu-book", text: "Disease Library", color: '#2196F3', bgColor: '#E3F2FD' },
    { route: "History Page", icon: "history", text: "My History", color: '#FF9800', bgColor: '#FFF3E0' },
    { route: "Crop Care Tips", icon: "eco", text: "Crop Care Tips", color: '#9C27B0', bgColor: '#F3E5F5' },
    { route: "Community Forum", icon: "forum", text: "Community Forum", color: '#F44336', bgColor: '#FFEBEE' },
  ];

  const renderCard = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.cardWrapper}
      onPress={() => navigation.navigate(item.route)} // <-- navigation here
    >
      <View style={[styles.card, { backgroundColor: item.bgColor }]}>
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={28} color="#ffffff" />
          </View>
          <Text style={[styles.cardText, { color: item.color }]}>{item.text}</Text>
          <View style={styles.cardArrow}>
            <Icon name="arrow-forward-ios" size={16} color={item.color} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Hello!</Text>
              <Text style={styles.greeting}>
                {user ? user.email.split('@')[0] : 'Guest'}
              </Text>
              <Text style={styles.welcomeSubtext}>
                Ready to protect your plants today?
              </Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Icon name="agriculture" size={40} color="#4CAF50" />
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Choose what you'd like to do</Text>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsContainer}>
          {cardData.map((item, index) => renderCard(item, index))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Plant Care Journey</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="scan-camera" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Scans Today</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="local-hospital" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Diseases Detected</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="eco" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Plants Saved</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  welcomeSection: {
    margin: 20,
    marginTop: 10,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  welcomeCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    marginBottom: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  welcomeIcon: {
    opacity: 0.8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '400',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  cardArrow: {
    marginTop: 8,
    opacity: 0.7,
  },
  statsSection: {
    margin: 20,
    marginTop: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginTop: 8,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomePage;