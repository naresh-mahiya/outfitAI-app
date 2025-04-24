import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from './config';

const { width } = Dimensions.get("window");

const Upload = () => {
  const [imageUri, setImageUri] = useState(null);
  const [clothingItems, setClothingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0); // 0: initial, 1: uploading, 2: classifying
  const navigation = useNavigation();

  const backend_url = API_URL;

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setUploadStep(1);

      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to media library.");
        setIsLoading(false);
        setUploadStep(0);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) {
        setIsLoading(false);
        setUploadStep(0);
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
      
      // Assuming your backend returns a token along with the response data
      const token = uploadResponse.data.token; // Adjust based on your response structure
      
      setUploadStep(2);
      
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
      setTimeout(() => {
        navigation.navigate("Profile", { token: token });
      }, 3500); // Show results for 1.5 seconds before navigating

    } catch (error) {
      console.error("Error uploading or classifying image:", error.message);
      Alert.alert("Error", "Failed to upload and classify the image.");
    } finally {
      setIsLoading(false);
      setUploadStep(0);
    }
  };

  const renderLoadingState = () => {
    const loadingMessages = [
      "Uploading your image...",
      "AI analyzing your clothing items...",
    ];
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>
          {loadingMessages[uploadStep - 1]}
        </Text>
        {uploadStep === 2 && (
          <View style={styles.loadingProgress}>
            <Ionicons name="checkmark-circle" size={20} color="#6C5CE7" />
            <Text style={styles.loadingProgressText}>Upload complete</Text>
          </View>
        )}
      </View>
    );
  };

  const renderClothingItems = () => {
    if (clothingItems.length === 0) return null;
    
    return (
      <LinearGradient
        colors={['#1E1E1E', '#252525']}
        style={styles.clothingItemsContainer}
      >
        <View style={styles.clothingItemsHeader}>
          <Ionicons name="shirt-outline" size={24} color="#6C5CE7" />
          <Text style={styles.clothingItemsTitle}>
            Clothing Items Detected
          </Text>
        </View>
        
        <View style={styles.itemsList}>
          {clothingItems.map((item, index) => (
            <View key={index} style={styles.clothingItem}>
              <LinearGradient
                colors={['#2A2A2A', '#333333']}
                style={styles.clothingItemGradient}
              >
                <Ionicons 
                  name={getItemIcon(item.item)} 
                  size={20} 
                  color="#6C5CE7" 
                  style={styles.itemIcon}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <View style={styles.colorContainer}>
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: getColorHex(item.color) }
                      ]} 
                    />
                    <Text style={styles.itemColor}>{item.color}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </LinearGradient>
    );
  };

  // Helper function to get icon based on clothing item
  const getItemIcon = (itemName) => {
    const itemName_lower = itemName.toLowerCase();
    if (itemName_lower.includes('shirt') || itemName_lower.includes('top') || itemName_lower.includes('blouse')) {
      return 'shirt-outline';
    } else if (itemName_lower.includes('pant') || itemName_lower.includes('trouser') || itemName_lower.includes('jeans')) {
      return 'ios-git-branch-outline';
    } else if (itemName_lower.includes('shoe') || itemName_lower.includes('sneaker') || itemName_lower.includes('boot')) {
      return 'footsteps-outline';
    } else if (itemName_lower.includes('jacket') || itemName_lower.includes('coat')) {
      return 'ios-business-outline';
    } else if (itemName_lower.includes('hat') || itemName_lower.includes('cap')) {
      return 'ios-golf-outline';
    } else if (itemName_lower.includes('dress')) {
      return 'ios-woman-outline';
    } else {
      return 'ios-cube-outline';
    }
  };

  // Helper function to convert color names to hex
  const getColorHex = (colorName) => {
    const colors = {
      'red': '#FF5252',
      'blue': '#536DFE',
      'green': '#4CAF50',
      'yellow': '#FFD740',
      'black': '#212121',
      'white': '#FFFFFF',
      'gray': '#9E9E9E',
      'grey': '#9E9E9E',
      'purple': '#7C4DFF',
      'pink': '#FF4081',
      'orange': '#FF9800',
      'brown': '#795548',
      'navy': '#3F51B5',
      'teal': '#009688',
      'olive': '#827717',
      'maroon': '#B71C1C',
      'beige': '#F5F5DC',
      'tan': '#D2B48C',
    };
    
    // Check if the color name contains any of our known colors
    const colorLower = colorName.toLowerCase();
    for (const [name, hex] of Object.entries(colors)) {
      if (colorLower.includes(name)) {
        return hex;
      }
    }
    
    // Default color if no match
    return '#9E9E9E';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1E1E1E', '#121212']}
          style={styles.header}
        >
          <Text style={styles.heading}>Upload Clothing</Text>
          <Text style={styles.subheading}>
            Add items to your virtual wardrobe
          </Text>
        </LinearGradient>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#6C5CE7', '#8A7BFF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.uploadButtonGradient}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {imageUri ? "Choose Another Image" : "Upload & Classify Image"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoading && renderLoadingState()}

          {imageUri && !isLoading && (
            <View style={styles.imagePreviewContainer}>
              <LinearGradient
                colors={['#1E1E1E', '#252525']}
                style={styles.imagePreviewGradient}
              >
                <View style={styles.imagePreviewHeader}>
                  <Ionicons name="image-outline" size={20} color="#6C5CE7" />
                  <Text style={styles.imagePreviewTitle}>Image Preview</Text>
                </View>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              </LinearGradient>
            </View>
          )}

          {clothingItems.length > 0 && !isLoading && renderClothingItems()}

          {!isLoading && !imageUri && (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={60} color="#6C5CE7" />
              <Text style={styles.emptyStateText}>
                Upload an image of your clothing item to add it to your wardrobe
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subheading: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  uploadSection: {
    paddingHorizontal: 20,
  },
  uploadButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6C5CE7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loadingText: {
    marginTop: 15,
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  loadingProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(108, 92, 231, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  loadingProgressText: {
    color: "#6C5CE7",
    marginLeft: 6,
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imagePreviewGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  imagePreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  imagePreviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  imagePreview: {
    width: "100%",
    height: width * 0.8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  clothingItemsContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  clothingItemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  clothingItemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  itemsList: {
    padding: 12,
  },
  clothingItem: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  clothingItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  itemColor: {
    fontSize: 14,
    color: "#AAAAAA",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateText: {
    marginTop: 15,
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default Upload;
