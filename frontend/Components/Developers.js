import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Developers = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="code-slash" size={40} color="#FF6B6B" />
          <Text style={styles.headerTitle}>Outfit AI - Developer's Page</Text>
          <Text style={styles.headerDescription}>
            An innovative platform to help users with personalized fashion recommendations and virtual wardrobe organization.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <Text style={styles.sectionText}>
            The Wardrobe AI Assistant leverages Artificial Intelligence and Augmented Reality to provide personalized fashion
            recommendations, virtual wardrobe organization, and integrated e-commerce shopping experiences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet the Team</Text>
          <View style={styles.teamList}>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Aditya kurani</Text> - Web Developer (Fashion Recommedation)
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Paras Rana</Text> - AI/ML Developer (Shopping and Cloth identification)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tech Stack</Text>
          <View style={styles.techList}>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Frontend:</Text> React.js, TailwindCSS
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Backend:</Text> Express.js, Node.js
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Database:</Text> MongoDB
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>AI/ML:</Text> Python - Cloth identification model and Google Gemini
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Weather API:</Text> OpenWeatherMap API
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>E-commerce Integration:</Text> Shopify, Amazon, Myntra Data scraping
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Authentication:</Text> OAuth 2.0 (Google, Apple and Facebook)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>AI-Powered Fashion Recommendations:</Text> Personalized outfit suggestions based on weather, events, and user preferences.
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Virtual Wardrobe Organization:</Text> Users can upload their wardrobe and organize it for efficient planning.
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>Outfit Mix & Match:</Text> Generate various outfit combinations based on user preferences and available items.
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.boldText}>E-Commerce Integration:</Text> Seamless shopping experience by integrating with platforms like Shopify, Amazon, Myntra and Flipkart.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
  },
  teamList: {
    marginTop: 10,
  },
  techList: {
    marginTop: 10,
  },
  featuresList: {
    marginTop: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 10,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

export default Developers; 