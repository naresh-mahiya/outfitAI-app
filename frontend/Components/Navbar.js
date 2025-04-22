import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const Navbar = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [check, setCheck] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetch(`${apiUrl}/user/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setCheck(data);
        if (data?.message === 'Success') {
          setIsLoggedIn(true);
          console.log('User logged in');
        } else {
          setIsLoggedIn(false);
          console.log('User is not logged in');
        }
      })
      .catch((error) => console.error('Error fetching profile:', error));
  }, []);

  return (
    <View style={styles.navbar}>
      <View style={styles.navbarContainer}>
        <TouchableOpacity
          style={styles.navbarLogo}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../../assets/logo_main.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={[styles.navbarMenu, isOpen && styles.active]}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => {
              navigation.navigate('Wardrobe');
              setIsOpen(false);
            }}
          >
            <Text style={styles.navLinkText}>Wardrobe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => {
              navigation.navigate('Recommendations');
              setIsOpen(false);
            }}
          >
            <Text style={styles.navLinkText}>Recommendations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => {
              navigation.navigate('SellCloth');
              setIsOpen(false);
            }}
          >
            <Text style={styles.navLinkText}>Sell Clothes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => {
              navigation.navigate('Shop');
              setIsOpen(false);
            }}
          >
            <Text style={styles.navLinkText}>Shop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navbarIcons}>
          {isLoggedIn ? (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.iconText}>Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.iconText}>Login / SignUp</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.navbarToggle}
            onPress={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={28} color="white" />
            ) : (
              <Menu size={28} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Menu */}
      <Animated.View
        style={[
          styles.navbarMobileMenu,
          isOpen && styles.mobileMenuOpen,
        ]}
      >
        <TouchableOpacity
          style={styles.mobileLink}
          onPress={() => {
            navigation.navigate('Wardrobe');
            setIsOpen(false);
          }}
        >
          <Text style={styles.mobileLinkText}>Wardrobe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mobileLink}
          onPress={() => {
            navigation.navigate('Recommendations');
            setIsOpen(false);
          }}
        >
          <Text style={styles.mobileLinkText}>Recommendations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mobileLink}
          onPress={() => {
            navigation.navigate('SellCloth');
            setIsOpen(false);
          }}
        >
          <Text style={styles.mobileLinkText}>Sell Clothes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mobileLink}
          onPress={() => {
            navigation.navigate('Shop');
            setIsOpen(false);
          }}
        >
          <Text style={styles.mobileLinkText}>Shop</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(22,22,22,254)',
    zIndex: 50,
  },
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
  },
  navbarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 50,
    width: 100,
  },
  navbarMenu: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 20,
    display: width > 768 ? 'flex' : 'none',
  },
  active: {
    display: 'flex',
  },
  navLink: {
    marginHorizontal: 10,
  },
  navLinkText: {
    color: 'white',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'sans-serif',
  },
  navbarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  iconText: {
    color: 'white',
    fontSize: 19,
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'sans-serif',
  },
  navbarToggle: {
    display: width > 768 ? 'none' : 'flex',
  },
  navbarMobileMenu: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    maxHeight: 0,
    overflow: 'hidden',
  },
  mobileMenuOpen: {
    maxHeight: 300,
  },
  mobileLink: {
    padding: 12,
  },
  mobileLinkText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Segoe UI' : 'sans-serif',
  },
});

export default Navbar; 