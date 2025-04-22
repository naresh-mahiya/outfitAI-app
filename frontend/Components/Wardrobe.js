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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Wardrobe = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [allCloth, setAllCloth] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showClothes, setShowClothes] = useState(true);
  const [newCloth, setNewCloth] = useState('');
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/user/images`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setWardrobeImages(data.Wardrobe.wardrobeImg || []);
        setClothes(data.Wardrobe.wardrobeClothes || []);
        setAllCloth(data.Wardrobe.allclothes[0] || []);
      })
      .catch((error) => console.error('Error fetching images:', error));
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/user/profile`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch((error) => console.error('Error fetching profile:', error));
  }, []);

  const handleImageClick = (imgSrc) => {
    setZoomedImage(imgSrc);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const addCloth = async () => {
    if (!newCloth.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/user/addnewcloths`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clothname: newCloth,
        }),
      });

      const data = await response.json();
      console.log('Cloth added:', data);
      setNewCloth('');
      navigation.navigate('Wardrobe');
    } catch (error) {
      console.error('Error adding cloth:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleButtons}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowWardrobe(!showWardrobe)}
        >
          <Text style={styles.toggleButtonText}>
            {showWardrobe ? 'Hide Wardrobe' : 'Show Wardrobe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowClothes(!showClothes)}
        >
          <Text style={styles.toggleButtonText}>
            {showClothes ? 'Hide Clothes' : 'Show Clothes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wardrobe Images Section */}
      {showWardrobe && (
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
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noImages}>No wardrobe images uploaded.</Text>
          )}
        </View>
      )}

      {/* Add Clothes Section */}
      <View style={styles.addClothesContainer}>
        <TextInput
          style={styles.input}
          value={newCloth}
          onChangeText={setNewCloth}
          placeholder="Enter new clothes you purchased"
          placeholderTextColor="#666"
        />
        <View style={styles.addClothesActions}>
          <TouchableOpacity style={styles.actionButton} onPress={addCloth}>
            <Text style={styles.buttonText}>Add Clothes</Text>
          </TouchableOpacity>
          <Text style={styles.orText}>or</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Clothes Section */}
      {showClothes && (
        <View style={styles.clothesContainer}>
          <Text style={styles.clothesTitle}>Your Wardrobe Items</Text>
          {clothes.length > 0 ? (
            <View style={styles.clothesList}>
              {clothes.map((item, index) => (
                <View key={index} style={styles.clothesItem}>
                  <Text style={styles.clothesItemText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noImages}>No clothes data available.</Text>
          )}
        </View>
      )}

      {/* All Clothes Section */}
      <View style={styles.allClothesContainer}>
        <Text style={styles.allClothesTitle}>All clothes</Text>
        <Text style={styles.allClothesText}>{allCloth}</Text>
      </View>

      {/* Scanning Message */}
      {isScanning && (
        <View style={styles.scanningContainer}>
          <Text style={styles.scanningText}>
            Scanning wardrobe image... Please wait.
          </Text>
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      )}

      {/* Zoomed Image Modal */}
      <Modal
        visible={!!zoomedImage}
        transparent={true}
        onRequestClose={closeZoom}
      >
        <TouchableOpacity
          style={styles.zoomedModal}
          activeOpacity={1}
          onPress={closeZoom}
        >
          <Image
            source={{ uri: zoomedImage }}
            style={styles.zoomedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  toggleButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wardrobeGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  imageContainer: {
    width: width * 0.4,
    height: 180,
    margin: 5,
  },
  wardrobeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImages: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  addClothesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addClothesActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: 'black',
    fontWeight: 'bold',
  },
  clothesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clothesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clothesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  clothesItem: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  clothesItemText: {
    fontSize: 16,
    color: 'white',
  },
  allClothesContainer: {
    marginTop: 20,
    padding: 15,
  },
  allClothesTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
    marginBottom: 10,
  },
  allClothesText: {
    color: 'white',
    fontSize: 16,
  },
  scanningContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 18,
    color: '#ff6600',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  zoomedModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '90%',
    height: '90%',
  },
});

export default Wardrobe; 