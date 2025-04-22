import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './Auth';  // Your Auth component
import Profile from './profile';
// import ChangePasswordScreen from './changepassword'
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Auth} />
        <Stack.Screen name="Profile" component={Profile} />
        {/* <Stack.Screen name="changepassword" component={ChangePasswordScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
