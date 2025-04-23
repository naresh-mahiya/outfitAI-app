import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "./config";
import { PermissionsAndroid, Platform } from "react-native";

const Profile = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [showClothes, setShowClothes] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [genderLabel, setGenderLabel] = useState('Prefer not to say');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  
  // Gender options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  ];
  
  const navigation = useNavigation();
  const backendUrl = API_URL;
  const token = route.params?.token;

  useEffect(() => {
    if (token) {
      profiledetails();
    } else {
      setError("No token provided");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getclothes();
    }
  }, [token]);

  const profiledetails = () => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    fetch(`${backendUrl}/profile/profile`, {
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
        console.log('User profile data:', data);
        setUserData(data);
        
        // Check if user data has a profile image URL
        if (data && data.profileImage) {
          console.log('Setting profile image:', data.profileImage);
          setProfileImage({ uri: data.profileImage });
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError("Something went wrong");
      })
      .finally(() => setLoading(false));
  };

  const getclothes = () => {
    console.log('Fetching clothes with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No token available, skipping clothes fetch');
      return;
    }
    
    fetch(`${backendUrl}/user/getclothes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    })
      .then((response) => {
        console.log('Clothes response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch clothes: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Clothes data received:', data);
        // Check if data has clothes property and it's an array
        if (data && data.clothes && Array.isArray(data.clothes)) {
          setClothes(data.clothes);
        } else {
          console.warn('Unexpected data format:', data);
          setClothes([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching clothes:', error);
        // Set empty array on error to avoid undefined errors in UI
        setClothes([]);
      });
  };

  const handleImageUpload = () => {
    navigation.navigate("Upload", { token: token });
  };

  const navigatetowardorbe = () => {
    navigation.navigate("Wardrobe", {token: token});
  };
  
  // Clean logout function
  const handleLogout = () => {
    console.log('Logging out user...');
    
    // Navigate to login screen first, then clear state
    // This prevents the error when rendering with null userData
    navigation.navigate('Login');
    
    // Clear local state after navigation
    setTimeout(() => {
      setUserData(null);
      setProfileImage(null);
      setClothes([]);
    }, 100);
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm && userData) {
      // Pre-fill form with existing data if available
      setAge(userData.age || '');
      const selectedGender = userData.gender || 'prefer-not-to-say';
      setGender(selectedGender);
      
      // Set the gender label based on the value
      const genderOption = genderOptions.find(option => option.value === selectedGender);
      setGenderLabel(genderOption ? genderOption.label : 'Prefer not to say');
      
      setPreferences(userData.preferences || '');
    }
  };
  
  const handleSelectGender = (value, label) => {
    setGender(value);
    setGenderLabel(label);
    setShowGenderDropdown(false);
  };
  
  const handleUpdateProfile = () => {
    setFormSubmitting(true);
    
    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      alert('Please enter a valid age between 13 and 120');
      setFormSubmitting(false);
      return;
    }
    
    // Prepare data for API
    const updatedData = {
      age: ageNum,
      gender,
      preferences
    };
    
    // Send to API
    fetch(`${backendUrl}/user/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    })
    .then(data => {
      // Update local state with new data
      setUserData({
        ...userData,
        ...updatedData
      });
      setShowForm(false); // Close form
      alert('Profile updated successfully!');
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    })
    .finally(() => {
      setFormSubmitting(false);
    });
  };
  
  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    // Clear password fields when opening/closing form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handleChangePassword = () => {
    // Validate passwords
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setPasswordSubmitting(true);
    
    // Send to API
    fetch(`${backendUrl}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to change password');
        });
      }
      return response.json();
    })
    .then(data => {
      setShowPasswordForm(false); // Close form
      alert('Password changed successfully!');
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    })
    .catch(error => {
      console.error('Error changing password:', error);
      alert(error.message || 'Failed to change password. Please try again.');
    })
    .finally(() => {
      setPasswordSubmitting(false);
    });
  };

  
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
            <Image 
              source={profileImage} 
              style={styles.profileImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {userData && userData.username ? userData.username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.profileText}>Username: {userData && userData.username}</Text>
          <Text style={styles.profileText}>Email: {userData && userData.email}</Text>
          
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button 
                title="My Wardrobe" 
                onPress={navigatetowardorbe} 
                color="#e74c3c" 
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title="Upload" 
                onPress={handleImageUpload} 
                color="#3498db" 
              />
            </View>
          </View>
          
          <View style={styles.profileActionContainer}>
            <Button
              title="Update Profile Info"
              onPress={toggleForm}
              color="#2ecc71"
            />
          </View>
          
          <View style={styles.profileActionContainer}>
            <Button
              title="Change Password"
              onPress={togglePasswordForm}
              color="#3498db"
            />
          </View>
          
          <View style={styles.logoutContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
              color="#95a5a6"
            />
          </View>
          
          {/* Profile Update Form Modal */}
          <Modal
            visible={showForm}
            animationType="slide"
            transparent={true}
            onRequestClose={toggleForm}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Update Profile</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Age</Text>
                  <TextInput
                    style={styles.formInput}
                    value={age.toString()}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholder="Enter your age"
                    placeholderTextColor="#888"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Gender</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{genderLabel}</Text>
                  </TouchableOpacity>
                  
                  {showGenderDropdown && (
                    <View style={styles.dropdownList}>
                      {genderOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[styles.dropdownItem, gender === option.value && styles.selectedDropdownItem]}
                          onPress={() => handleSelectGender(option.value, option.label)}
                        >
                          <Text style={[styles.dropdownItemText, gender === option.value && styles.selectedDropdownItemText]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Style Preferences</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={preferences}
                    onChangeText={setPreferences}
                    placeholder="Describe your style preferences..."
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={4}
                  />
                </View>
                
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton]} 
                    onPress={toggleForm}
                    disabled={formSubmitting}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton, formSubmitting && styles.disabledButton]} 
                    onPress={handleUpdateProfile}
                    disabled={formSubmitting}
                  >
                    <Text style={styles.buttonText}>
                      {formSubmitting ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          
                        <Modal
            visible={showPasswordForm}
            animationType="slide"
            transparent={true}
            onRequestClose={togglePasswordForm}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Change Password</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Current Password</Text>
                  <TextInput
                    style={styles.formInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={true}
                    placeholder="Enter current password"
                    placeholderTextColor="#888"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>New Password</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    placeholder="Enter new password"
                    placeholderTextColor="#888"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.formInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    placeholder="Confirm new password"
                    placeholderTextColor="#888"
                  />
                </View>
                
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton]} 
                    onPress={togglePasswordForm}
                    disabled={passwordSubmitting}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton, passwordSubmitting && styles.disabledButton]} 
                    onPress={handleChangePassword}
                    disabled={passwordSubmitting}
                  >
                    <Text style={styles.buttonText}>
                      {passwordSubmitting ? 'Changing...' : 'Change Password'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          
          <View style={styles.toggleContainer}>
            <Button 
              title={showClothes ? "Hide My Clothes" : "Show My Clothes"} 
              onPress={() => setShowClothes(!showClothes)} 
              color="#2980b9"
            />
          </View>
          {showClothes && (
            <View style={styles.clothesContainer}>
              <Text style={styles.sectionTitle}>My Clothes</Text>
              {Array.isArray(clothes) && clothes.length > 0 ? (
                clothes.map((item, index) => {
                  const isLongText = item.length > 100;
                  const displayText = isLongText ? item.substring(0, 97) + '...' : item;
                  
                  return (
                    <View key={index} style={styles.clothItem}>
                      <Text style={styles.clothText}>{displayText}</Text>
                      {isLongText && (
                        <TouchableOpacity 
                          onPress={() => alert(item)}
                          style={styles.expandButton}
                        >
                          <Text style={styles.expandButtonText}>View Full</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noClothesText}>No clothes found</Text>
              )}
            </View>
          )}
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
  clothesContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  toggleContainer: {
    width: '100%',
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  buttonWrapper: {
    width: '48%',
  },
  logoutContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  clothItem: {
    backgroundColor: '#3a3a3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  clothText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  expandButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  expandButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clothImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  noClothesText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2980b9',
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileActionContainer: {
    width: '100%',
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  selectedDropdownItem: {
    backgroundColor: '#2980b9',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#7f8c8d',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
