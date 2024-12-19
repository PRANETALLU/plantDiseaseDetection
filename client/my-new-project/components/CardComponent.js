import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const CardComponent = (props) => {
    const navigation = useNavigation();

    return(
        <Card style={styles.card} onPress={() => navigation.navigate(props.route)}>
          <Card.Content style={styles.cardContent}>
            <Icon name={props.icon} size={40} color="#4CAF50" />
            <Text style={styles.cardText}>{props.text}</Text>
          </Card.Content>
        </Card>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#E8F5E9',
    },
    greeting: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#388E3C',
    },
    profileIcon: {
      backgroundColor: '#A5D6A7',
    },
    cardContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    card: {
      width: '45%',
      margin: 10,
      backgroundColor: '#FFFFFF',
      elevation: 3,
      borderRadius: 8,
    },
    cardContent: {
      alignItems: 'center',
    },
    cardText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      color: '#2E7D32',
    },
    bottomSection: {
      marginTop: 20,
      padding: 20,
      backgroundColor: '#E8F5E9',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#388E3C',
      marginBottom: 5,
    },
    notificationText: {
      fontSize: 14,
      color: '#4CAF50',
      marginBottom: 10,
    },
  });

export default CardComponent; 