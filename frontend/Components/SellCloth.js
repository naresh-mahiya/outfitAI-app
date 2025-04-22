import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

const SellCloth = () => {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [cloth, setCloth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothall, setClothall] = useState([]);
  const [clothuser, setClothuser] = useState([]);
  const [price, setPrice] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/user/allClothesSell`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch clothes data");

      const data = await response.json();
      setCloth(data);
      setClothall(data.cloths);
      setClothuser(data.usercloth);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    if (!imageFile || !description || !price) {
      alert("Please fill all the fields");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageFile.uri,
      type: "image/jpeg",
      name: "image.jpg",
    });
    formData.append("description", description);
    formData.append("price", price);

    try {
      const response = await fetch(`${apiUrl}/user/sellcloth`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImageFile(null);
        setDescription("");
        setPrice("");
        setUploading(false);
        fetchClothes();
      } else {
        setUploading(false);
        alert(data.error || "Error listing clothes for sale");
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert("Error uploading the file");
    }
  };

  const messageUser = (username, id) => {
    navigation.navigate("Message", { username, id });
  };

  const sold = async (clothid) => {
    try {
      const response = await fetch(`${apiUrl}/user/soldcloth/delete/${clothid}`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ clothid }),
      });
      const data = await response.json();
      if (data.message === "cloth deleted successfully") {
        fetchClothes();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#e0eafc", "#cfdef3"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Sell Your Clothes</Text>
        
        <View style={styles.form}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {imageFile ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your cloth"
            placeholderTextColor="#666"
          />
          
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <Text style={styles.uploadingText}>Uploading</Text>
                <View style={styles.dotsContainer}>
                  <View style={[styles.dot, { animationDelay: "0s" }]} />
                  <View style={[styles.dot, { animationDelay: "0.2s" }]} />
                  <View style={[styles.dot, { animationDelay: "0.4s" }]} />
                </View>
              </View>
            ) : (
              <Text style={styles.uploadButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Clothes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : clothuser.length ? (
          <View style={styles.clothesList}>
            {clothuser.map((item, index) => (
              <View key={index} style={styles.clothItem}>
                <Image
                  source={{ uri: item.clothImage }}
                  style={styles.clothImage}
                />
                <Text style={styles.clothDescription}>
                  <Text style={styles.label}>Product description:</Text>{" "}
                  {item.description}
                </Text>
                <Text style={styles.clothSeller}>
                  <Text style={styles.label}>Product seller:</Text>{" "}
                  {item.username}
                </Text>
                <Text style={styles.clothPrice}>
                  <Text style={styles.label}>Product price:</Text> ₹{item.price}
                </Text>
                <TouchableOpacity
                  style={styles.soldButton}
                  onPress={() => sold(item._id)}
                >
                  <Text style={styles.soldButtonText}>Sold?</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noItemsText}>No clothes uploaded yet</Text>
        )}

        <Text style={styles.sectionTitle}>Available Clothes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <View style={styles.clothesList}>
            {clothall.length > 0 ? (
              clothall.map((item, index) => (
                <View key={index} style={styles.clothItem}>
                  <Image
                    source={{ uri: item.clothImage }}
                    style={styles.clothImage}
                  />
                  <Text style={styles.clothDescription}>
                    <Text style={styles.label}>Product description:</Text>{" "}
                    {item.description}
                  </Text>
                  <Text style={styles.clothSeller}>
                    <Text style={styles.label}>Product seller:</Text>{" "}
                    {item.username}
                  </Text>
                  <Text style={styles.clothPrice}>
                    <Text style={styles.label}>Product price:</Text> ₹{item.price}
                  </Text>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => messageUser(item.username, item._id)}
                  >
                    <Text style={styles.messageButtonText}>
                      Message {item.username}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>
                No clothes available for sale
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imagePicker: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  imagePickerText: {
    color: "#fff",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingText: {
    color: "#fff",
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: "row",
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 3,
    marginHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#2c3e50",
    marginBottom: 20,
  },
  clothesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },
  clothItem: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get("window").width < 768 ? 160 : 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clothImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
  },
  clothDescription: {
    color: "#555",
    fontSize: 14,
    marginBottom: 5,
  },
  clothSeller: {
    color: "#555",
    fontSize: 14,
    marginBottom: 5,
  },
  clothPrice: {
    color: "#555",
    fontSize: 30,
    marginBottom: 10,
  },
  soldButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  soldButtonText: {
    color: "#fff",
  },
  messageButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  messageButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  noItemsText: {
    fontSize: 26,
    textAlign: "center",
    margin: 20,
    color: "#555",
  },
});

export default SellCloth; 