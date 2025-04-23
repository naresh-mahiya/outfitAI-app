import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import {API_URL} from './config'
const { width } = Dimensions.get('window');

const Wardrobe = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [allCloth, setAllCloth] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showClothes, setShowClothes] = useState(true);
  const [newCloth, setNewCloth] = useState('');
  const [activeTab, setActiveTab] = useState('wardrobe'); // 'wardrobe' or 'clothes'
  const [isAddingCloth, setIsAddingCloth] = useState(false);
  const backendUrl = API_URL;

  const token = route.params?.token;
  console.log('token in wardrobe', token)
  
  // Define fetchWardrobeData function at component level so it can be reused
  const fetchWardrobeData = async () => {
    try {
      console.log('Fetching wardrobe data...');
      const response = await fetch(`${backendUrl}/user/images`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Include Authorization header if token is available
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Wardrobe data received:', data);
      
      if (data.Wardrobe) {
        setWardrobeImages(data.Wardrobe.wardrobeImg || []);
        setClothes(data.Wardrobe.wardrobeClothes || []);
        setAllCloth(data.Wardrobe.allclothes[0] || []);
      } else {
        console.error('Invalid data format received:', data);
      }
    } catch (error) {
      console.error('Error fetching wardrobe data:', error);
    }
  };
  useEffect(() => {
    

    fetchWardrobeData();
  }, [backendUrl, token]);

  useEffect(() => {
    

    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const response = await fetch(`${backendUrl}/user/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            // Include Authorization header if token is available
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error(`Profile request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('User profile received');
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [backendUrl, token]);

  const handleImageClick = (imgSrc) => {
    setZoomedImage(imgSrc);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const addCloth = async () => {
    if (!newCloth.trim()) return;

    try {
      console.log('Adding new cloth:', newCloth);
      const response = await fetch(`${backendUrl}/user/addnewcloths`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Include Authorization header if token is available
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          clothname: newCloth,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add cloth: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cloth added successfully:', data);
      setNewCloth('');
      
      // Refresh the wardrobe data instead of navigating
      fetchWardrobeData();
      setIsAddingCloth(false);
    } catch (error) {
      console.error('Error adding cloth:', error);
      alert('Failed to add cloth. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'wardrobe' && styles.activeTab]}
          onPress={() => setActiveTab('wardrobe')}
        >
          <Ionicons 
            name="shirt-outline" 
            size={22} 
            color={activeTab === 'wardrobe' ? '#007bff' : '#777'} 
          />
          <Text style={[styles.tabText, activeTab === 'wardrobe' && styles.activeTabText]}>Wardrobe</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'clothes' && styles.activeTab]}
          onPress={() => setActiveTab('clothes')}
        >
          <MaterialIcons 
            name="category" 
            size={22} 
            color={activeTab === 'clothes' ? '#007bff' : '#777'} 
          />
          <Text style={[styles.tabText, activeTab === 'clothes' && styles.activeTabText]}>Clothes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Wardrobe Tab Content */}
        {activeTab === 'wardrobe' && (
          <>
            {/* Wardrobe Images Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Items</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <Ionicons name="camera-outline" size={20} color="white" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wardrobeGallery}>
              {wardrobeImages.length > 0 ? (
                wardrobeImages.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImageClick(img)}
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.wardrobeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <MaterialIcons name="zoom-in" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="images-outline" size={60} color="#ccc" />
                  <Text style={styles.noImages}>No wardrobe images uploaded</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => navigation.navigate('Scanner')}
                  >
                    <Text style={styles.emptyStateButtonText}>Add Items</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {/* Clothes Tab Content */}
        {activeTab === 'clothes' && (
          <>
            {/* Add Clothes Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Clothes</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setIsAddingCloth(!isAddingCloth)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {isAddingCloth && (
              <View style={styles.addClothesContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter cloth name"
                    value={newCloth}
                    onChangeText={setNewCloth}
                  />
                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={addCloth}
                    disabled={!newCloth.trim()}
                  >
                    <Ionicons name="checkmark" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Clothes List */}
            <View style={styles.clothesContainer}>
              {clothes.length > 0 ? (
                <View style={styles.clothesList}>
                  {clothes.map((cloth, index) => (
                    <View key={index} style={styles.clothItem}>
                      <FontAwesome5 name="tshirt" size={18} color="#007bff" style={styles.clothIcon} />
                      <Text style={styles.clothItemText}>{cloth}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="shirt-outline" size={60} color="#ccc" />
                  <Text style={styles.noClothes}>No clothes added yet</Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => setIsAddingCloth(true)}
                  >
                    <Text style={styles.emptyStateButtonText}>Add Clothes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* All Clothes Section */}
            {allCloth.length > 0 && (
              <View style={styles.allClothesContainer}>
                <Text style={styles.allClothesTitle}>Suggested Categories</Text>
                <Text style={styles.allClothesText}>{allCloth}</Text>
              </View>
            )}
          </>
        )}

        {/* Scanning Message */}
        {isScanning && (
          <View style={styles.scanningOverlay}>
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.scanningText}>
                Scanning wardrobe image...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Zoomed Image Modal */}
      <Modal
        visible={!!zoomedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={closeZoom}
      >
        <View style={styles.zoomedModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeZoom}
          >
            <Ionicons name="close-circle" size={36} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: zoomedImage }}
            style={styles.zoomedImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    position: 'absolute',
    left: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  wardrobeGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  imageContainer: {
    width: width * 0.44,
    height: 200,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    position: 'relative',
  },
  wardrobeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  emptyStateContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noImages: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  noClothes: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  addClothesContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#007bff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  clothesContainer: {
    marginBottom: 24,
  },
  clothesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clothItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clothIcon: {
    marginRight: 12,
  },
  clothItemText: {
    fontSize: 16,
    color: '#333',
  },
  allClothesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  allClothesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  allClothesText: {
    color: '#555',
    fontSize: 16,
    lineHeight: 24,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scanningContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanningText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 16,
  },
  zoomedModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  zoomedImage: {
    width: '90%',
    height: '80%',
  },
});

export default Wardrobe;