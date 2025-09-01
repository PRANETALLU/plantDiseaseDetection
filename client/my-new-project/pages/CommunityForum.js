import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { useUserAuth } from '../context/UserContext';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';

export default function CommunityForum() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Plant Diseases');
  const [editingPost, setEditingPost] = useState(null);
  const { user } = useUserAuth();
  const navigation = useNavigation();

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, category, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Error', 'Failed to load posts.');
      } else {
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post =>
    (post.title.toLowerCase().includes(search.toLowerCase()) ||
     post.content.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === 'All' || post.category === categoryFilter)
  );

  // Handle creating or updating a post
  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create or edit a post.');
      return;
    }

    if (!title || !content) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }

    if (editingPost) {
      // Update existing post
      const { data, error } = await supabase
        .from('posts')
        .update({ title, content, category })
        .eq('id', editingPost.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        Alert.alert('Error', 'Failed to update post.');
      } else {
        setPosts(posts.map(post => (post.id === editingPost.id ? data : post)));
        setEditingPost(null);
      }
    } else {
      // Create new post
      const { data, error } = await supabase
        .from('posts')
        .insert([{ user_id: user.id, title, content, category }])
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        Alert.alert('Error', 'Failed to create post.');
      } else {
        setPosts([data, ...posts]);
      }
    }

    // Reset form and close modal
    setIsModalVisible(false);
    setTitle('');
    setContent('');
    setCategory('Plant Diseases');
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('posts')
              .delete()
              .eq('id', postId)
              .eq('user_id', user.id);

            if (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post.');
            } else {
              setPosts(posts.filter(post => post.id !== postId));
            }
          },
        },
      ]
    );
  };

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
        mode="contained"
        onPress={() => {
          setEditingPost(null);
          setTitle('');
          setContent('');
          setCategory('Plant Diseases');
          setIsModalVisible(true);
        }}
        style={styles.createButton}
      >
        Create New Post
      </Button>

      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text numberOfLines={2}>{item.content}</Text>
              <Text>Category: {item.category}</Text>
              <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
            {user && user.id === item.user_id && (
              <View style={styles.postActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEditingPost(item);
                    setTitle(item.title);
                    setContent(item.content);
                    setCategory(item.category);
                    setIsModalVisible(true);
                  }}
                  style={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleDeletePost(item.id)}
                  style={styles.actionButton}
                  color="red"
                >
                  Delete
                </Button>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text>No posts found.</Text>}
      />

      {/* Modal for Create/Edit Post */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setEditingPost(null);
          setTitle('');
          setContent('');
          setCategory('Plant Diseases');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{editingPost ? 'Edit Post' : 'Create New Post'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
              multiline
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

            <Button
              mode="contained"
              onPress={handleCreatePost}
              style={styles.modalButton}
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setIsModalVisible(false);
                setEditingPost(null);
                setTitle('');
                setContent('');
                setCategory('Plant Diseases');
              }}
              style={styles.modalButton}
              color="red"
            >
              Cancel
            </Button>
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
    marginTop: 30,
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
    fontSize: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalButton: {
    marginVertical: 5,
  },
  createButton: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
  },
});