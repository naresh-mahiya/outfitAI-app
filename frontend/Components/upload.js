import React, { useState } from "react";
import { View, Button, Image, Alert, Text, ScrollView, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import {API_URL} from './config'
const Profile = () => {
  const [imageUri, setImageUri] = useState(null);
  const [clothingItems, setClothingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const backend_url=API_URL
  const handleUpload = async () => {
    try {
      setIsLoading(true);

      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to media library.");
        setIsLoading(false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const asset = result.assets[0];
      const localUri = asset.uri;
      const name = asset.fileName || "image.jpg";
      const type = "image/jpeg";

      setImageUri(localUri);

      const formData = new FormData();
      formData.append("wardrobeImage", {
        uri: localUri,
        type: type,
        name: name,
      });

      // Upload image to the backend
      const uploadResponse = await axios.post(
        `${backend_url}/user/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Image done", uploadResponse.data);
// console.log('token is ', uploadResponse.data.token)
      // Assuming your backend returns a token along with the response data
      const token = uploadResponse.data.token; // Adjust based on your response structure
// console.log('token is ', token)
      // After uploading, classify the image to get clothing items
      const classificationResponse = await axios.post(
        `${backend_url}/user/classify-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("AI Classification Result:", classificationResponse.data);
      setClothingItems(classificationResponse.data.clothing_items || []);

      // Now you can pass the token to another screen
      navigation.navigate("Profile", { token: token });

    } catch (error) {
      console.error("Error uploading or classifying image:", error.message);
      Alert.alert("Error", "Failed to upload and classify the image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Button
        title="Upload & Classify Image"
        onPress={handleUpload}
        disabled={isLoading}
      />

      {isLoading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Processing image...</Text>
        </View>
      )}

      {imageUri && !isLoading && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginTop: 20, borderRadius: 10 }}
        />
      )}

      {clothingItems.length > 0 && !isLoading && (
        <View style={{ marginTop: 20, width: "100%" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Clothing Items Detected:
          </Text>
          {clothingItems.map((item, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>
              • {item.item}: {item.color}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;
