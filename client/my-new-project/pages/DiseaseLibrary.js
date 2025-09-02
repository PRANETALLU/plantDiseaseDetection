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
  Dimensions,
  Animated,
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
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);

  const PERENUAL_API_KEY = 'sk-GNez68abe59656e6112015';

  const categories = [
    { key: 'all', label: 'All Diseases', icon: 'eco', color: '#4CAF50' },
    { key: 'fungal', label: 'Fungal', icon: 'spa', color: '#FF9800' },
    { key: 'bacterial', label: 'Bacterial', icon: 'bug-report', color: '#2196F3' },
    { key: 'viral', label: 'Viral', icon: 'coronavirus', color: '#9C27B0' },
    { key: 'pest', label: 'Pest', icon: 'pest-control', color: '#F44336' },
  ];

  const categorizeDisease = (name, description = '') => {
    const text = (name + ' ' + description).toLowerCase();
    if (text.includes('rust') || text.includes('mildew') || text.includes('fungal') || text.includes('blight')) return 'fungal';
    if (text.includes('bacterial') || text.includes('bacteria')) return 'bacterial';
    if (text.includes('virus') || text.includes('viral') || text.includes('mosaic')) return 'viral';
    if (text.includes('aphid') || text.includes('mite') || text.includes('pest') || text.includes('insect')) return 'pest';
    return 'fungal'; // Default fallback
  };

  const getSeverity = (name, description = '') => {
    const text = (name + ' ' + description).toLowerCase();
    if (text.includes('blight') || text.includes('wilt') || text.includes('virus') || text.includes('canker')) return 'High';
    if (text.includes('mildew') || text.includes('spot') || text.includes('aphid')) return 'Medium';
    return 'Low';
  };

  const generateSymptoms = (name, category) => {
    const baseSymptoms = {
      fungal: ['White/gray powdery coating', 'Dark spots on leaves', 'Yellowing foliage', 'Stunted growth'],
      bacterial: ['Water-soaked lesions', 'Wilting', 'Leaf yellowing', 'Stem discoloration'],
      viral: ['Mosaic patterns on leaves', 'Stunted growth', 'Distorted leaves', 'Color breaking'],
      pest: ['Visible insects', 'Leaf damage', 'Holes in leaves', 'Sticky honeydew']
    };
    return baseSymptoms[category] || baseSymptoms.fungal;
  };

  const generateTreatment = (category) => {
    const treatments = {
      fungal: ['Remove affected parts', 'Apply fungicide spray', 'Improve air circulation', 'Avoid overhead watering'],
      bacterial: ['Remove infected tissue', 'Apply copper-based bactericide', 'Improve drainage', 'Sterilize tools'],
      viral: ['Remove infected plants', 'Control insect vectors', 'Use resistant varieties', 'Maintain plant health'],
      pest: ['Apply insecticidal soap', 'Use beneficial insects', 'Remove pests manually', 'Apply neem oil']
    };
    return treatments[category] || treatments.fungal;
  };

  const fetchDiseases = async () => {
    setLoading(true);
    setRefreshing(true);
    
    try {
      const response = await fetch(
        `https://perenual.com/api/pest-disease-list?key=${PERENUAL_API_KEY}&page=1&per_page=30`
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.data && data.data.length > 0) {
          const enhancedDiseases = data.data.map(disease => {
            // Safely extract description - handle if it's an object or string
            let description = 'A plant disease that affects crop health and yield.';
            if (disease.description) {
              if (typeof disease.description === 'string') {
                description = disease.description;
              } else if (typeof disease.description === 'object') {
                // Handle object description - extract text from common fields
                description = disease.description.description || 
                             disease.description.subtitle || 
                             disease.description.text || 
                             'A plant disease that affects crop health and yield.';
              }
            }

            const category = categorizeDisease(disease.common_name || '', description);
            return {
              id: disease.id || Math.random(),
              name: disease.common_name || 'Unknown Disease',
              scientific_name: disease.scientific_name || '',
              category,
              description: String(description), // Ensure it's always a string
              image_url: disease.default_image?.medium_url || `https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&h=300&fit=crop`,
              severity: getSeverity(disease.common_name || '', description),
              symptoms: generateSymptoms(disease.common_name || '', category),
              prevention: [
                'Maintain proper plant spacing',
                'Ensure good air circulation',
                'Water at soil level',
                'Use disease-resistant varieties',
                'Practice crop rotation'
              ],
              treatment: generateTreatment(category)
            };
          });
          setDiseases(enhancedDiseases);
          setFilteredDiseases(enhancedDiseases);
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        } else {
          throw new Error('No data received');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log('API Error, using fallback data:', error);
      
      // Enhanced fallback data
      const fallbackData = [
        {
          id: 1, name: 'Tomato Late Blight', scientific_name: 'Phytophthora infestans',
          category: 'fungal', severity: 'High',
          description: 'A devastating fungal disease that causes rapid decay of tomato plants, leading to significant crop losses.',
          image_url: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&h=300&fit=crop',
          symptoms: ['Dark water-soaked spots on leaves', 'White moldy growth on leaf undersides', 'Brown lesions on stems', 'Fruit rot with dark patches'],
          prevention: ['Plant resistant varieties', 'Ensure good air circulation', 'Avoid overhead watering', 'Remove plant debris'],
          treatment: ['Remove affected parts immediately', 'Apply copper-based fungicides', 'Improve drainage', 'Destroy infected plants']
        },
        {
          id: 2, name: 'Powdery Mildew', scientific_name: 'Erysiphe cichoracearum',
          category: 'fungal', severity: 'Medium',
          description: 'Common fungal disease characterized by white powdery coating on plant surfaces.',
          image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
          symptoms: ['White powdery coating on leaves', 'Yellowing and wilting of leaves', 'Stunted growth', 'Reduced flowering'],
          prevention: ['Adequate air circulation', 'Avoid overcrowding plants', 'Water at soil level', 'Choose resistant varieties'],
          treatment: ['Baking soda spray solution', 'Neem oil application', 'Remove affected leaves', 'Improve air flow']
        },
        {
          id: 3, name: 'Bacterial Wilt', scientific_name: 'Ralstonia solanacearum',
          category: 'bacterial', severity: 'High',
          description: 'Serious bacterial disease causing sudden wilting and death of plants.',
          image_url: 'https://images.unsplash.com/photo-1574263867128-a4d7d80c0522?w=400&h=300&fit=crop',
          symptoms: ['Sudden wilting of plants', 'Yellowing of lower leaves', 'Brown vascular tissue', 'Plant collapse'],
          prevention: ['Use certified disease-free seeds', 'Practice crop rotation', 'Improve soil drainage', 'Sterilize tools'],
          treatment: ['Remove infected plants', 'Apply copper bactericides', 'Soil solarization', 'Use biological controls']
        },
        {
          id: 4, name: 'Aphid Infestation', scientific_name: 'Aphis gossypii',
          category: 'pest', severity: 'Medium',
          description: 'Small soft-bodied insects that feed on plant sap and can transmit viruses.',
          image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
          symptoms: ['Clusters of small green/black insects', 'Curled or distorted leaves', 'Sticky honeydew on plants', 'Yellowing foliage'],
          prevention: ['Encourage beneficial insects', 'Use reflective mulches', 'Regular plant inspection', 'Proper plant nutrition'],
          treatment: ['Insecticidal soap spray', 'Neem oil treatment', 'Ladybug release', 'Strong water spray']
        },
        {
          id: 5, name: 'Tobacco Mosaic Virus', scientific_name: 'Tobacco mosaic virus',
          category: 'viral', severity: 'High',
          description: 'Highly contagious viral disease affecting various crops, especially tomatoes and peppers.',
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
          symptoms: ['Mosaic pattern on leaves', 'Mottled yellow-green coloration', 'Stunted plant growth', 'Distorted leaf shape'],
          prevention: ['Use virus-free seeds', 'Control insect vectors', 'Sterilize hands and tools', 'Remove infected plants'],
          treatment: ['No cure available', 'Remove infected plants', 'Control aphid vectors', 'Plant resistant varieties']
        },
        {
          id: 6, name: 'Black Spot', scientific_name: 'Diplocarpon rosae',
          category: 'fungal', severity: 'Medium',
          description: 'Fungal disease primarily affecting roses, causing distinctive black spots on leaves.',
          image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
          symptoms: ['Black circular spots on leaves', 'Yellow halos around spots', 'Premature leaf drop', 'Weakened plant vigor'],
          prevention: ['Choose resistant varieties', 'Ensure good air circulation', 'Water at soil level', 'Clean up fallen leaves'],
          treatment: ['Fungicidal sprays', 'Remove affected foliage', 'Improve air circulation', 'Apply preventive treatments']
        }
      ];
      
      setDiseases(fallbackData);
      setFilteredDiseases(fallbackData);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.key === category);
    return cat?.icon || 'eco';
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiseases();
  };

  const renderDiseaseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.diseaseCard}
      onPress={() => {
        setSelectedDisease(item);
        setModalVisible(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.cardContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.diseaseImage} />
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{item.severity}</Text>
          </View>
          <View style={styles.categoryIcon}>
            <Icon name={getCategoryIcon(item.category)} size={16} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.diseaseInfo}>
          <Text style={styles.diseaseName} numberOfLines={2}>{String(item.name)}</Text>
          <Text style={styles.scientificName} numberOfLines={1}>{String(item.scientific_name)}</Text>
          <Text style={styles.diseaseDescription} numberOfLines={2}>
            {String(item.description)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Library</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search diseases, symptoms..."
            placeholderTextColor="#A5A5A5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.resultsCount}>
          {filteredDiseases.length} disease{filteredDiseases.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal style={styles.categoriesContainer} showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryButton,
              category === cat.key && { backgroundColor: cat.color }
            ]}
            onPress={() => setCategory(cat.key)}
          >
            <Icon 
              name={cat.icon} 
              size={18} 
              color={category === cat.key ? '#FFFFFF' : cat.color}
              style={styles.categoryIcon}
            />
            <Text style={[
              styles.categoryButtonText,
              category === cat.key && { color: '#FFFFFF' }
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Disease List */}
      {loading && diseases.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading disease library...</Text>
        </View>
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={filteredDiseases}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDiseaseCard}
            contentContainerStyle={styles.flatListContent}
            numColumns={2}
            columnWrapperStyle={styles.row}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={60} color="#E0E0E0" />
                <Text style={styles.emptyText}>No diseases found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      {/* Disease Detail Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="arrow-back" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Disease Details</Text>
            <View style={styles.modalHeaderRight}>
              <View style={[styles.modalSeverityBadge, { backgroundColor: getSeverityColor(selectedDisease?.severity) }]}>
                <Text style={styles.modalSeverityText}>{selectedDisease?.severity}</Text>
              </View>
            </View>
          </View>

          {selectedDisease && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedDisease.image_url }} style={styles.modalImage} />
              
              <View style={styles.modalDetails}>
                <View style={styles.diseaseHeader}>
                  <Text style={styles.modalDiseaseName}>{selectedDisease.name}</Text>
                  <Text style={styles.modalScientificName}>{selectedDisease.scientific_name}</Text>
                  <View style={styles.categoryTag}>
                    <Icon name={getCategoryIcon(selectedDisease.category)} size={16} color="#FFFFFF" />
                    <Text style={styles.categoryTagText}>{selectedDisease.category.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.modalDescription}>{selectedDisease.description}</Text>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="warning" size={20} color="#F44336" />
                    <Text style={styles.sectionTitle}>Symptoms</Text>
                  </View>
                  {selectedDisease.symptoms?.map((symptom, index) => (
                    <Text key={index} style={styles.listItem}>• {symptom}</Text>
                  ))}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="shield" size={20} color="#2196F3" />
                    <Text style={styles.sectionTitle}>Prevention</Text>
                  </View>
                  {selectedDisease.prevention?.map((tip, index) => (
                    <Text key={index} style={styles.listItem}>• {tip}</Text>
                  ))}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="healing" size={20} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Treatment</Text>
                  </View>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E2E2E', flex: 1 },
  refreshButton: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center'
  },
  searchSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 15 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    borderRadius: 25, paddingHorizontal: 15, paddingVertical: 12, 
    borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 10
  },
  searchInput: { flex: 1, fontSize: 16, color: '#2E2E2E', marginLeft: 10 },
  resultsCount: { fontSize: 12, color: '#757575', textAlign: 'center' },
  categoriesContainer: { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF'
  },
  categoryIcon: { marginRight: 6 },
  categoryButtonText: { fontSize: 14, fontWeight: '600', color: '#757575' },
  listContainer: { flex: 1 },
  flatListContent: { padding: 20 },
  row: { justifyContent: 'space-between' },
  diseaseCard: { width: (width - 50) / 2, marginBottom: 15 },
  cardContainer: { 
    borderRadius: 16, 
    elevation: 3, 
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden' 
  },
  imageContainer: { position: 'relative' },
  diseaseImage: { width: '100%', height: 120, backgroundColor: '#F0F0F0' },
  severityBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12
  },
  severityText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  categoryIcon: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
    padding: 4
  },
  diseaseInfo: { padding: 12 },
  diseaseName: { fontSize: 14, fontWeight: 'bold', color: '#2E2E2E', marginBottom: 4 },
  scientificName: { fontSize: 11, fontStyle: 'italic', color: '#757575', marginBottom: 8 },
  diseaseDescription: { fontSize: 12, color: '#555555', lineHeight: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#757575', marginTop: 15, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#E0E0E0', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#BDBDBD', textAlign: 'center', marginTop: 5 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, 
    backgroundColor: '#FFFFFF', elevation: 2
  },
  modalBackButton: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E2E2E', flex: 1, textAlign: 'center' },
  modalHeaderRight: { width: 45, alignItems: 'flex-end' },
  modalSeverityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  modalSeverityText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  modalContent: { flex: 1 },
  modalImage: { width: '100%', height: 220, backgroundColor: '#F0F0F0' },
  modalDetails: { padding: 20 },
  diseaseHeader: { marginBottom: 20 },
  modalDiseaseName: { fontSize: 24, fontWeight: 'bold', color: '#2E2E2E', marginBottom: 5 },
  modalScientificName: { fontSize: 16, fontStyle: 'italic', color: '#757575', marginBottom: 10 },
  categoryTag: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15
  },
  categoryTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  modalDescription: { fontSize: 16, color: '#555555', lineHeight: 22, marginBottom: 25 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E2E2E', marginLeft: 8 },
  listItem: { 
    fontSize: 14, color: '#555555', lineHeight: 20, marginBottom: 8,
    paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#E8F5E9'
  },
});

export default DiseaseLibrary;