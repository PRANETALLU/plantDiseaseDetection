import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { supabase } from '../supabaseClient';
import { useUserAuth } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ScanImage = () => {
    const [image, setImage] = useState(null);
    const [disease, setDisease] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useUserAuth();
    const navigation = useNavigation();
    const scaleAnim = new Animated.Value(1);

    const imagePickerOptions = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
    };

    const pickFromGallery = () => {
        launchImageLibrary(imagePickerOptions, (response) => {
            if (response.didCancel || response.errorMessage) {
                return;
            }
            const selectedImage = response.assets[0];
            setImage(selectedImage);
            setDisease(null);
        });
    };

    const pickFromCamera = () => {
        launchCamera(imagePickerOptions, (response) => {
            if (response.didCancel || response.errorMessage) {
                return;
            }
            const selectedImage = response.assets[0];
            setImage(selectedImage);
            setDisease(null);
        });
    };

    const detectDisease = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image first!');
            return;
        }

        setLoading(true);
        
        // Animation for scan effect
        Animated.sequence([
            Animated.timing(scaleAnim, { duration: 200, toValue: 0.95, useNativeDriver: true }),
            Animated.timing(scaleAnim, { duration: 200, toValue: 1, useNativeDriver: true }),
        ]).start();

        try {
            const response = await fetch('http://127.0.0.1:8000/predict/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_uri: image.uri }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setDisease(data.predicted_class);

            console.log('Diagnosis Test', data)

            // Save to Supabase
            try {
                await supabase.from('scans').insert([{
                    user_id: user.id,
                    scan_date: new Date().toISOString(),
                    image_uri: image.uri,
                    diagnosis: data.predicted_class
                }]);
            } catch (dbError) {
                console.log('Database save failed:', dbError);
            }
        } catch (error) {
            console.error('Error detecting disease:', error);
            Alert.alert('Error', 'Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setImage(null);
        setDisease(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    icon="arrow-left"
                    labelStyle={styles.backButtonText}
                    style={styles.backButton}
                >
                    Back
                </Button>
                <Text style={styles.headerTitle}>Plant Disease Scanner</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Scan Area */}
                <Card style={styles.scanCard}>
                    <Card.Content style={styles.scanCardContent}>
                        {!image ? (
                            <View style={styles.emptyImageContainer}>
                                <View style={styles.emptyImageContent}>
                                    <Icon name="add-a-photo" size={60} color="#4CAF50" />
                                    <Text style={styles.emptyImageText}>
                                        Select an image to analyze
                                    </Text>
                                    <Text style={styles.emptyImageSubtext}>
                                        Choose from gallery or take a photo
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Animated.View style={[styles.imageContainer, { transform: [{ scale: scaleAnim }] }]}>
                                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                                <Button
                                    mode="text"
                                    onPress={resetScan}
                                    icon="close"
                                    style={styles.removeImageButton}
                                    labelStyle={styles.removeImageText}
                                >
                                    Remove
                                </Button>
                            </Animated.View>
                        )}
                    </Card.Content>
                </Card>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {!image && (
                        <View style={styles.imagePickerButtons}>
                            <Button
                                mode="contained"
                                onPress={pickFromGallery}
                                icon="image"
                                style={[styles.actionButton, styles.galleryButton]}
                                labelStyle={styles.buttonText}
                            >
                                Gallery
                            </Button>
                            <Button
                                mode="contained"
                                onPress={pickFromCamera}
                                icon="camera"
                                style={[styles.actionButton, styles.cameraButton]}
                                labelStyle={styles.buttonText}
                            >
                                Camera
                            </Button>
                        </View>
                    )}

                    {image && !disease && (
                        <Button
                            mode="contained"
                            onPress={detectDisease}
                            icon="search"
                            loading={loading}
                            disabled={loading}
                            style={[styles.analyzeButton, loading && styles.disabledButton]}
                            labelStyle={styles.analyzeButtonText}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                    )}
                </View>

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>
                            AI is analyzing your plant image...
                        </Text>
                    </View>
                )}

                {/* Results */}
                {disease && (
                    <Card style={styles.resultCard}>
                        <Card.Content>
                            <View style={styles.resultHeader}>
                                <Icon name="assignment" size={24} color="#4CAF50" />
                                <Text style={styles.resultTitle}>Analysis Complete</Text>
                            </View>
                            <View style={styles.resultContent}>
                                <Text style={styles.resultLabel}>Diagnosis:</Text>
                                <Text style={styles.diseaseText}>{disease}</Text>
                            </View>
                            <View style={styles.resultActions}>
                                <Button
                                    mode="outlined"
                                    onPress={resetScan}
                                    icon="refresh"
                                    style={styles.secondaryButton}
                                >
                                    Scan Again
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('Disease Library')}
                                    icon="menu-book"
                                    style={styles.primaryButton}
                                >
                                    Learn More
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Instructions */}
                <Card style={styles.instructionsCard}>
                    <Card.Content>
                        <Text style={styles.instructionsTitle}>📋 Scanning Tips</Text>
                        <View style={styles.instructionsList}>
                            <Text style={styles.instructionItem}>• Ensure good lighting conditions</Text>
                            <Text style={styles.instructionItem}>• Focus on affected plant parts</Text>
                            <Text style={styles.instructionItem}>• Keep the camera steady</Text>
                            <Text style={styles.instructionItem}>• Capture clear, close-up images</Text>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        elevation: 2,
    },
    backButton: {
        marginLeft: -8,
    },
    backButtonText: {
        color: '#4CAF50',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E2E2E',
    },
    placeholder: {
        width: 60,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    scanCard: {
        marginBottom: 20,
        borderRadius: 16,
        elevation: 4,
    },
    scanCardContent: {
        padding: 20,
    },
    emptyImageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    emptyImageContent: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 250,
    },
    emptyImageText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyImageSubtext: {
        fontSize: 14,
        color: '#757575',
        marginTop: 8,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
    },
    selectedImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 12,
    },
    removeImageButton: {
        alignSelf: 'flex-end',
    },
    removeImageText: {
        color: '#F44336',
        fontSize: 14,
    },
    actionButtons: {
        marginBottom: 20,
    },
    imagePickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 25,
        elevation: 3,
    },
    galleryButton: {
        backgroundColor: '#2196F3',
    },
    cameraButton: {
        backgroundColor: '#FF9800',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        paddingVertical: 8,
    },
    analyzeButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        elevation: 6,
        paddingVertical: 6,
    },
    analyzeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        paddingVertical: 8,
    },
    disabledButton: {
        backgroundColor: '#A5D6A7',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 30,
    },
    loadingText: {
        fontSize: 16,
        color: '#4CAF50',
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    resultCard: {
        marginBottom: 20,
        borderRadius: 16,
        elevation: 6,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E2E2E',
        marginLeft: 8,
    },
    resultContent: {
        marginBottom: 20,
    },
    resultLabel: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8,
        fontWeight: '500',
    },
    diseaseText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
    },
    resultActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        flex: 1,
        borderRadius: 12,
    },
    secondaryButton: {
        borderColor: '#4CAF50',
        flex: 1,
        borderRadius: 12,
    },
    instructionsCard: {
        borderRadius: 16,
        elevation: 2,
        backgroundColor: '#F8F9FA',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E2E2E',
        marginBottom: 12,
    },
    instructionsList: {
        paddingLeft: 8,
    },
    instructionItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        lineHeight: 20,
    },
});

export default ScanImage;