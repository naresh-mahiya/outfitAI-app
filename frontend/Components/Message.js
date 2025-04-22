import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Message = () => {
  const route = useRoute();
  const { username, id } = route.params;
  const [message, setMessage] = useState('');
  const [clothdetail, setClothDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  const sendmessage = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient: username, message }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('');
        fetchmessages();
      } else {
        Alert.alert('Error', data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error messaging the user:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const fetchClothDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/user/sellcloth/find/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setClothDetail(data);
    } catch (error) {
      console.error('Couldn\'t get the data:', error);
      Alert.alert('Error', 'Failed to fetch cloth details');
    } finally {
      setLoading(false);
    }
  };

  const fetchmessages = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/message/${username}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setFetchedMessages(data);
    } catch (error) {
      console.error('Couldn\'t fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchClothDetails();
    fetchmessages();

    const intervalId = setInterval(fetchmessages, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat with {username}</Text>
        </View>

        <View style={styles.messagesSection}>
          {fetchedMessages.length > 0 ? (
            fetchedMessages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === username ? styles.messageReceived : styles.messageSent,
                ]}
              >
                <Text style={styles.messageSender}>{msg.sender}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No messages yet</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a84ff" />
            <Text style={styles.loadingText}>Loading cloth details...</Text>
          </View>
        ) : (
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Image
              source={{
                uri: clothdetail?.clothImage || 'default-image.jpg',
              }}
              style={styles.productImage}
            />
            <Text style={styles.productText}>
              Description: {clothdetail?.description}
            </Text>
            <Text style={styles.productText}>Price: ₹{clothdetail?.price}</Text>
            <Text style={styles.productText}>Seller: {clothdetail?.username}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendmessage}>
          <Ionicons name="send" size={24} color="white" />
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesSection: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#0a84ff',
    borderBottomRightRadius: 4,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: '#3a3a3a',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageTime: {
    color: '#999',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 8,
  },
  productSection: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  input: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0a84ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default Message; 