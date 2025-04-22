import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userClothes, setUserClothes] = useState([]);
  const scrollViewRef = React.useRef();

  const fetchUserClothes = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/images`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      setUserClothes(data.Wardrobe?.allclothes?.[0] || []);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  useEffect(() => {
    fetchUserClothes();
  }, []);

  const getOutfitSuggestion = async (input) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n\s*\n/g, '\n');
      return cleanedResponse || 'No suggestion available.';
    } catch (error) {
      console.error('Error:', error);
      return 'Error fetching suggestion.';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) {
      return;
    }

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');

    const reply = await getOutfitSuggestion(userInput);
    setMessages([...newMessages, { sender: 'bot', text: reply }]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient
        colors={['#555', '#222']}
        style={styles.header}
      >
        <Text style={styles.title}>Need a fashion recommendation?</Text>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.message, styles.botMessage]}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Describe the event..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  title: {
    color: '#fff',
    fontSize: width > 768 ? 24 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#444',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
  },
  messageText: {
    color: '#fff',
    fontSize: width > 768 ? 16 : 14,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#111',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: width > 768 ? 16 : 14,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: width > 768 ? 16 : 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'Roboto',
  },
});

export default Chatbot; 