import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NotFound = () => {
  const navigation = useNavigation();
  const [count, setCount] = useState(5);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigation.navigate('Home');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Oops! Page Not Found</Text>
        <Text style={styles.message}>
          The page you are trying to visit does not exist.{'\n'}
          We are working on developing this page.
        </Text>
        <Text style={styles.redirectMessage}>
          Redirecting you to the home page in{' '}
          <Text style={styles.countdown}>{count}</Text> seconds...
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go Home Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: width > 768 ? '50%' : '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: width > 768 ? 28 : 24,
    color: '#ff4d4d',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  message: {
    fontSize: width > 768 ? 18 : 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  redirectMessage: {
    fontSize: width > 768 ? 18 : 16,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  countdown: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: width > 768 ? 18 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
});

export default NotFound; 