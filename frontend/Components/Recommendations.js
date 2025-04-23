import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Image,
  Keyboard,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Clipboard } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from './config';

const { width, height } = Dimensions.get('window');
const Recommendations = ({route}) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
const token=route.params?.token
  const [clothes, setClothes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const apiUrl = API_URL;

  // Animation effect when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/user/images`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setClothes(data.Wardrobe.allclothes))
      .catch((error) => console.error('Error fetching clothes:', error));
  }, []);

  // Fetch Weather Data
  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for weather data.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const apiKey = 'fc3b1eb09d67c9ebd2d39e4fc7d2bb41';
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.list || data.list.length === 0) {
        console.error('No forecast data available.');
        return;
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const closestForecast = data.list.find(
        (entry) => entry.dt_txt >= today
      );

      if (!closestForecast) {
        console.error('No weather data available for today.');
        return;
      }

      const weatherInfo = {
        date: closestForecast.dt_txt.split(' ')[0],
        temp: closestForecast.main.temp,
        temp_min: closestForecast.main.temp_min,
        temp_max: closestForecast.main.temp_max,
        feels_like: closestForecast.main.feels_like,
        weather: closestForecast.weather[0].description,
        wind: closestForecast.wind.speed,
        humidity: closestForecast.main.humidity,
        rain_probability: closestForecast.pop,
        cloud_cover: closestForecast.clouds.all,
      };

      setWeatherData(weatherInfo);
    } catch (error) {
      console.error('Error fetching weather:', error);
      Alert.alert('Error', 'Failed to fetch weather data.');
    }
  };

  // Toggle Weather Mode
  const toggleWeather = () => {
    setEnabled(!enabled);
    if (!enabled) {
      fetchWeather();
    }
  };

  // Get AI Outfit Recommendation
  const getSuggestion = async (input) => {
    try {
      setIsLoading(true);

      let weather = null;
      if (enabled && weatherData) {
        weather = weatherData;
      }

      const response = await fetch(`${apiUrl}/chat/chatbot`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, clothes, weather }),
      });

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, '')
        .replace(/<.*?>/g, '')
        .trim();

      setIsLoading(false);
      return cleanedResponse || 'No suggestions available.';
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      setIsLoading(false);
      return 'Error fetching suggestion. Check your internet connection and try again';
    }
  };

  // Handle Chat Input
  const handleSubmit = async () => {
    if (!userInput.trim()) {
      Alert.alert('Error', 'Please enter a question.');
      return;
    }

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');

    const reply = await getSuggestion(userInput);
    setMessages([...newMessages, { sender: 'bot', text: reply }]);
  };

  const copyToClipboard = (text, index) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loveSuggestion = async (clothsuggestion) => {
    // console.log('suggestion',clothsuggestion);
    try {
      // Use the token from route params
      const response = await fetch(`${apiUrl}/user/cloth/lovesuggestion/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clothsuggestion }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Outfit saved to your favorites!');
      } else {
        Alert.alert('Error', 'Failed to save outfit');
      }
    } catch (error) {
      console.error('Error saving outfit:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const loadChatHistory = async () => {
    console.log("in chat ")
    try {
      const response = await fetch(`${apiUrl}/chat/chathistory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log
      setChatHistory(data.chatHistory);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchWeather();
    }
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [enabled]);

  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e2e" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit Recommendations</Text>
      </View>
      
      <ScrollView 
        style={styles.container}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainContent, {opacity: fadeAnim}]}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="tshirt-crew" size={28} color="#6c5ce7" />
              <Text style={styles.title}>AI Stylist</Text>
            </View>
            
            <Text style={styles.subtitle}>
              Get personalized outfit recommendations based on your wardrobe
            </Text>
            
            {enabled && weatherData && (
              <View style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <MaterialCommunityIcons 
                    name="weather-partly-cloudy" 
                    size={24} 
                    color="#74b9ff" 
                  />
                  <Text style={styles.weatherTitle}>Weather Info</Text>
                </View>
                <View style={styles.weatherDetails}>
                  <Text style={styles.weatherTemp}>{Math.round(weatherData.temp)}°C</Text>
                  <Text style={styles.weatherDesc}>{weatherData.weather}</Text>
                  <Text style={styles.weatherExtra}>
                    Humidity: {weatherData.humidity}% • Wind: {weatherData.wind} m/s
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Weather-based recommendations</Text>
              <TouchableOpacity
                style={[styles.toggle, enabled && styles.toggleEnabled]}
                onPress={toggleWeather}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.toggleCircle, enabled && styles.toggleCircleEnabled]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="What are you dressing for today?"
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity 
                style={[styles.sendButton, (!userInput.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={handleSubmit}
                disabled={!userInput.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() => setUserInput("Suggest an outfit for a casual day out")}
            >
              <Text style={styles.suggestButtonText}>Casual Day Out</Text>
            </TouchableOpacity>
            
            <View style={styles.suggestRow}>
              <TouchableOpacity
                style={styles.suggestButtonSmall}
                onPress={() => setUserInput("Suggest a formal outfit")}
              >
                <Text style={styles.suggestButtonText}>Formal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.suggestButtonSmall}
                onPress={() => setUserInput("What should I wear for a date?")}
              >
                <Text style={styles.suggestButtonText}>Date Night</Text>
              </TouchableOpacity>
            </View>
           </View> 
          {messages.length > 0 && (
            <View style={styles.messagesContainer}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.message,
                    msg.sender === 'user' ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  {msg.sender === 'user' ? (
                    <View style={styles.userBubble}>
                      <Text style={styles.userMessageText}>{msg.text}</Text>
                    </View>
                  ) : (
                    <View style={styles.botBubble}>
                      <Text style={styles.botMessageText}>{msg.text}</Text>
                      <View style={styles.messageActions}>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={() => copyToClipboard(msg.text, index)}
                        >
                          <Ionicons 
                            name={copiedIndex === index ? "checkmark" : "copy-outline"} 
                            size={16} 
                            color={copiedIndex === index ? "#4cd137" : "#a4b0be"} 
                          />
                          <Text style={styles.copyButtonText}>
                            {copiedIndex === index ? 'Copied' : 'Copy'}
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => loveSuggestion(msg.text)}
                        >
                          <Ionicons name="heart-outline" size={16} color="#ff6b81" />
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => {
                if (!showHistory) {
                  loadChatHistory();
                } else {
                  setShowHistory(false);
                }
              }}
            >
              <Text style={styles.historyButtonText}>
                {showHistory
                  ? 'Hide Previous Conversations'
                  : 'View Chat History'}
              </Text>
            </TouchableOpacity>
          )}
          
          {showHistory && chatHistory && chatHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Previous Conversations</Text>
              {chatHistory.map((chat, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(chat.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyQuestion}>{chat.message}</Text>
                    <Text style={styles.historyResponse}>{chat.response}</Text>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity 
                      style={styles.historyActionButton}
                      onPress={() => copyToClipboard(chat.response, `history-${index}`)}
                    >
                      <Ionicons 
                        name={copiedIndex === `history-${index}` ? "checkmark" : "copy-outline"} 
                        size={16} 
                        color={copiedIndex === `history-${index}` ? "#4cd137" : "#a4b0be"} 
                      />
                      <Text style={styles.historyActionText}>
                        {copiedIndex === `history-${index}` ? 'Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.historyActionButton}
                      onPress={() => loveSuggestion(chat.response)}
                    >
                      <Ionicons name="heart-outline" size={16} color="#ff6b81" />
                      <Text style={styles.historyActionText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#252836',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  mainContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#252836',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a4b0be',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  weatherCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#74b9ff',
    marginLeft: 8,
  },
  weatherDetails: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#dfe6e9',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  weatherExtra: {
    fontSize: 12,
    color: '#a4b0be',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#dfe6e9',
  },
  toggle: {
    width: 50,
    height: 26,
    backgroundColor: '#4b4b69',
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleEnabled: {
    backgroundColor: '#6c5ce7',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    transform: [{ translateX: 0 }],
  },
  toggleCircleEnabled: {
    transform: [{ translateX: 24 }],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#323546',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#4b4b69',
  },
  sendButton: {
    width: 42,
    height: 42,
    backgroundColor: '#6c5ce7',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#4b4b69',
  },
  suggestButton: {
    backgroundColor: '#323546',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4b4b69',
  },
  suggestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestButtonSmall: {
    backgroundColor: '#323546',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#4b4b69',
  },
  suggestButtonText: {
    color: '#a4b0be',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    marginTop: 24,
  },
  message: {
    marginBottom: 16,
    maxWidth: '90%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#6c5ce7',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botBubble: {
    backgroundColor: '#323546',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageText: {
    color: 'white',
    fontSize: 15,
  },
  botMessageText: {
    color: '#dfe6e9',
    fontSize: 15,
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  copyButtonText: {
    color: '#a4b0be',
    fontSize: 12,
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveButtonText: {
    color: '#a4b0be',
    fontSize: 12,
    marginLeft: 4,
  },
  historyButton: {
    backgroundColor: '#323546',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#4b4b69',
  },
  historyButtonText: {
    color: '#dfe6e9',
    fontSize: 15,
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: 24,
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4b4b69',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dfe6e9',
    marginBottom: 16,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#252836',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#a4b0be',
  },
  historyTime: {
    fontSize: 12,
    color: '#a4b0be',
  },
  historyContent: {
    marginBottom: 12,
  },
  historyQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c5ce7',
    marginBottom: 8,
  },
  historyResponse: {
    fontSize: 14,
    color: '#dfe6e9',
    lineHeight: 20,
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  historyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: 8,
  },
  historyActionText: {
    color: '#a4b0be',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default Recommendations;