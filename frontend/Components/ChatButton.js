import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ChatButton = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [onChatPage, setOnChatPage] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(40)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setOnChatPage(route.name === 'Chatbot');
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [route.name]);

  const handleNavigate = () => {
    navigation.navigate('Chatbot');
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handleNavigate}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{onChatPage ? '👋' : '🤖'}</Text>
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Chat with AI</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#2f2f2f',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emoji: {
    fontSize: 28,
  },
  tooltip: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    opacity: 0,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
});

export default ChatButton; 