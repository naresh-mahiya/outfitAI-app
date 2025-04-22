import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './Components/Auth';
import Profile from './Components/profile';
import Upload from './Components/upload'
const Stack = createStackNavigator();
 
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Auth} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Upload" component={Upload} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
