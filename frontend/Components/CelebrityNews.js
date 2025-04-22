import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { getCelebrityNews } from "./News";

const CelebrityNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await getCelebrityNews();
        setArticles(news);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleArticlePress = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Celebrity Trends</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" style={styles.loader} />
      ) : articles.length > 0 ? (
        articles.map((article, index) => (
          <View key={index} style={styles.article}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleDescription}>{article.description}</Text>
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => handleArticlePress(article.url)}
            >
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noArticles}>No articles available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d2d2d",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  article: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#424242",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    color: "#e0e0e0",
    marginBottom: 12,
    lineHeight: 20,
  },
  readMoreButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
  noArticles: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default CelebrityNews; 