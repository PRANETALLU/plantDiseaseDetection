import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, Button, ScrollView } from "react-native";

export default function CropCareTipsPage() {
  const [userQuery, setUserQuery] = useState('');
  const [chatResponses, setChatResponses] = useState([]);

  // Handle user query and fetch response
  const handleUserQuerySubmit = async () => {
    if (userQuery) {
      try {
        const response = await fetch('http://127.0.0.1:8000/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userQuery }), // Send the query as a JSON string
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        setChatResponses([...chatResponses, { query: userQuery, response: data.response }]);
        setUserQuery(''); // Clear input field
      } catch (error) {
        console.error('Error during chat:', error);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crop Care Tips</Text>

      {/* Chat functionality */}
      <View style={styles.chatContainer}>
        <Text style={styles.chatHeader}>Ask a Question About Crop Care</Text>
        
        {/* User Input for Query */}
        <TextInput
          style={styles.inputField}
          placeholder="Type your question..."
          value={userQuery}
          onChangeText={setUserQuery}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleUserQuerySubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        {/* Displaying responses */}
        <ScrollView style={styles.responsesContainer}>
          {chatResponses.map((chat, index) => (
            <View key={index} style={styles.chatBubble}>
              <Text style={styles.queryText}>Q: {chat.query}</Text>
              <Text style={styles.responseText}>A: {chat.response}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 30
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  tipCard: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tipTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  category: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  chatHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  responsesContainer: {
    marginTop: 10,
    maxHeight: 300,
  },
  chatBubble: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  queryText: {
    fontWeight: "bold",
  },
  responseText: {
    marginTop: 5,
    color: "#555",
  },
});
