import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { supabase } from '../supabaseClient';  // Import Supabase client
import { useUserAuth } from '../context/UserContext';
import { Picker } from '@react-native-picker/picker';


export default function CommunityForum({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Plant Diseases');

    const { user } = useUserAuth();

    // Fetch posts from Supabase
    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')  // Table name in Supabase
                .select('id, title, content, category, created_at')
                .order('created_at', { ascending: false });  // Sort posts by creation date

            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                setPosts(data);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post =>
        (post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase())) &&
        (categoryFilter === 'All' || post.category === categoryFilter)
    );

    const handleCreatePost = async () => {
        const user_id = user.id;  // Replace with actual user ID if you're managing authentication

        const { data, error } = await supabase
            .from('posts')
            .insert([{ user_id, title, content, category }])
            .single();

        if (error) {
            console.error('Error creating post:', error);
        } else {
            setPosts([data, ...posts]);  // Add the new post to the top of the list
            setIsModalVisible(false);  // Close the modal
            setTitle('');
            setContent('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Community Forum</Text>

            <TextInput
                style={styles.input}
                placeholder="Search posts..."
                value={search}
                onChangeText={setSearch}
            />

            <Picker
                selectedValue={categoryFilter}
                style={styles.picker}
                onValueChange={setCategoryFilter}
            >
                <Picker.Item label="All Categories" value="All" />
                <Picker.Item label="Plant Diseases" value="Plant Diseases" />
                <Picker.Item label="Farming Tips" value="Farming Tips" />
                <Picker.Item label="General Queries" value="General Queries" />
            </Picker>

            <Button
                title="Create New Post"
                onPress={() => setIsModalVisible(true)}  // Open the modal when clicking "Create New Post"
            />

            <FlatList
                data={filteredPosts}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
                        <View style={styles.post}>
                            <Text style={styles.postTitle}>{item.title}</Text>
                            <Text>{item.content}</Text>
                            <Text>Category: {item.category}</Text>
                            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No posts found.</Text>} // Handle empty list case
            />


            {/* Modal for Create Post */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Create New Post</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Content"
                            value={content}
                            onChangeText={setContent}
                        />

                        <Picker
                            selectedValue={category}
                            style={styles.picker}
                            onValueChange={setCategory}
                        >
                            <Picker.Item label="Plant Diseases" value="Plant Diseases" />
                            <Picker.Item label="Farming Tips" value="Farming Tips" />
                            <Picker.Item label="General Queries" value="General Queries" />
                        </Picker>

                        <Button title="Post" onPress={handleCreatePost} />
                        <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 30
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    picker: {
        height: 50,
        marginBottom: 20,
    },
    post: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    postTitle: {
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Overlay effect
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
