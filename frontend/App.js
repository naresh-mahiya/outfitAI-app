import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { loadAuthToken } from './Components/token'; // make sure this sets the token globally

import Auth from './Components/Auth';
import Profile from './Components/profile';
import Upload from './Components/upload';
import Wardrobe from './Components/Wardrobe'
const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    loadAuthToken(); // Set token globally in Axios from AsyncStorage
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Auth} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Upload" component={Upload} />
        <Stack.Screen name="Wardrobe" component={Wardrobe} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
