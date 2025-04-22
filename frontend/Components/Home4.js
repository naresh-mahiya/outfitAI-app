import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { quotesData } from './quotes';

const { width } = Dimensions.get('window');

const Home4 = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getRandomQuote = () => {
    const allQuotes = [
      ...quotesData.fashion_quotes,
      ...quotesData.confidence_quotes,
    ];
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    setMessage(randomQuote);
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.quoteContainer}>
          <LinearGradient
            colors={['#ff8a00', '#e52e71']}
            style={styles.gradientText}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.aiText}>AI</Text>
          </LinearGradient>
          <Text style={styles.quoteText}>Meets Aesthetic</Text>
          <Text style={styles.subtitle}>Let AI Style You, So You Can Serve Looks</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Explore Now</Text>
        </TouchableOpacity>

        <View style={styles.askAiContainer}>
          <TouchableOpacity
            style={styles.askAiButton}
            onPress={getRandomQuote}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff416c', '#ff4b2b']}
              style={styles.askAiGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.askAiButtonText}>Ask AI for a Tip</Text>
            </LinearGradient>
          </TouchableOpacity>

          {message && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>{message}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  quoteContainer: {
    marginBottom: 30,
  },
  gradientText: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  quoteText: {
    fontSize: width > 768 ? 48 : width > 480 ? 36 : 32,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  subtitle: {
    fontSize: width > 768 ? 24 : 20,
    color: 'gray',
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  ctaButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  ctaButtonText: {
    color: 'black',
    fontSize: width > 768 ? 24 : 20,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  askAiContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  askAiButton: {
    borderRadius: 50,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#ff416c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  askAiGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  askAiButtonText: {
    color: 'white',
    fontSize: width > 768 ? 20 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tipText: {
    color: 'white',
    fontSize: width > 768 ? 20 : 18,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
});

export default Home4; 