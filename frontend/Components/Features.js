import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Features = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Outfit AI Assistant - Features</Text>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>AI-Powered Fashion Recommendations</Text>
        <Text style={styles.featureDescription}>
          Personalized outfit suggestions based on weather, events, and user preferences.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>Virtual Wardrobe Organization</Text>
        <Text style={styles.featureDescription}>
          Users can upload and organize their wardrobe for better planning and selection.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>Outfit Mix & Match</Text>
        <Text style={styles.featureDescription}>
          Generate various outfit combinations based on user preferences and available clothing items.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>E-Commerce Integration</Text>
        <Text style={styles.featureDescription}>
          Seamless shopping experience through platforms like Shopify, Amazon, and Flipkart, allowing users to buy items directly.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>Weather-Based Outfit Recommendations</Text>
        <Text style={styles.featureDescription}>
          The app uses weather data (via OpenWeatherMap API) to suggest outfits appropriate for the current weather conditions.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>User Personalization</Text>
        <Text style={styles.featureDescription}>
          The AI learns user preferences over time and offers more accurate recommendations based on their style, events, and preferences.
        </Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>Integration with External APIs</Text>
        <Text style={styles.featureDescription}>
          Uses e-commerce APIs to allow users to shop for clothing directly from the app. Weather data is used for clothing suggestions.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  featureItem: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});

export default Features; 