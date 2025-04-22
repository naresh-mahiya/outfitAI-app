import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Image = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const imageGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    const prompt = `
    Generate an image of a mannequin wearing all of the following outfits:
    
    Option 1 (Casual Chic): A red shirt, red jeans, a gray hoodie, and brown boots.
    Option 2 (Smart Casual): A pink/red plaid shirt, brown pants, a brown jacket, and brown boots.
    Option 3 (Layered Warmth): A white shirt, a navy blue sweater, a gray jacket, a gray scarf, a gray beanie, and brown boots.
    
    Each outfit should be clearly visible on the mannequin, and the mannequin should be standing in a neutral pose to showcase the different styles.
    `;

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/getimage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('Image data:', data);

      if (data.image) {
        setImageUrl(data.image);
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      setError('An error occurred while generating the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={imageGenerate}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="image-outline" size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Generate Image</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ff4d4d" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {imageUrl && (
        <View style={styles.imageContainer}>
          <RNImage
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: '#ff4d4d',
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  imageContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  image: {
    width: width - 40,
    height: width - 40,
    backgroundColor: 'white',
  },
});

export default Image; 