import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function FindYourVibe() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>FIND</Text>
        <Text style={[styles.title, styles.secondLine]}>YOUR</Text>
        <Text style={[styles.title, styles.thirdLine]}>VIBE</Text>
        <Text style={styles.caption}>
          No more outfit dilemmas! Let AI mix, match, and style your perfect look every day
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(22, 22, 22, 255)',
    justifyContent: 'center',
  },
  titleContainer: {
    marginLeft: width * 0.2,
    marginTop: 20,
  },
  title: {
    fontSize: width > 992 ? 110 : width > 768 ? 80 : width > 480 ? 60 : 40,
    fontWeight: '500',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'sans-serif',
    lineHeight: 1.2,
  },
  secondLine: {
    marginTop: width > 992 ? -60 : width > 768 ? -40 : width > 480 ? -30 : -20,
    marginLeft: width > 992 ? '20%' : width > 768 ? '8%' : '5%',
  },
  thirdLine: {
    marginTop: width > 992 ? -70 : width > 768 ? -50 : width > 480 ? -30 : -20,
    marginLeft: width > 992 ? '47%' : width > 768 ? '30%' : '10%',
  },
  caption: {
    fontSize: 24,
    color: 'white',
    marginTop: width > 768 ? -40 : 40,
    marginRight: width > 768 ? '70%' : '0%',
    width: width > 768 ? '40%' : '92%',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    textAlign: width > 768 ? 'left' : 'center',
  },
});

export default FindYourVibe; 