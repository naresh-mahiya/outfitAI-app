import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Shop = () => {
  const [shopData, setShopData] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(5);
  const [loading, setLoading] = useState(false);
  const [userdetails, setuserdetails] = useState({});
  const [input, setInput] = useState("");
  const [amazon, setamazon] = useState(false);
  const [myntra, setmyntra] = useState(false);
  const [amazonData, setAmazonData] = useState([]);
  const [myntraData, setMyntraData] = useState([]);
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [myntraLoading, setMyntraLoading] = useState(false);
  const [visibleAmazonProducts, setVisibleAmazonProducts] = useState(5);
  const [visibleMyntraProducts, setVisibleMyntraProducts] = useState(5);
  const [loaded, setloaded] = useState(false);
  const [shoppingsuggestionsmain, setshoppingsuggestions] = useState([]);

  const backendurl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const mlurl = process.env.EXPO_PUBLIC_ML_URL;

  const fetchuserdetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setuserdetails(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  useEffect(() => {
    fetchuserdetails();
  }, []);

  const amazonSearch = (customInput) => {
    setloaded(true);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${userdetails.gender || "male and female which are trending"}`;
    console.log("search query is ", searchQuery);
    setAmazonLoading(true);
    fetch(`${mlurl}/shop?query=${encodeURIComponent(searchQuery)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAmazonData(data);
        setVisibleAmazonProducts(7);
        setAmazonLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Amazon data:", error);
        setAmazonLoading(false);
      });
  };

  const myntraSearch = (customInput) => {
    setloaded(true);
    const searchQuery =
      customInput ||
      input ||
      `Styles for ${userdetails.gender || "male and female"}`;
    setMyntraLoading(true);
    fetch(`${mlurl}/shop_myntra?query=${encodeURIComponent(searchQuery)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMyntraData(data);
        setVisibleMyntraProducts(5);
        setMyntraLoading(false);
        setloaded(false);
      })
      .catch((error) => {
        console.error("Error fetching Myntra data:", error);
        setMyntraLoading(false);
      });
  };

  const addtowishlist = (item) => {
    console.log("Wishlist item:", item);

    fetch(`${backendurl}/shop/addtowishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);

        if (data.status) {
          alert("Item added to wishlist!");
        } else if (data.msg === "Already in wishlist") {
          alert("This item is already in your wishlist.");
        } else {
          alert("Failed to add item. Try again.");
        }
      })
      .catch((error) => {
        console.error("Error adding to wishlist:", error);
        alert("Server error. Please try again later.");
      });
  };

  const shoppingsuggestions = () => {
    setloaded(true);
    fetch(`${backendurl}/chat/getshoppingsuggestions`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const suggestion = data.suggestion;
        const cloths = [];
        let item = "";

        for (let i = 0; i < suggestion.length; i++) {
          if (suggestion[i] === "*") {
            if (item.trim()) {
              cloths.push(item.trim());
              item = "";
            }
          } else {
            item += suggestion[i];
          }
        }
        setloaded(false);
        console.log("clothssuggestion array", cloths);
        setshoppingsuggestions(cloths);
      })
      .catch((error) => {
        console.error("Error fetching shopping suggestions:", error);
      });
  };

  const renderProductCard = (product, isAmazon = true) => (
    <View style={styles.productCard} key={product.id}>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₹{product.price}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => Linking.openURL(product.url)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => addtowishlist(product)}
        >
          <Ionicons name="heart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Personalised Shopping based on your clothes, age and preferences
      </Text>

      <TextInput
        style={styles.searchInput}
        onChangeText={setInput}
        placeholder="Enter the clothes you wanna search"
        value={input}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => amazonSearch(input)}
        >
          <Text style={styles.searchButtonText}>Search Amazon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => myntraSearch(input)}
        >
          <Text style={styles.searchButtonText}>Search Myntra</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.recommendationButton}
          onPress={() => {
            fetchuserdetails();
            shoppingsuggestions();
          }}
        >
          <Text style={styles.recommendationButtonText}>
            Get AI Recommendations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBothButton}
          onPress={() => {
            amazonSearch(input);
            myntraSearch(input);
          }}
        >
          <Text style={styles.searchBothButtonText}>
            Search on amazon and myntra
          </Text>
        </TouchableOpacity>
      </View>

      {loaded ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <Text style={styles.loadingMessage}>
          Discover the perfect product or let AI inspire your next outfit choice!
        </Text>
      )}

      {shoppingsuggestionsmain.length > 0 && (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionHeading}>AI Recommendations</Text>
          <View style={styles.pillWrapper}>
            {shoppingsuggestionsmain.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionPill}
                onPress={() => {
                  amazonSearch(suggestion);
                  myntraSearch(suggestion);
                }}
              >
                <Text style={styles.suggestionPillText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.searchResultsContainer}>
        {amazonData.length > 0 && (
          <View style={styles.platformContainer}>
            <Text style={styles.platformTitle}>Amazon Results</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {amazonData
                .slice(0, visibleAmazonProducts)
                .map((product) => renderProductCard(product, true))}
            </ScrollView>
          </View>
        )}

        {myntraData.length > 0 && (
          <View style={styles.platformContainer}>
            <Text style={styles.platformTitle}>Myntra Results</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {myntraData
                .slice(0, visibleMyntraProducts)
                .map((product) => renderProductCard(product, false))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  searchButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 5,
    margin: 5,
    minWidth: 150,
  },
  searchButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  recommendationButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    margin: 5,
    minWidth: 150,
  },
  recommendationButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  searchBothButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    margin: 5,
    minWidth: 150,
  },
  searchBothButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loadingMessage: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginVertical: 20,
  },
  suggestionContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  suggestionHeading: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#333",
    padding: 10,
    borderRadius: 23,
  },
  pillWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  suggestionPill: {
    backgroundColor: "#111",
    padding: 8,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: "#444",
  },
  suggestionPillText: {
    color: "#fff",
    fontSize: 14,
  },
  searchResultsContainer: {
    marginTop: 20,
  },
  platformContainer: {
    marginBottom: 30,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  productCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007600",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#ff9900",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  buyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  wishlistButton: {
    padding: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default Shop; 