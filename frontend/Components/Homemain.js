import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Homemain = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/project2_image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
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
          <Text style={styles.quoteLine1}>Why guess</Text>
          <Text style={styles.quoteLine2}>what to wear?</Text>
          <Text style={styles.quoteLine3}>
            Let AI style you with precision and confidence.
          </Text>
        </View>

        <View style={styles.secondQuoteContainer}>
          <Text style={styles.secondQuoteLine1}>Smart styling,</Text>
          <Text style={styles.highlightText}>powered by AI</Text>
          <Text style={styles.secondQuoteLine2}>
            — because every outfit should feel like your best one.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.8,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: width,
    height: height * 0.8,
    transform: [{ scale: 1.3 }],
  },
  content: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  quoteContainer: {
    position: 'absolute',
    top: '70%',
    left: '5%',
    transform: [{ translateY: -50 }],
    width: '70%',
  },
  quoteLine1: {
    color: 'white',
    fontSize: width > 1024 ? 80 : width > 768 ? 48 : 40,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    lineHeight: 1,
  },
  quoteLine2: {
    color: 'white',
    fontSize: width > 1024 ? 80 : width > 768 ? 48 : 40,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    lineHeight: 1,
    marginTop: 10,
  },
  quoteLine3: {
    color: 'white',
    fontSize: width > 1024 ? 24 : width > 768 ? 20 : 18,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    marginTop: 20,
  },
  secondQuoteContainer: {
    position: 'absolute',
    top: '58%',
    left: '68%',
    transform: [{ translateY: -50 }],
    width: '30%',
  },
  secondQuoteLine1: {
    color: 'white',
    fontSize: width > 1024 ? 32 : width > 768 ? 24 : 20,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'Roboto',
    lineHeight: 1,
  },
  highlightText: {
    color: '#FF6B6B',
    fontSize: width > 1024 ? 32 : width > 768 ? 24 : 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'Roboto',
    lineHeight: 1,
    marginTop: 10,
  },
  secondQuoteLine2: {
    color: 'white',
    fontSize: width > 1024 ? 32 : width > 768 ? 24 : 20,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'Roboto',
    lineHeight: 1,
    marginTop: 10,
  },
});

export default Homemain; 