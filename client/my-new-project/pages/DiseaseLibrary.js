import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const DiseaseLibrary = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // API Key (Replace with your actual key from Plant.id API)
  const API_KEY = 'lblctTMwHGetHOBT1PlL2iTfLquFePzH2xU3I0OczaFG6D4wM8';

  // Fetch diseases from the API
  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://api.plant.id/v2/diseases', {
        headers: {
          'Api-Key': API_KEY,
        },
      });
      setDiseases(response.data); // Set the disease data
    } catch (err) {
      setError('Error fetching diseases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        Alert.alert(
          item.name,
          `Description: ${item.description || 'No description available.'}\n\nSymptoms: ${item.symptoms || 'Not specified.'
          }`,
          [{ text: 'OK' }]
        )
      }
    >
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.diseaseName}>{item.name}</Text>
        <Text style={styles.diseaseInfo}>{item.symptoms || 'Symptoms not available'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        icon="arrow-left"
        style={styles.backButton}
        labelStyle={styles.backButtonText}
      >
        Go Back
      </Button>
      <Text style={styles.title}>Disease Library</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : diseases.length > 0 ? (
        <FlatList
          data={diseases}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyMessage}>No diseases found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 10,
    marginTop: 30
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: '#E53935',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  diseaseInfo: {
    fontSize: 14,
    color: '#757575',
  },
});

export default DiseaseLibrary;
