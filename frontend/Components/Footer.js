import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Footer = () => {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const handleNavigation = (route) => {
    // You'll need to implement navigation logic here
    console.log(`Navigate to ${route}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Outfit AI</Text>
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => handleNavigation('Home')}>
            <Text style={styles.link}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('About')}>
            <Text style={styles.link}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Features')}>
            <Text style={styles.link}>Features</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Developers')}>
            <Text style={styles.link}>Developers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://www.facebook.com/aditya.kurani.1')}
            style={styles.socialIcon}
          >
            <Ionicons name="logo-facebook" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://www.instagram.com/aditya_kurani_26/')}
            style={styles.socialIcon}
          >
            <Ionicons name="logo-instagram" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://x.com/AdityaKurani')}
            style={styles.socialIcon}
          >
            <Ionicons name="logo-twitter" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://www.linkedin.com/in/aditya-kurani-818668176/')}
            style={styles.socialIcon}
          >
            <Ionicons name="logo-linkedin" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.credits}>
        a Production of{' '}
        <Text
          style={styles.creditLink}
          onPress={() => handleLinkPress('https://www.linkedin.com/in/aditya-kurani-818668176/')}
        >
          Aditya Kurani
        </Text>{' '}
        &{' '}
        <Text
          style={styles.creditLink}
          onPress={() => handleLinkPress('https://linkedin.com/in/paras-rana-696b7731b/')}
        >
          Paras Rana
        </Text>
      </Text>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} Outfit AI. All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 20,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 900,
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: 'aliceblue',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  link: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  socialIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  credits: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  creditLink: {
    textDecorationLine: 'underline',
    color: 'white',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Footer; 