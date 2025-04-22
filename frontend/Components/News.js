import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const API_KEY = "b5cc8330c1324e7886e6021e6dcd4c2e";
const BASE_URL = "https://newsapi.org/v2";

const getCelebrityNews = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: 'Celebrity fashion trends',
        language: "en",
        sortBy: "relevancy",
        apiKey: API_KEY,
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching celebrity news:", error);
    return [];
  }
};

const CelebrityNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const news = await getCelebrityNews();
      setArticles(news);
      setLoading(false);
    };

    fetchNews();
  }, []);

  const openArticle = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#1a1a1a", "#222"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Celebrity Trends</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        ) : articles.length > 0 ? (
          articles.map((article, index) => (
            <View key={index} style={styles.articleContainer}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDescription}>{article.description}</Text>
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => openArticle(article.url)}
              >
                <Text style={styles.readMoreText}>Read More</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noArticles}>No articles available</Text>
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
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  articleContainer: {
    backgroundColor: "#424242",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  articleTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  articleDescription: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  readMoreButton: {
    backgroundColor: "#363e45",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  readMoreText: {
    color: "#1e90ff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noArticles: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default CelebrityNews; 