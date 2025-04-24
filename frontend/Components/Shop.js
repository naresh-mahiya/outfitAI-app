import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from "react-native";
import {API_URL} from './config'
const Shop = () => {
  const [userdetails, setUserdetails] = useState({});
  const [shoppingSuggestions, setShoppingSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loaded, setLoaded] = useState(false);

  const backendurl = API_URL;

  const fetchUserDetails = () => {
    fetch(`${backendurl}/user/getuserdetails`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserdetails(data))
      .catch((err) => console.error("Error fetching user data:", err));
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const getShoppingSuggestions = () => {
    setLoaded(true);
    fetch(`${backendurl}/chat/getshoppingsuggestions`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
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
        setShoppingSuggestions(cloths);
        setLoaded(false);
      })
      .catch((err) => {
        console.error("Error fetching shopping suggestions:", err);
        setLoaded(false);
      });
  };

  const openSearch = (platform, query) => {
    const gender = userdetails?.gender || "";
    let url = "";

    if (platform === "amazon") {
      url = `https://www.amazon.in/s?k=${query} for ${gender}`;
    } else if (platform === "myntra") {
      url = `https://www.myntra.com/${query}?rawQuery=${query}`;
    } else if (platform === "flipkart") {
      url = `https://www.flipkart.com/search?q=${query}`;
    }

    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        Personalized Shopping based on your clothes, age, and preferences
      </Text>

      <Button
        title="Get AI Recommendations"
        onPress={() => {
          fetchUserDetails();
          getShoppingSuggestions();
        }}
      />

      <View style={styles.loading}>
        {loaded ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <Text style={styles.loadingText}>
            Discover the perfect product or let AI inspire your next outfit choice!
          </Text>
        )}
      </View>

      {shoppingSuggestions.length > 0 ? (
        <View style={styles.suggestions}>
          <Text style={styles.subheading}>
            AI suggestions for your clothes based on your wardrobe, age, and preferences.
          </Text>
          <Text>Click on any button to search on Amazon, Myntra, or Flipkart.</Text>

          <View style={styles.pillContainer}>
            {shoppingSuggestions.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.pill}
                onPress={() => setSelectedItem(item)}
              >
                <Text style={styles.pillText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedItem ? (
            <View style={styles.linkButtons}>
              <Button
                title={`Search on Amazon for ${selectedItem}`}
                onPress={() => openSearch("amazon", encodeURIComponent(selectedItem))}
              />
              <Button
                title={`Search on Myntra for ${selectedItem}`}
                onPress={() => openSearch("myntra", encodeURIComponent(selectedItem))}
              />
              <Button
                title={`Search on Flipkart for ${selectedItem}`}
                onPress={() => openSearch("flipkart", encodeURIComponent(selectedItem))}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <Text>No suggestions available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  loading: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  suggestions: {
    marginTop: 20,
    alignItems: "center",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    textAlign: "center",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  pill: {
    backgroundColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
  },
  pillText: {
    fontSize: 14,
  },
  linkButtons: {
    marginTop: 15,
    width: "100%",
    gap: 10,
  },
});

export default Shop;
