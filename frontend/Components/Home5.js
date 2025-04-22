import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Home5 = () => {
  const navigation = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTryNow = () => {
    navigation.navigate('Recommendations');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.quote}>
          Ditch the <Text style={styles.red}>Guesswork</Text>—Let{' '}
          <Text style={styles.green}>AI </Text>Define Your Look.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleTryNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ff4b2b', '#ff416c']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Try Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quote: {
    fontSize: width > 768 ? 48 : width > 480 ? 36 : 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'Poppins' : 'Poppins-Bold',
  },
  red: {
    color: '#ff4b2b',
  },
  green: {
    color: '#2e8b57',
  },
  ctaButton: {
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
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: width > 768 ? 24 : 20,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Poppins' : 'Poppins-Bold',
  },
});

export default Home5; 