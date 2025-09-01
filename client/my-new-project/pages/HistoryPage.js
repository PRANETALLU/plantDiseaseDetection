import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import { useUserAuth } from '../context/UserContext';
import moment from 'moment';

const { width } = Dimensions.get('window');

const HistoryPage = () => {
    const navigation = useNavigation();
    const { user } = useUserAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);
    const [filter, setFilter] = useState('all'); // all, healthy, diseased

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('scans')
            .select('id, user_id, scan_date, image_uri, diagnosis')
            .eq('user_id', user?.id)
            .order('scan_date', { ascending: false });

        if (data) {
            setHistory(data);
        } else {
            console.error('Error fetching scans:', error?.message);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Scan',
            'Are you sure you want to delete this scan?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('scans').delete().eq('id', id);
                            if (error) {
                                Alert.alert('Error', 'Failed to delete scan');
                            } else {
                                setHistory(history.filter((item) => item.id !== id));
                            }
                        } catch (error) {
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    }
                }
            ]
        );
    };

    const getFilteredHistory = () => {
        if (filter === 'all') return history;
        if (filter === 'healthy') return history.filter(item => 
            item.diagnosis?.toLowerCase().includes('healthy') || 
            item.diagnosis?.toLowerCase().includes('normal')
        );
        if (filter === 'diseased') return history.filter(item => 
            !item.diagnosis?.toLowerCase().includes('healthy') && 
            !item.diagnosis?.toLowerCase().includes('normal') &&
            item.diagnosis
        );
        return history;
    };

    const getDiseaseStatus = (diagnosis) => {
        if (!diagnosis) return { status: 'unknown', color: '#757575', icon: 'help' };
        if (diagnosis.toLowerCase().includes('healthy') || diagnosis.toLowerCase().includes('normal')) {
            return { status: 'healthy', color: '#4CAF50', icon: 'check-circle' };
        }
        return { status: 'diseased', color: '#F44336', icon: 'warning' };
    };

    const renderItem = ({ item, index }) => {
        const diseaseInfo = getDiseaseStatus(item.diagnosis);
        
        return (
            <TouchableOpacity
                style={[styles.card, { marginTop: index === 0 ? 0 : 12 }]}
                onPress={() => {
                    setSelectedScan(item);
                    setModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    <View style={styles.imageSection}>
                        <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />
                        <View style={[styles.statusBadge, { backgroundColor: diseaseInfo.color }]}>
                            <Icon name={diseaseInfo.icon} size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.diagnosisText} numberOfLines={2}>
                            {item.diagnosis || 'Analysis incomplete'}
                        </Text>
                        <Text style={styles.dateText}>
                            {moment(item.scan_date).format('MMM DD, YYYY')}
                        </Text>
                        <Text style={styles.timeText}>
                            {moment(item.scan_date).format('h:mm A')}
                        </Text>
                    </View>

                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setSelectedScan(item);
                                setModalVisible(true);
                            }}
                        >
                            <Icon name="visibility" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Icon name="delete-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFilterButton = (filterType, label, icon) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === filterType && styles.activeFilterButton
            ]}
            onPress={() => setFilter(filterType)}
        >
            <Icon 
                name={icon} 
                size={18} 
                color={filter === filterType ? '#FFFFFF' : '#4CAF50'} 
            />
            <Text style={[
                styles.filterButtonText,
                filter === filterType && styles.activeFilterButtonText
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#4CAF50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan History</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                    <Icon name="refresh" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Icon name="camera-alt" size={24} color="#4CAF50" />
                    <Text style={styles.statNumber}>{history.length}</Text>
                    <Text style={styles.statLabel}>Total Scans</Text>
                </View>
                <View style={styles.statCard}>
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                    <Text style={styles.statNumber}>
                        {history.filter(item => getDiseaseStatus(item.diagnosis).status === 'healthy').length}
                    </Text>
                    <Text style={styles.statLabel}>Healthy</Text>
                </View>
                <View style={styles.statCard}>
                    <Icon name="warning" size={24} color="#F44336" />
                    <Text style={styles.statNumber}>
                        {history.filter(item => getDiseaseStatus(item.diagnosis).status === 'diseased').length}
                    </Text>
                    <Text style={styles.statLabel}>Diseased</Text>
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                {renderFilterButton('all', 'All', 'list')}
                {renderFilterButton('healthy', 'Healthy', 'check-circle')}
                {renderFilterButton('diseased', 'Diseased', 'warning')}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading your scan history...</Text>
                </View>
            ) : getFilteredHistory().length > 0 ? (
                <FlatList
                    data={getFilteredHistory()}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4CAF50']}
                            tintColor="#4CAF50"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="history" size={80} color="#E0E0E0" />
                    <Text style={styles.emptyTitle}>No Scans Found</Text>
                    <Text style={styles.emptyMessage}>
                        {filter === 'all' 
                            ? "You haven't scanned any plants yet. Start by taking your first scan!"
                            : `No ${filter} plants found in your history.`
                        }
                    </Text>
                    <TouchableOpacity 
                        style={styles.scanButton}
                        onPress={() => navigation.navigate('Scan Image')}
                    >
                        <Icon name="camera-alt" size={20} color="#FFFFFF" />
                        <Text style={styles.scanButtonText}>Start Scanning</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Enhanced Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
                statusBarTranslucent
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Scan Details</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="#757575" />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedScan && (
                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalImageContainer}>
                                <Image source={{ uri: selectedScan.image_uri }} style={styles.modalImage} />
                                <View style={[
                                    styles.modalStatusBadge,
                                    { backgroundColor: getDiseaseStatus(selectedScan.diagnosis).color }
                                ]}>
                                    <Icon 
                                        name={getDiseaseStatus(selectedScan.diagnosis).icon} 
                                        size={20} 
                                        color="#FFFFFF" 
                                    />
                                </View>
                            </View>

                            <View style={styles.modalDetailsContainer}>
                                <View style={styles.modalDetailRow}>
                                    <Icon name="calendar-today" size={20} color="#4CAF50" />
                                    <View style={styles.modalDetailText}>
                                        <Text style={styles.modalDetailLabel}>Scan Date</Text>
                                        <Text style={styles.modalDetailValue}>
                                            {moment(selectedScan.scan_date).format('MMMM DD, YYYY')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Icon name="access-time" size={20} color="#4CAF50" />
                                    <View style={styles.modalDetailText}>
                                        <Text style={styles.modalDetailLabel}>Time</Text>
                                        <Text style={styles.modalDetailValue}>
                                            {moment(selectedScan.scan_date).format('h:mm A')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Icon name="local-hospital" size={20} color="#4CAF50" />
                                    <View style={styles.modalDetailText}>
                                        <Text style={styles.modalDetailLabel}>Diagnosis</Text>
                                        <Text style={[
                                            styles.modalDetailValue,
                                            styles.diagnosisValue,
                                            { color: getDiseaseStatus(selectedScan.diagnosis).color }
                                        ]}>
                                            {selectedScan.diagnosis || 'Analysis incomplete'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalSecondaryButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDelete(selectedScan.id);
                                    }}
                                >
                                    <Icon name="delete" size={20} color="#F44336" />
                                    <Text style={styles.modalSecondaryButtonText}>Delete</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={styles.modalPrimaryButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        navigation.navigate('Disease Library');
                                    }}
                                >
                                    <Icon name="menu-book" size={20} color="#FFFFFF" />
                                    <Text style={styles.modalPrimaryButtonText}>Learn More</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E2E2E',
        flex: 1,
    },
    refreshButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
        marginHorizontal: 5,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E2E2E',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        fontWeight: '500',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#4CAF50',
        backgroundColor: '#FFFFFF',
    },
    activeFilterButton: {
        backgroundColor: '#4CAF50',
    },
    filterButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
    },
    listContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    imageSection: {
        position: 'relative',
        marginRight: 16,
    },
    thumbnail: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    statusBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    infoSection: {
        flex: 1,
        marginRight: 12,
    },
    diagnosisText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E2E2E',
        marginBottom: 6,
        lineHeight: 20,
    },
    dateText: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 2,
    },
    timeText: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    actionsSection: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#757575',
        marginTop: 15,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E2E2E',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 4,
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E2E2E',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalImageContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 30,
    },
    modalImage: {
        width: width - 80,
        height: width - 80,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    modalStatusBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    modalDetailsContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalDetailText: {
        marginLeft: 15,
        flex: 1,
    },
    modalDetailLabel: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
        marginBottom: 4,
    },
    modalDetailValue: {
        fontSize: 16,
        color: '#2E2E2E',
        fontWeight: '600',
    },
    diagnosisValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    modalSecondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#F44336',
        borderRadius: 15,
        paddingVertical: 15,
    },
    modalSecondaryButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalPrimaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 15,
        paddingVertical: 15,
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default HistoryPage;