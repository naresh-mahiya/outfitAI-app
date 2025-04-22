import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  const loadWishlist = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/getwishlist`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setWishlist(data || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      Alert.alert("Error", "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleProductPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Failed to open product link");
    }
  };

  const renderItem = ({ item }) => {
    const { _id, wishlistitem } = item;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(wishlistitem.product_url)}
      >
        <Image
          source={{ uri: wishlistitem.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {wishlistitem.name === "N/A" || !wishlistitem.name
              ? "Amazon product"
              : wishlistitem.name}
          </Text>
          <Text style={styles.price}>
            {wishlistitem.price === "N/A" || !wishlistitem.price
              ? "Price not available"
              : wishlistitem.price}
          </Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleProductPress(wishlistitem.product_url)}
          >
            <Text style={styles.buttonText}>View Product</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Wishlist</Text>
      {wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No items in wishlist</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f0f0f0",
    textAlign: "center",
    marginBottom: 24,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    margin: 8,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: "100%",
    height: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  infoContainer: {
    padding: 12,
    backgroundColor: "#232323",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f0f0f0",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6f61",
    padding: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
});

export default Wishlist; 