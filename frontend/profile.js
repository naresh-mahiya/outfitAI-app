import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "./config";
import { launchImageLibrary } from "react-native-image-picker"; // Import image picker
import { PermissionsAndroid, Platform } from 'react-native';

const Profile = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null); // State for storing selected image
  const navigation = useNavigation();

  const backendUrl = API_URL;
  const token = route.params?.token;

  const profiledetails = () => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    fetch(`${backendUrl}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError("Something went wrong");
      })
      .finally(() => setLoading(false));
  };




const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: "Gallery Permission",
          message: "App needs access to your gallery",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const handleImageUpload = async () => {
  console.log("Upload button clicked!");

  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) {
    console.log("Permission denied");
    return;
  }

  launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
    console.log("Image Picker Response:", response);

    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.errorCode) {
      console.log("ImagePicker Error: ", response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const image = response.assets[0];
      const source = { uri: image.uri };
      setProfileImage(source);
      console.log("Selected image:", source);
    }
  });
};

  
  

  useEffect(() => {
    if (token) {
      profiledetails();
    } else {
      setError("No token provided");
      setLoading(false);
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Profile</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Fetching your profile...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.profileCard}>
          {profileImage ? (
            <Image source={profileImage} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileText}>No profile image</Text>
          )}
          <Text style={styles.profileText}>Username: {userData.username}</Text>
          <Text style={styles.profileText}>Email: {userData.email}</Text>
          
          <Button title="Upload" onPress={handleImageUpload} color="#3498db" />

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181818",
    padding: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 30,
    letterSpacing: 2,
  },
  profileCard: {
    backgroundColor: "#2c2c2c",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  profileText: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginTop: 15,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#3498db",
    fontSize: 18,
    fontWeight: "500",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default Profile;
