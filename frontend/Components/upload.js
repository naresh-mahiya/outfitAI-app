import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Profile = () => {
  const [imageUri, setImageUri] = useState(null);

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
      setImageUri(result.assets[0].uri);
      console.log('Selected image:', result.assets[0].uri);

      // Convert the image to a format the backend can accept (base64 or file)
      const localUri = result.assets[0].uri;
      const type = result.assets[0].type; // e.g., 'image/jpeg'
      const name = result.assets[0].fileName || 'image.jpg'; // Use default filename if not available

      // Fetch image data in base64 format (you can also send it as a file)
      const base64 = await fetch(localUri)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

      // Send the image to the backend
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      try {
        // Replace with your backend URL
        const response = await axios.post('http://192.168.188.21:3000/imageuploading', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Image uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading image:', error.message);
        console.log(error.config)
        Alert.alert('Error', 'Failed to upload the image');
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Upload Image" onPress={handleUpload} />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default Profile;
