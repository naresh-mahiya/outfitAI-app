import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';

const AboutUs = () => {
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About Us</Text>
        <Text style={styles.headerText}>
          We are the team behind Outfit AI - revolutionizing fashion with AI technology.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          Our mission is to provide users with an innovative platform for
          personalized fashion recommendations, wardrobe management, and a
          seamless online shopping experience. We leverage Artificial
          Intelligence and Augmented Reality to make your wardrobe smarter and
          more efficient.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.sectionText}>
          We envision a future where fashion is tailored to every individual's
          style and needs. With our AI-driven wardrobe assistant, we aim to
          simplify the way people shop, organize, and interact with their
          clothes. We believe that technology can transform the fashion industry
          by creating personalized and sustainable wardrobe solutions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Team</Text>
        <View style={styles.teamList}>
          <Text style={styles.teamMember}>
            <Text style={styles.memberName}>Aditya Kurani </Text>
            <Text 
              style={styles.email}
              onPress={() => handleEmailPress('adityakurani26@gmail.com')}
            >
              (adityakurani26@gmail.com)
            </Text>
            : Frontend development (UI/UX) and Backend integration (API setup,
            database management, Fashion Recommendations).
          </Text>

          <Text style={styles.teamMember}>
            <Text style={styles.memberName}>Paras Rana </Text>
            <Text 
              style={styles.email}
              onPress={() => handleEmailPress('parasrana579@gmail.com')}
            >
              (parasrana579@gmail.com)
            </Text>
            : AI model development for Cloth identification and shopping.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  header: {
    backgroundColor: '#333',
    padding: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'rgb(76, 74, 74)',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  teamList: {
    marginTop: 10,
  },
  teamMember: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginBottom: 15,
  },
  memberName: {
    fontWeight: 'bold',
  },
  email: {
    color: '#1a73e8',
    textDecorationLine: 'underline',
  },
});

export default AboutUs; 