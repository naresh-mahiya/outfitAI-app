import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { API_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from './token';
// console.log('API_URL:', API_URL);
const Auth = ({ navigation }) => {
  const [toggle, setToggle] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [signingup, setsigning] = useState(false);
  const [logging, setlogging] = useState(false);

  const apiUrl = API_URL; 
// const api=
const handleLogin = async () => {
  if (!email || !password) {
    setError('Please enter both email and password.');
    return;
  }

  setlogging(true);
  setError('');

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.msg || 'Invalid email or password.');
    } else {
      console.log('Login successful:', data);

      // Store token globally
      await AsyncStorage.setItem('token', data.token);
      setAuthToken(data.token);
// console.log(data.token)
      navigation.navigate('Profile',{token:data.token}); // pass token if needed
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Something went wrong. Please try again.');
  } finally {
    setlogging(false);
  }
};

  const handleSignup = async () => {
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setsigning(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful:', data);
        setToggle(false);
      } else {
        setError(data.message || 'Signup failed.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.',err);
    } finally {
      setsigning(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {toggle ? 'Sign Up to Outfit-AI' : 'Login to Outfit-AI'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {toggle && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#ccc"
          value={username}
          onChangeText={setUsername}
          // defaultValue='adityakurani87@gmail.com'  
        />
      )}  

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.authBtn}
        onPress={toggle ? handleSignup : handleLogin}
      >
        {toggle ? (
          signingup ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign Up</Text>
          )
        ) : logging ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setToggle(!toggle)}>
        <Text style={styles.toggleText}>
          {toggle
            ? 'Already have an account? Login'
            : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={loginwithgoogle}>
        <Text style={styles.btnText}>Login with google</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  authBtn: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Auth;
