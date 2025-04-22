import React, { useState, useEffect } from 'react';
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
  Clipboard,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const Recommendations = () => {
  const [clothes, setClothes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

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

  const copyToClipboard = async (text, index) => {
    await Clipboard.setStringAsync(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/chat/chathistory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      setHistory(data.chatHistory);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const loveSuggestion = (clothSuggestion) => {
    fetch(`${apiUrl}/user/cloth/lovesuggestion/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ clothSuggestion }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>AI Outfit Recommender</Text>
        <Text style={styles.subtitle}>
          The AI knows your uploaded clothes, so just ask for outfit suggestions!
        </Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggle, enabled && styles.toggleEnabled]}
            onPress={toggleWeather}
          >
            <View style={styles.toggleCircle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.weatherStatus}>
          {enabled
            ? 'Weather and location-based recommendation ON'
            : 'Weather and location-based recommendation OFF'}
        </Text>

        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Describe the event (e.g., Wedding, Casual Meetup)"
          placeholderTextColor="#ffffff"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Get Outfit</Text>
          )}
        </TouchableOpacity>

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
                <Text style={styles.messageText}>{msg.text}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(msg.text, index)}
                >
                  <Text style={styles.copyButtonText}>
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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
              : 'Like a suggested outfit ?'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f2f2f',
  },
  card: {
    backgroundColor: '#434343',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  toggle: {
    width: 50,
    height: 25,
    backgroundColor: '#dbd7d7',
    borderRadius: 25,
    padding: 3,
    justifyContent: 'center',
  },
  toggleEnabled: {
    backgroundColor: '#4a7ede',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  weatherStatus: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#666666',
    borderRadius: 23,
    padding: 15,
    color: 'white',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 23,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonDisabled: {
    backgroundColor: '#4a4a4a',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    marginTop: 20,
    maxHeight: 400,
  },
  message: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  copyButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 12,
  },
  historyButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 23,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Recommendations; 