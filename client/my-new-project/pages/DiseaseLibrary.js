import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const diseaseData = [
  { id: 1, name: 'Tomato Blight', plantType: 'Tomato', symptoms: 'Brown spots on leaves' },
  { id: 2, name: 'Wheat Rust', plantType: 'Wheat', symptoms: 'Reddish-orange pustules on leaves' },
  { id: 3, name: 'Rice Blast', plantType: 'Rice', symptoms: 'Gray lesions with dark borders' },
  { id: 4, name: 'Late Blight', plantType: 'Tomato', symptoms: 'Blackened stems and leaves' },
];

const DiseaseLibrary = () => {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  // Filter diseases based on search text
  const filteredDiseases = diseaseData.filter(
    (disease) =>
      disease.name.toLowerCase().includes(searchText.toLowerCase()) ||
      disease.symptoms.toLowerCase().includes(searchText.toLowerCase())
  );

  // Group diseases by plant type
  const groupedDiseases = filteredDiseases.reduce((grouped, disease) => {
    const { plantType } = disease;
    if (!grouped[plantType]) {
      grouped[plantType] = [];
    }
    grouped[plantType].push(disease);
    return grouped;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disease Library</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search diseases by name or symptoms"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Categorized List */}
      <FlatList
        data={Object.keys(groupedDiseases)}
        keyExtractor={(item) => item}
        renderItem={({ item: plantType }) => (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{plantType}</Text>
            {groupedDiseases[plantType].map((disease) => (
              <TouchableOpacity
                key={disease.id}
                style={styles.diseaseItem}
                onPress={() => navigation.navigate('DiseaseDetails', { disease })}
              >
                <Text style={styles.diseaseName}>{disease.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 8,
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 8,
  },
  diseaseItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 16,
    color: '#2E7D32',
  },
});

export default DiseaseLibrary;
