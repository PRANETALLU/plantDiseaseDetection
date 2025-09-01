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

  const API_KEY = 'sk-GNez68abe59656e6112015'; // replace with your actual Perenual key

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);

    try {
      // fetch first page of diseases
      const response = await axios.get(
        `https://perenual.com/api/pest-disease-list?key=${API_KEY}&page=1`
      );

      if (response.data && response.data.data) {
        const diseaseList = response.data.data.map((disease) => ({
          id: disease.id,
          name: disease.common_name || 'Unknown Disease',
          description: disease.description || 'No description available.',
          image_url:
            disease.default_image?.medium_url || 'https://via.placeholder.com/150',
        }));

        setDiseases(diseaseList);
      } else {
        setError('No disease data found.');
      }
    } catch (err) {
      console.error(err);
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
        Alert.alert(item.name, `Description: ${item.description}`, [{ text: 'OK' }])
      }
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.diseaseName}>{item.name}</Text>
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
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 10, marginTop: 30 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
    textAlign: 'center',
  },
  loader: { marginTop: 20 },
  error: { color: '#E53935', textAlign: 'center', fontSize: 16, marginTop: 20 },
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
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  cardContent: { flex: 1, justifyContent: 'center' },
  diseaseName: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  backButton: { marginBottom: 10 },
});

export default DiseaseLibrary;
