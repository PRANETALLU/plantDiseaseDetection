import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUserAuth } from '../context/UserContext';
import Header from '../components/Header';
import CardComponent from '../components/CardComponent';

const HomePage = () => {
  const { user } = useUserAuth();

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>
          Welcome, {user ? user.email : 'Guest'}!
        </Text>

        <View style={styles.cardContainer}>
          <CardComponent route="Scan Image" icon="camera" text="Scan Plant Disease" />
          <CardComponent route="Disease Library" icon="book-open" text="Disease Library" />
          <CardComponent route="History Page" icon="history" text="My History" />
          <CardComponent route="Crop Care Tips" icon="leaf" text="Crop Care Tips" />
          <CardComponent route="Community Forum" icon="forum" text="Community Forum" />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
    justifyContent: 'center'
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4CAF50',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Ensures cards are spaced out
    marginBottom: 20, // Optional: Adjust to add spacing between the last row and the bottom
  },
  card: {
    width: '48%', // Ensures two cards fit on the same row with space between them
    marginBottom: 15,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 10,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 10,
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 50,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2E7D32',
  },
});

export default HomePage;
