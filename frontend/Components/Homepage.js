import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Home from '../Home/Home';
import Homemain from '../Homemain/Homemain';
import Home3 from '../Home3/Home3';
import Home4 from '../Home4/Home4';
import Home5 from '../Home5/Home5';

const { width } = Dimensions.get('window');

const Homepage = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.content}>
        <Home />
        <Homemain />
        <Home3 />
        <Home4 />
        <Home5 />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
});

export default Homepage; 