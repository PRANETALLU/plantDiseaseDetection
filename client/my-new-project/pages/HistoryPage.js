import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Modal } from 'react-native';
import { Card, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import moment from 'moment';

const HistoryPage = () => {
    const navigation = useNavigation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('scans')
            .select('id, user_id, scan_date, image_uri, diagnosis')
            .order('scan_date', { ascending: false });

        if (data) {
            setHistory(data);
        } else {
            console.error('Error fetching scans:', error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

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
                <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />

                <View style={styles.info}>
                    <Text style={styles.scanDate}>Scanned on: {moment(item.scan_date).format('MMMM Do, YYYY, hh:mm:ss A')}</Text>
                    <Text style={styles.diagnosis}>Diagnosis: {item.diagnosis || 'Not available'}</Text>
                </View>

                <View style={styles.actions}>
                    <IconButton
                        icon="eye"
                        color="#4CAF50"
                        size={24}
                        onPress={() => {
                            setSelectedScan(item);
                            setModalVisible(true);
                        }}
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
            <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                icon="arrow-left"
                style={styles.backButton}
                labelStyle={styles.backButtonText}
            >
                Go Back
            </Button>
            <View style={styles.header}>
                <Text style={styles.title}>My History</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#388E3C" style={styles.loadingIndicator} />
            ) : history.length > 0 ? (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            ) : (
                <Text style={styles.emptyMessage}>No scan history found.</Text>
            )}

            {/* Modal for Viewing Scan Details */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {selectedScan && (
                        <>
                            <Image source={{ uri: selectedScan.image_uri }} style={styles.modalImage} />
                            <Text style={styles.modalTitle}>Scan Details</Text>
                            <Text style={styles.modalText}>Scanned on: {moment(selectedScan.scan_date).format('MMMM Do, YYYY, hh:mm:ss A')}</Text>
                            <Text style={styles.modalText}>Diagnosis: {selectedScan.diagnosis || 'Not available'}</Text>
                            <IconButton
                                icon="close"
                                color="#E53935"
                                size={30}
                                onPress={() => setModalVisible(false)}
                            />
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 10,
        marginTop: 30,
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
    scanDate: {
        fontSize: 14,
        color: '#757575',
    },
    diagnosis: {
        fontSize: 14,
        color: '#388E3C',
    },
    actions: {
        flexDirection: 'row',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    modalImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 10,
    },
});

export default HistoryPage;
