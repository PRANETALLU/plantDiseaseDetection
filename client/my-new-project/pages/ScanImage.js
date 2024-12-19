import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../supabaseClient';
import { useUserAuth } from '../context/UserContext';

const ScanImage = () => {
    const [image, setImage] = useState(null);
    const [disease, setDisease] = useState(null);
    const { user } = useUserAuth();

    console.log('Image', image)

    const pickImage = async () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 1 },
            (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorMessage) {
                    console.log('ImagePicker Error: ', response.errorMessage);
                } else {
                    const selectedImage = response.assets[0]; // Extract image details
                    setImage(selectedImage);
                }
            }
        );

        try {
            const { data, error } = await supabase
                .from('scans')
                .insert([
                    {
                        user_id: user.id, // Replace with the logged-in user's ID
                        scan_date: new Date().toISOString(),
                        image_uri: image.uri
                    },
                ]);
        }
        catch (e) {
            console.log('Upload Failed')
        }
    };

    // Function to detect disease using a machine learning model or API
    const detectDisease = async () => {
        /*if (!image) {
            Alert.alert('Error', 'Please select an image first!');
            return;
        }

        try {
            // Prepare the image for upload
            const formData = new FormData();
            formData.append('file', {
                uri: image.uri,
                type: 'image/jpeg', // Adjust if needed
                name: 'scan.jpg',
            });

            // Send image to the disease detection API (replace with your actual API URL)
            const response = await axios.post('YOUR_DETECTION_API_URL', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.disease) {
                // Update the state with the detected disease
                setDisease(response.data.disease);
            } else {
                Alert.alert('No Disease Detected', 'Unable to detect disease.');
            }

            // Optionally, save scan data to Supabase
            await supabase.from('scans').insert([
                {
                    user_id: user.id, // Replace with logged-in user's ID
                    scan_date: new Date().toISOString(),
                    image_uri: image.uri,
                    disease: response.data.disease || 'Unknown',
                },
            ]);
        } catch (error) {
            console.error('Error detecting disease:', error);
            Alert.alert('Error', 'Unable to detect disease, please try again.');
        }*/
    };



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scan an Image</Text>

            {/* Button to pick an image */}
            <Button
                mode="contained"
                onPress={pickImage}
                style={styles.button}
                labelStyle={styles.buttonText}
            >
                Pick an Image
            </Button>

            {image && (
                <View style={styles.imagePreview}>
                    <Text style={styles.imageLabel}>Selected Image:</Text>
                    <Image
                        source={{ uri: image.uri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Button to detect disease */}
            <Button
                mode="contained"
                onPress={detectDisease}
                style={styles.button}
                labelStyle={styles.buttonText}
            >
                Detect Disease
            </Button>

            {disease && (
                <View style={styles.result}>
                    <Text style={styles.diseaseText}>Detected Disease: {disease}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4CAF50',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 25,
        width: '60%',
        elevation: 3, // Adds shadow for a polished look
    },
    buttonText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    imagePreview: {
        marginTop: 20,
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 16,
        color: '#388E3C',
        marginBottom: 10,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#A5D6A7',
    },
});

export default ScanImage;
