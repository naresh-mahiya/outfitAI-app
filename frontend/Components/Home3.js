import React from 'react';
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

const { width } = Dimensions.get('window');

const Home3 = () => {
  const navigation = useNavigation();
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

  const features = [
    { title: 'AI Outfit Suggestions', route: 'Recommendations' },
    { title: 'AI Fashion Chatbot', route: 'Chatbot' },
    { title: 'Personalized Shopping', route: 'Shop' },
    { title: 'Weather and Location-Based Recommendations', route: 'Recommendations' },
    { title: 'Daily Outfit Planner', route: 'Planner' },
    { title: 'Sell Your Old Clothes', route: 'Sellcloth' },
  ];

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
          <Text style={styles.quoteLine1}>GET YOURSELF</Text>
          <Text style={styles.quoteLine2}>INTO THE RIGHT GEAR</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureItem}
              onPress={() => navigation.navigate(feature.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.featureText}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
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
    alignItems: 'center',
  },
  quoteContainer: {
    marginBottom: 40,
    alignItems: 'flex-end',
  },
  quoteLine1: {
    fontSize: width > 768 ? 48 : width > 480 ? 36 : 32,
    color: 'gray',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    lineHeight: 1.1,
  },
  quoteLine2: {
    fontSize: width > 768 ? 48 : width > 480 ? 36 : 32,
    color: 'white',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    lineHeight: 1.1,
  },
  featuresContainer: {
    width: '100%',
    flexDirection: width > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: width > 768 ? '45%' : '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  featureText: {
    color: '#f9cd98',
    fontSize: width > 768 ? 20 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
});

export default Home3; 