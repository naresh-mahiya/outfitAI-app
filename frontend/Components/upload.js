import React, { useState } from 'react';
import { View, Button, Image, Alert, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Profile = () => {
  const [imageUri, setImageUri] = useState(null);
  const [clothingItems, setClothingItems] = useState([]);

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const localUri = asset.uri;
      const name = asset.fileName || 'image.jpg';
      const type = 'image/jpeg';

      setImageUri(localUri);

      const formData = new FormData();
      formData.append('wardrobeImage', {
        uri: localUri,
        type: type,
        name: name,
      });

      try {
        // Upload image to the backend
        const response = await axios.post('http://192.168.188.21:3000/user/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

        console.log('Image uploaded successfully:', response.data);

        // After uploading, classify the image to get clothing items
        const classificationResponse = await axios.post('http://192.168.188.21:3000/user/classify-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });

        console.log('AI Classification Result:', classificationResponse.data);
        setClothingItems(classificationResponse.data.clothing_items || []);
      } catch (error) {
        console.error('Error uploading or classifying image:', error.message);
        Alert.alert('Error', 'Failed to upload and classify the image.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Button title="Upload & Classify Image" onPress={handleUpload} />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginTop: 20, borderRadius: 10 }}
        />
      )}
      {clothingItems.length > 0 && (
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Clothing Items Detected:</Text>
          {clothingItems.map((item, index) => (
            <Text key={index}>• {item.item}: {item.color}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;
