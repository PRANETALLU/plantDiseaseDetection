import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const DiseaseLibrary = () => {
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('all');
  const navigation = useNavigation();

  const PERENUAL_API_KEY = 'sk-GNez68abe59656e6112015';

  const categories = [
    { key: 'all', label: 'All', color: '#4CAF50' },
    { key: 'fungal', label: 'Fungal', color: '#FF9800' },
    { key: 'bacterial', label: 'Bacterial', color: '#2196F3' },
    { key: 'pest', label: 'Pest', color: '#F44336' },
  ];

  const categorizeDisease = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('rust') || lower.includes('mildew') || lower.includes('blight')) return 'fungal';
    if (lower.includes('bacterial') || lower.includes('wilt')) return 'bacterial';
    if (lower.includes('aphid') || lower.includes('mite') || lower.includes('pest')) return 'pest';
    return 'other';
  };

  const getSeverity = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('blight') || lower.includes('wilt') || lower.includes('virus')) return 'High';
    if (lower.includes('mildew') || lower.includes('aphid')) return 'Medium';
    return 'Low';
  };

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://perenual.com/api/pest-disease-list?key=${PERENUAL_API_KEY}&page=1&per_page=20`
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.data) {
          const enhancedDiseases = data.data.map(disease => ({
            id: disease.id,
            name: disease.common_name || 'Unknown Disease',
            scientific_name: disease.scientific_name || '',
            category: categorizeDisease(disease.common_name || ''),
            description: disease.description || 'No description available.',
            image_url: disease.default_image?.medium_url || 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400',
            severity: getSeverity(disease.common_name || ''),
            symptoms: ['Check detailed information for symptoms'],
            prevention: ['Follow general plant care guidelines'],
            treatment: ['Consult agricultural specialist for treatment']
          }));
          setDiseases(enhancedDiseases);
          setFilteredDiseases(enhancedDiseases);
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      // Fallback data
      const fallbackData = [
        {
          id: 1, name: 'Tomato Late Blight', scientific_name: 'Phytophthora infestans',
          category: 'fungal', severity: 'High',
          description: 'Destructive fungal disease affecting tomato plants.',
          image_url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400',
          symptoms: ['Dark spots on leaves', 'Water-soaked lesions', 'Fruit rot'],
          prevention: ['Good air circulation', 'Avoid overhead watering'],
          treatment: ['Remove affected parts', 'Apply fungicides']
        },
        {
          id: 2, name: 'Powdery Mildew', scientific_name: 'Erysiphe cichoracearum',
          category: 'fungal', severity: 'Medium',
          description: 'Common fungal disease with white powdery coating.',
          image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
          symptoms: ['White powdery coating', 'Yellowing leaves'],
          prevention: ['Adequate air circulation', 'Avoid overcrowding'],
          treatment: ['Baking soda solution', 'Neem oil']
        }
      ];
      setDiseases(fallbackData);
      setFilteredDiseases(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    let filtered = diseases;
    if (category !== 'all') {
      filtered = filtered.filter(d => d.category === category);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredDiseases(filtered);
  }, [searchQuery, category, diseases]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Library</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDiseases}>
          <Icon name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search diseases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryButton,
              category === cat.key && { backgroundColor: cat.color }
            ]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={[
              styles.categoryButtonText,
              category === cat.key && { color: '#FFFFFF' }
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading diseases...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDiseases}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.diseaseCard}
              onPress={() => {
                setSelectedDisease(item);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.image_url }} style={styles.diseaseImage} />
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                <Text style={styles.severityText}>{item.severity}</Text>
              </View>
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseName}>{item.name}</Text>
                <Text style={styles.scientificName}>{item.scientific_name}</Text>
                <Text style={styles.diseaseDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="arrow-back" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Disease Details</Text>
          </View>

          {selectedDisease && (
            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedDisease.image_url }} style={styles.modalImage} />
              <View style={styles.modalDetails}>
                <Text style={styles.modalDiseaseName}>{selectedDisease.name}</Text>
                <Text style={styles.modalScientificName}>{selectedDisease.scientific_name}</Text>
                <Text style={styles.modalDescription}>{selectedDisease.description}</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Symptoms</Text>
                  {selectedDisease.symptoms?.map((symptom, index) => (
                    <Text key={index} style={styles.listItem}>• {symptom}</Text>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Prevention</Text>
                  {selectedDisease.prevention?.map((tip, index) => (
                    <Text key={index} style={styles.listItem}>• {tip}</Text>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Treatment</Text>
                  {selectedDisease.treatment?.map((treatment, index) => (
                    <Text key={index} style={styles.listItem}>• {treatment}</Text>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 50, paddingBottom: 16, backgroundColor: '#FFFFFF', elevation: 2
  },
  backButton: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E2E2E', flex: 1 },
  refreshButton: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center'
  },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    borderRadius: 25, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0'
  },
  searchInput: { flex: 1, fontSize: 16, color: '#2E2E2E', marginLeft: 10 },
  categoriesContainer: { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  categoryButton: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10,
    borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF'
  },
  categoryButtonText: { fontSize: 14, fontWeight: '600', color: '#757575' },
  listContainer: { padding: 20 },
  row: { justifyContent: 'space-between' },
  diseaseCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 3,
    marginBottom: 15, width: (width - 50) / 2, overflow: 'hidden'
  },
  diseaseImage: { width: '100%', height: 120, backgroundColor: '#F0F0F0' },
  severityBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10
  },
  severityText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  diseaseInfo: { padding: 12 },
  diseaseName: { fontSize: 14, fontWeight: 'bold', color: '#2E2E2E', marginBottom: 4 },
  scientificName: { fontSize: 11, fontStyle: 'italic', color: '#757575', marginBottom: 8 },
  diseaseDescription: { fontSize: 12, color: '#555555', lineHeight: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#757575', marginTop: 15 },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 50, paddingBottom: 16, backgroundColor: '#FFFFFF', elevation: 2
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E2E2E', marginLeft: 15 },
  modalContent: { flex: 1 },
  modalImage: { width: '100%', height: 200, backgroundColor: '#F0F0F0' },
  modalDetails: { padding: 20 },
  modalDiseaseName: { fontSize: 24, fontWeight: 'bold', color: '#2E2E2E', marginBottom: 5 },
  modalScientificName: { fontSize: 16, fontStyle: 'italic', color: '#757575', marginBottom: 15 },
  modalDescription: { fontSize: 16, color: '#555555', lineHeight: 22, marginBottom: 25 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E2E2E', marginBottom: 10 },
  listItem: { fontSize: 14, color: '#555555', lineHeight: 20, marginBottom: 5 },
});

export default DiseaseLibrary;