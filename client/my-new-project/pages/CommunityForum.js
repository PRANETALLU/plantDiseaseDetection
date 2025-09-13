import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../supabaseClient';
import { useUserAuth } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const { width } = Dimensions.get('window');

export default function CommunityForum() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Plant Diseases');
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserAuth();
  const navigation = useNavigation();
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});

  const toggleComments = async (postId) => {
    const isVisible = commentsVisible[postId];
    setCommentsVisible(prev => ({ ...prev, [postId]: !isVisible }));

    if (!isVisible && !(comments[postId]?.length > 0)) {
      await fetchComments(postId); // fetch only when expanding for first time
    }
  };


  const categories = [
    { value: 'All', icon: 'apps', color: '#4CAF50' },
    { value: 'Plant Diseases', icon: 'local-hospital', color: '#F44336' },
    { value: 'Farming Tips', icon: 'agriculture', color: '#2196F3' },
    { value: 'General Queries', icon: 'help', color: '#FF9800' }
  ];

  const fetchComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentInput[postId]?.trim();
    if (!user || !content) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: user.id, content }])
        .select()
        .single();

      if (error) throw error;
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));
      setCommentInput(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      Alert.alert('Error', 'Failed to add comment.');
    }
  };



  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, category, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load posts.');
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    (post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === 'All' || post.category === categoryFilter)
  );

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create or edit a post.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }

    try {
      if (editingPost) {
        const { data, error } = await supabase
          .from('posts')
          .update({ title: title.trim(), content: content.trim(), category })
          .eq('id', editingPost.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        setPosts(posts.map(post => (post.id === editingPost.id ? data : post)));
        setEditingPost(null);
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert([{ user_id: user.id, title: title.trim(), content: content.trim(), category }])
          .select()
          .single();

        if (error) throw error;
        setPosts([data, ...posts]);
      }

      closeModal();
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingPost ? 'update' : 'create'} post.`);
    }
  };

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
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

              if (error) throw error;
              setPosts(posts.filter(post => post.id !== postId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post.');
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingPost(null);
    setTitle('');
    setContent('');
    setCategory('Plant Diseases');
  };

  const getCategoryInfo = (categoryName) => {
    return categories.find(cat => cat.value === categoryName) || { icon: 'help', color: '#757575' };
  };

  const renderPost = ({ item, index }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isUserPost = user && user.id === item.user_id;

    return (
      <TouchableOpacity
        style={[styles.postCard, { marginTop: index === 0 ? 0 : 12 }]}
        activeOpacity={0.9}
      >
        <View style={styles.postHeader}>
          <View style={styles.categoryBadge}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}>
              <Icon name={categoryInfo.icon} size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {isUserPost && (
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingPost(item);
                  setTitle(item.title);
                  setContent(item.content);
                  setCategory(item.category);
                  setIsModalVisible(true);
                }}
              >
                <Icon name="edit" size={16} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePost(item.id)}
              >
                <Icon name="delete-outline" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Comments Section */}
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
            onPress={() => toggleComments(item.id)}
          >
            <Icon
              name={commentsVisible[item.id] ? "expand-less" : "expand-more"}
              size={18}
              color="#4CAF50"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 12, color: '#4CAF50', fontWeight: '500' }}>
              {commentsVisible[item.id] ? 'Hide Comments' : 'Show Comments'}
            </Text>
          </TouchableOpacity>

          {commentsVisible[item.id] && (
            loadingComments[item.id] ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              (comments[item.id] || []).map(comment => (
                <View key={comment.id} style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <Icon name="person" size={14} color="#757575" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: '#2E2E2E' }}>
                    {comment.user_id === user.id ? 'You' : 'Community Member'}: {comment.content}
                  </Text>
                </View>
              ))
            )
          )}

          {commentsVisible[item.id] && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: 12,
                }}
                placeholder="Add a comment..."
                placeholderTextColor="#A5A5A5"
                value={commentInput[item.id] || ''}
                onChangeText={text =>
                  setCommentInput(prev => ({ ...prev, [item.id]: text }))
                }
              />
              <TouchableOpacity
                style={{ marginLeft: 6 }}
                onPress={() => handleAddComment(item.id)}
              >
                <Icon name="send" size={18} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.postFooter}>
          <View style={styles.authorInfo}>
            <Icon name="person" size={14} color="#757575" />
            <Text style={styles.authorText}>
              {isUserPost ? 'You' : 'Community Member'}
            </Text>
          </View>
          <Text style={styles.dateText}>{moment(item.created_at).fromNow()}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor="#A5A5A5"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="clear" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesSection}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryFilterButton,
              categoryFilter === cat.value && { backgroundColor: cat.color }
            ]}
            onPress={() => setCategoryFilter(cat.value)}
          >
            <Icon
              name={cat.icon}
              size={16}
              color={categoryFilter === cat.value ? '#FFFFFF' : cat.color}
            />
            <Text style={[
              styles.categoryFilterText,
              categoryFilter === cat.value && { color: '#FFFFFF' }
            ]}>
              {cat.value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading community posts...</Text>
        </View>
      ) : filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.postsContainer}
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
          <Icon name="forum" size={60} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Posts Found</Text>
          <Text style={styles.emptyMessage}>
            {search || categoryFilter !== 'All'
              ? 'Try adjusting your search or filter.'
              : 'Be the first to start a conversation!'
            }
          </Text>
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createPostButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      {posts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Create/Edit Post Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPost ? 'Edit Post' : 'Create Post'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.filter(cat => cat.value !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.modalCategoryButton,
                      category === cat.value && { backgroundColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Icon
                      name={cat.icon}
                      size={16}
                      color={category === cat.value ? '#FFFFFF' : cat.color}
                    />
                    <Text style={[
                      styles.modalCategoryText,
                      category === cat.value && { color: '#FFFFFF' }
                    ]}>
                      {cat.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Title Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="What's your question or topic?"
                placeholderTextColor="#A5A5A5"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Content Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Content</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Share your thoughts or ask questions..."
                placeholderTextColor="#A5A5A5"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!title.trim() || !content.trim()) && styles.disabledButton
                ]}
                onPress={handleCreatePost}
                disabled={!title.trim() || !content.trim()}
              >
                <Icon name="send" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {editingPost ? 'Update' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E2E2E',
    flex: 1,
  },
  headerAction: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2E2E2E',
    paddingVertical: 5,
    marginLeft: 10,
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  categoryFilterText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  postsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 6,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 18,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
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
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  modalCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalCategoryText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  titleInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2E2E2E',
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
});