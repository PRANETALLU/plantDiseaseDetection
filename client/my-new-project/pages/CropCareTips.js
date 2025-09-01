import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Dimensions
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function CropCareTipsPage() {
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const quickTips = [
    "How to water tomatoes properly?",
    "Best fertilizer for vegetables?", 
    "How to prevent plant diseases?",
    "When to harvest crops?"
  ];

  const handleQuerySubmit = async () => {
    if (!userQuery.trim()) return;

    const newChat = { query: userQuery.trim(), response: '', timestamp: new Date() };
    setChatHistory(prev => [...prev, newChat]);
    setLoading(true);
    
    const currentQuery = userQuery.trim();
    setUserQuery('');

    try {
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      setChatHistory(prev => 
        prev.map((chat, index) => 
          index === prev.length - 1 
            ? { ...chat, response: data.response }
            : chat
        )
      );
    } catch (error) {
      setChatHistory(prev => 
        prev.map((chat, index) => 
          index === prev.length - 1 
            ? { ...chat, response: 'Sorry, something went wrong. Please try again.' }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Care Assistant</Text>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => setChatHistory([])}
          disabled={chatHistory.length === 0}
        >
          <Icon name="refresh" size={24} color={chatHistory.length > 0 ? "#757575" : "#E0E0E0"} />
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      {chatHistory.length === 0 && (
        <View style={styles.welcomeSection}>
          <Icon name="eco" size={50} color="#4CAF50" />
          <Text style={styles.welcomeTitle}>Plant Care Assistant</Text>
          <Text style={styles.welcomeText}>Get expert advice on plant care and disease prevention</Text>
          
          <Text style={styles.quickTipsLabel}>Try asking:</Text>
          {quickTips.map((tip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickTip}
              onPress={() => setUserQuery(tip)}
            >
              <Text style={styles.quickTipText}>{tip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Chat History */}
      <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {chatHistory.map((chat, index) => (
          <View key={index} style={styles.chatItem}>
            <View style={styles.userMessage}>
              <Text style={styles.queryText}>{chat.query}</Text>
            </View>
            {chat.response && (
              <View style={styles.botMessage}>
                <Icon name="eco" size={16} color="#4CAF50" style={styles.botIcon} />
                <Text style={styles.responseText}>{chat.response}</Text>
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingMessage}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Getting advice...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Ask about plant care..."
            placeholderTextColor="#A5A5A5"
            value={userQuery}
            onChangeText={setUserQuery}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendButton, !userQuery.trim() && styles.disabledButton]}
            onPress={handleQuerySubmit}
            disabled={!userQuery.trim() || loading}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    flex: 1,
  },
  clearButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  quickTipsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
  },
  quickTip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    width: '100%',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  quickTipText: {
    fontSize: 14,
    color: '#2E2E2E',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  queryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  botMessage: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    maxWidth: '85%',
    elevation: 1,
  },
  botIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  responseText: {
    color: '#2E2E2E',
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
  },
  loadingText: {
    marginLeft: 10,
    color: '#757575',
    fontSize: 14,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#2E2E2E',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
});