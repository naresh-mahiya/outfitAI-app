import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { API_URL } from './config';
const ShareClothes = () => {
  const route = useRoute();
  const [sharecloth, setSharedCloth] = useState([]);
  const [username, setUsername] = useState('Users');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const apiUrl = API_URL;
  const token=route.params?.token 
  const id=route.params?.id
  // Define the frontend URL for sharing
  const frontendUrl = "https://outfit-ai-liart.vercel.app";
  console.log('share details', token , id )
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/share/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });

        const data = await response.json();
        if (data && data.share) {
          setSharedCloth(data.share[0].sharecloths);
          setUsername(data.share[0].username);
        } else {
          Alert.alert('Error', 'No shared clothes found');
        }
      } catch (error) {
        console.error('Error fetching shared clothes:', error);
        Alert.alert('Error', 'Failed to fetch shared clothes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const imageGenerate = async () => {
    if (!sharecloth || sharecloth.length === 0) return;

    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:

    ${sharecloth} 
    
    Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;

    try {
      const response = await fetch(`${apiUrl}/imagegenerate/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ shareid: id, prompt: prompt }),
      });

      const data = await response.json();
      if (data.image) {
        setImageUrl(data.image);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image');
    }
  };

  useEffect(() => {
    imageGenerate();
  }, [sharecloth]);

  const copyToClipboard = async () => {
    const url = `${frontendUrl}/share/${id}`;
    try {
      await Clipboard.setStringAsync(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const shareWithFriends = async () => {
    const url = `${frontendUrl}/share/${id}`;
    try {
      await Share.share({
        message: `Check out this outfit I shared with you! ${url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openWhatsApp = async () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Check this out! ${frontendUrl}/share/${id}`
    )}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const openTwitter = async () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Look at this outfit! ${frontendUrl}/share/${id}`
    )}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening Twitter:', error);
      Alert.alert('Error', 'Failed to open Twitter');
    }
  };

  const openEmail = async () => {
    const url = `mailto:?subject=Check this outfit&body=${encodeURIComponent(
      `Here's the outfit link: ${frontendUrl}/share/${id}`
    )}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Failed to open email');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
        <Text style={styles.loadingText}>Loading outfits...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{username}'s Outfits</Text>
      </View>

      <View style={styles.clothesList}>
        <Text style={styles.clothesText}>{sharecloth}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.sectionTitle}>Outfits Preview</Text>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.loadingPreview}>
            <ActivityIndicator size="small" color="#0a84ff" />
            <Text style={styles.loadingPreviewText}>
              Loading preview of the outfits...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.shareContainer}>
        

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowOptions(!showOptions)}
        >
          <Ionicons name="share-social" size={24} color="white" />
          <Text style={styles.buttonText}>Share to Friends</Text>
        </TouchableOpacity>

        {showOptions && (
          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={[styles.shareOption, styles.whatsapp]}
              onPress={openWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text style={styles.optionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareOption, styles.twitter]}
              onPress={openTwitter}
            >
              <Ionicons name="logo-twitter" size={24} color="white" />
              <Text style={styles.optionText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareOption, styles.email]}
              onPress={openEmail}
            >
              <Ionicons name="mail" size={24} color="white" />
              <Text style={styles.optionText}>Email</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  clothesList: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    margin: 16,
    borderRadius: 12,
  },
  clothesText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  loadingPreview: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPreviewText: {
    color: '#666',
    marginTop: 8,
  },
  shareContainer: {
    padding: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareOptions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 5,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  whatsapp: {
    backgroundColor: '#25D366',
    borderColor: '#1da851',
  },
  twitter: {
    backgroundColor: '#1DA1F2',
    borderColor: '#0d8ecf',
  },
  email: {
    backgroundColor: '#FF6F61',
    borderColor: '#e05a4d',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ShareClothes; 