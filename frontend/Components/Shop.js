import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from './config';

const { width } = Dimensions.get("window");

const Shop = ({ token }) => {
  const [userdetails, setUserdetails] = useState({});
  const [shoppingSuggestions, setShoppingSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const backendurl = API_URL;

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${backendurl}/user/getuserdetails`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserdetails(data);
        
        // Load search history if available
        if (data.searchHistory && Array.isArray(data.searchHistory)) {
          setSearchHistory(data.searchHistory);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [token]);

  const getShoppingSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendurl}/chat/getshoppingsuggestions`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
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
        
        // Add last item if exists
        if (item.trim()) {
          cloths.push(item.trim());
        }
        
        setShoppingSuggestions(cloths);
      }
    } catch (err) {
      console.error("Error fetching shopping suggestions:", err);
      // Fallback to mock suggestions if API fails
      setShoppingSuggestions([
        "Black slim-fit jeans",
        "White cotton t-shirt",
        "Navy blue blazer",
        "Leather sneakers",
        "Casual denim jacket",
        "Formal white shirt"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToSearchHistory = async (item) => {
    try {
      if (!token) return;
      
      await fetch(`${backendurl}/user/addtowishlist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });
      
      // Update search history locally
      if (!searchHistory.includes(item)) {
        setSearchHistory([...searchHistory, item]);
      }
    } catch (err) {
      console.error("Error adding to search history:", err);
    }
  };

  const openSearch = (platform, query) => {
    const gender = userdetails?.gender || "";
    let url = "";

    if (platform === "amazon") {
      url = `https://www.amazon.in/s?k=${query}`;
    } else if (platform === "myntra") {
      url = `https://www.myntra.com/${query}?rawQuery=${query}`;
    } else if (platform === "flipkart") {
      url = `https://www.flipkart.com/search?q=${query}`;
    }

    // Add to search history
    addToSearchHistory(query);
    
    // Open URL
    Linking.openURL(url);
  };

  const platformDetails = {
    amazon: {
      name: "Amazon",
      icon: "logo-amazon",
      color: "#FF9900",
      bgColor: "rgba(255, 153, 0, 0.1)",
    },
    myntra: {
      name: "Myntra",
      icon: "shirt-outline",
      color: "#FF3F6C",
      bgColor: "rgba(255, 63, 108, 0.1)",
    },
    flipkart: {
      name: "Flipkart",
      icon: "cart-outline",
      color: "#2874F0",
      bgColor: "rgba(40, 116, 240, 0.1)",
    },
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
          <Text style={styles.heading}>AI Shopping Assistant</Text>
          <Text style={styles.subheading}>
            Discover perfect items based on your style
          </Text>
        </LinearGradient>

        <TouchableOpacity
          style={styles.getRecommendationsButton}
          onPress={() => {
            fetchUserDetails();
            getShoppingSuggestions();
          }}
        >
          <LinearGradient
            colors={['#6C5CE7', '#8A7BFF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.getRecommendationsGradient}
          >
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            <Text style={styles.getRecommendationsText}>Get AI Recommendations</Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.loadingText}>Finding perfect items for your style...</Text>
          </View>
        ) : shoppingSuggestions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={60} color="#6C5CE7" />
            <Text style={styles.emptyStateText}>
              Tap "Get AI Recommendations" to discover items that match your style
            </Text>
          </View>
        ) : (
          <View style={styles.suggestions}>
            <View style={styles.suggestionsTitleContainer}>
              <Ionicons name="bulb-outline" size={22} color="#6C5CE7" />
              <Text style={styles.suggestionsTitle}>
                Recommended For You
              </Text>
            </View>
            
            <View style={styles.pillContainerWrapper}>
              <LinearGradient
                colors={['#1E1E1E', '#252525']}
                style={styles.pillContainerGradient}
              >
                <View style={styles.pillContainer}>
                  {shoppingSuggestions.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pill,
                        selectedItem === item ? styles.pillSelected : null,
                      ]}
                      onPress={() => setSelectedItem(item)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={selectedItem === item 
                          ? ['rgba(108, 92, 231, 0.2)', 'rgba(108, 92, 231, 0.3)'] 
                          : ['#2A2A2A', '#333333']}
                        style={styles.pillGradient}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selectedItem === item ? styles.pillTextSelected : null,
                          ]}
                        >
                          {item}
                        </Text>
                        {selectedItem === item && (
                          <Ionicons name="checkmark-circle" size={16} color="#6C5CE7" style={styles.pillIcon} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </View>

            {selectedItem && (
              <View style={styles.platformSection}>
                <View style={styles.selectedItemHeader}>
                  <Text style={styles.shopOnText}>
                    Results for: <Text style={styles.selectedItemHighlight}>{selectedItem}</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setSelectedItem("")}
                  >
                    <Ionicons name="close-circle" size={24} color="#6C5CE7" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.platformCards}>
                  {Object.keys(platformDetails).map((platform) => (
                    <TouchableOpacity
                      key={platform}
                      style={styles.platformCard}
                      onPress={() => openSearch(platform, encodeURIComponent(selectedItem))}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.platformIconContainer,
                        { backgroundColor: platformDetails[platform].bgColor }
                      ]}>
                        <Ionicons 
                          name={platformDetails[platform].icon} 
                          size={28} 
                          color={platformDetails[platform].color} 
                        />
                      </View>
                      <View style={styles.platformInfo}>
                        <Text style={styles.platformName}>
                          {platformDetails[platform].name}
                        </Text>
                        <Text style={styles.platformAction}>
                          Search for "{selectedItem.length > 15 ? selectedItem.substring(0, 15) + '...' : selectedItem}"
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6C5CE7" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {searchHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyTitleContainer}>
                  <Ionicons name="time-outline" size={20} color="#6C5CE7" />
                  <Text style={styles.historyTitle}>Recent Searches</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.historyContainer}
                >
                  {searchHistory.slice(0, 10).map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.historyItem}
                      onPress={() => setSelectedItem(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={16} color="#AAAAAA" />
                      <Text style={styles.historyText}>
                        {item.length > 20 ? item.substring(0, 20) + '...' : item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
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
  getRecommendationsButton: {
    marginHorizontal: 20,
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
  getRecommendationsGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  getRecommendationsText: {
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
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 15,
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyStateText: {
    marginTop: 15,
    color: "#CCCCCC",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  suggestions: {
    marginHorizontal: 20,
  },
  suggestionsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  pillContainerWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pillContainerGradient: {
    padding: 16,
    borderRadius: 16,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    margin: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  pillGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillSelected: {
    ...Platform.select({
      ios: {
        shadowColor: "#6C5CE7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  pillTextSelected: {
    color: "#6C5CE7",
    fontWeight: "bold",
  },
  pillIcon: {
    marginLeft: 6,
  },
  platformSection: {
    marginTop: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
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
  selectedItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  shopOnText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  selectedItemHighlight: {
    color: "#6C5CE7",
    fontWeight: "bold",
  },
  clearButton: {
    padding: 5,
  },
  platformCards: {
    gap: 12,
  },
  platformCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  platformIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  platformAction: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  historySection: {
    marginTop: 10,
  },
  historyTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  historyContainer: {
    paddingBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  historyText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 6,
  },
});

export default Shop;