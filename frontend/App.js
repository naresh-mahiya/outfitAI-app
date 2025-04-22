import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Auth from './Components/Auth';
import Profile from './Components/profile';
import Upload from './Components/upload'



// Screens
// import Auth from './components/Auth/Auth';
// import Profile from './components/Profile/Profile';
import Homepage from './components/Homepage';
import Wardrobe from './components/Wardrobe';
import Shop from './components/Shop';
import Recommendations from './components/Recommendations';
import Chatbot from './components/Chatbot/Chatbot';
import CelebrityNews from './components/CelebrityNews';
import SellCloth from './components/Sellcloth';
import Message from './components/message';
import Planner from './components/Planner';
import Image from './components/Image';
import ShareClothes from './components/ShareClothes';
import DiscoverTrends from './components/DiscoverTrends';
import DevelopersPage from './components/Developers';
import Features from './components/Features.js';
import AboutUs from './components/AboutUs.js';
import Wishlist from './components/Wishlist';
import NotFound from './components/NotFound';

// Common components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Navbar />
      <ChatButton />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Auth} />
        <Stack.Screen name="Profile" component={Profile} />
        {/* <Stack.Screen name="Upload" component={Upload} /> */}

        {/* copied */}
        {/* <Stack.Screen name="Login" component={Auth} />
        <Stack.Screen name="Profile" component={Profile} /> */}
        <Stack.Screen name="Homepage" component={Homepage} />
        <Stack.Screen name="Wardrobe" component={Wardrobe} />
        <Stack.Screen name="Shop" component={Shop} />
        <Stack.Screen name="ARPreview" component={AR} />
        <Stack.Screen name="Recommendations" component={Recommendations} />
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="CelebrityNews" component={CelebrityNews} />
        <Stack.Screen name="SellCloth" component={SellCloth} />
        <Stack.Screen name="Message" component={Message} />
        <Stack.Screen name="Planner" component={Planner} />
        <Stack.Screen name="Image" component={Image} />
        <Stack.Screen name="ShareClothes" component={ShareClothes} />
        <Stack.Screen name="DiscoverTrends" component={DiscoverTrends} />
        <Stack.Screen name="Developers" component={DevelopersPage} />
        <Stack.Screen name="Features" component={Features} />
        <Stack.Screen name="AboutUs" component={AboutUs} />
        <Stack.Screen name="Wishlist" component={Wishlist} />
        <Stack.Screen name="NotFound" component={NotFound} />

      </Stack.Navigator>
      <Footer />
    </NavigationContainer>
  );
};

export default App;
