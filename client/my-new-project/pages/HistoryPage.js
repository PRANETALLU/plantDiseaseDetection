import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

const HistoryPage = () => {
    const navigation = useNavigation();
    const [history, setHistory] = useState([
        /*{
            id: '1',
            imageUri: 'https://via.placeholder.com/150', // Replace with actual image URI
            disease: 'Tomato Leaf Blight',
            scanDate: '2024-12-15',
        },
        {
            id: '2',
            imageUri: 'https://via.placeholder.com/150',
            disease: 'Powdery Mildew',
            scanDate: '2024-12-14',
        },*/
    ]);

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('scans')
            .select('id, user_id, scan_date, image_uri')
            .order('scan_date', { ascending: false });

        setHistory(data);
    };

    useEffect(() => {
        fetchHistory();
    }, [])

    console.log('History', history)

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('scans').delete().eq('id', id);

            if (error) {
                console.error('Error deleting scan:', error.message);
            } else {
                setHistory(history.filter((item) => item.id !== id));
            }
        } catch (error) {
            console.error('Unexpected error deleting scan:', error.message);
        }
    };


    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <View style={styles.cardContent}>
                {/* Thumbnail */}
                <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />

                {/* Disease Info */}
                <View style={styles.info}>
                    {/* <Text style={styles.diseaseName}>{item.disease}</Text>*/}
                    <Text style={styles.scanDate}>Scanned on: {item.scan_date}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <IconButton
                        icon="eye"
                        color="#4CAF50"
                        size={24}
                        onPress={() => navigation.navigate('ScanDetails', { scanId: item.id })}
                    />
                    <IconButton
                        icon="delete"
                        color="#E53935"
                        size={24}
                        onPress={() => handleDelete(item.id)}
                    />
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My History</Text>
            </View>

            {/* Scan History List */}
            {history.length > 0 ? (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            ) : (
                <Text style={styles.emptyMessage}>No scan history found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#388E3C',
    },
    exportButton: {
        borderRadius: 20,
    },
    card: {
        marginVertical: 5,
        elevation: 3,
        borderRadius: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
    },
    info: {
        flex: 1,
    },
    diseaseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    scanDate: {
        fontSize: 14,
        color: '#757575',
    },
    actions: {
        flexDirection: 'row',
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: 20,
    },
});

export default HistoryPage; 