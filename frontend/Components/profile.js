import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "./config";
import { PermissionsAndroid, Platform } from "react-native";

const { width, height } = Dimensions.get('window');

const Profile = ({ route }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // User data state
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [showClothes, setShowClothes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  // Animation effect on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Fetch profile data on mount
  useEffect(() => {
    if (token) {
      profiledetails();
    } else {
      setError("No token provided");
      setLoading(false);
    }
  }, [token]);

  // Fetch clothes data on mount
  useEffect(() => {
    if (token) {
      getclothes();
    }
  }, [token]);
  
  // Animation when switching tabs
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [activeTab]);

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
    navigation.navigate("Upload", {token: token});
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
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Animated.View 
            style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Profile Image */}
            {profileImage ? (
              <Image source={profileImage} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {userData && userData.username ? userData.username.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            
            {/* User Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{userData ? userData.username : "Not available"}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData ? userData.email : "Not available"}</Text>
              </View>
              
              {userData && userData.age && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <Text style={styles.infoValue}>{userData.age}</Text>
                  </View>
                </>
              )}
              
              {userData && userData.gender && userData.gender !== 'prefer-not-to-say' && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>
                      {userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}
                    </Text>
                  </View>
                </>
              )}
              
              {userData && userData.preferences && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Style Preferences</Text>
                    <Text style={styles.infoValue}>{userData.preferences}</Text>
                  </View>
                </>
              )}
            </View>
            
            {/* Profile Actions */}
            <TouchableOpacity style={styles.actionButton} onPress={toggleForm}>
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 'clothes':
        if (clothes.length > 0) {
          // Return only the FlatList when we have clothes items
          return (
            <FlatList
              data={clothes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.clothCard}>
                  <Text style={styles.clothText}>{item}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.clothesList}
              ListHeaderComponent={() => (
                <Animated.View 
                  style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                  <View style={styles.clothesHeader}>
                    <Text style={styles.clothesTitle}>My Wardrobe</Text>
                    <TouchableOpacity 
                      style={styles.addClothesButton}
                      onPress={navigatetowardorbe}
                    >
                      <Text style={styles.addClothesButtonText}>+ Add Clothes</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            />
          );
        } else {
          // Return a regular view for the empty state
          return (
            <Animated.View 
              style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.clothesHeader}>
                <Text style={styles.clothesTitle}>My Wardrobe</Text>
                <TouchableOpacity 
                  style={styles.addClothesButton}
                  onPress={navigatetowardorbe}
                >
                  <Text style={styles.addClothesButtonText}>+ Add Clothes</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>👕</Text>
                </View>
                <Text style={styles.emptyStateTitle}>No clothes yet</Text>
                <Text style={styles.emptyStateText}>Add some clothes to your wardrobe to get started</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={navigatetowardorbe}
                >
                  <Text style={styles.emptyStateButtonText}>Add Your First Item</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        }
        
      case 'settings':
        return (
          <Animated.View 
            style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingsItem} onPress={togglePasswordForm}>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemText}>Change Password</Text>
                  <Text style={styles.settingsItemIcon}>›</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.settingsDivider} />
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemText}>Notifications</Text>
                  <Text style={styles.settingsItemIcon}>›</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.settingsDivider} />
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemText}>Privacy Settings</Text>
                  <Text style={styles.settingsItemIcon}>›</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.settingsDivider} />
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemText}>Help & Support</Text>
                  <Text style={styles.settingsItemIcon}>›</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.settingsDivider} />
              
              <TouchableOpacity style={styles.settingsItem}>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemText}>About OutfitAI</Text>
                  <Text style={styles.settingsItemIcon}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleLogout}>
            <Text style={styles.errorButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>My Profile</Text>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'profile' && styles.activeTabItem]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'clothes' && styles.activeTabItem]}
              onPress={() => setActiveTab('clothes')}
            >
              <Text style={[styles.tabText, activeTab === 'clothes' && styles.activeTabText]}>Clothes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {activeTab !== 'clothes' ? (
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {renderTabContent()}
              </ScrollView>
            ) : (
              renderTabContent()
            )}
          </View>
        </>
      )}
      
      {/* Edit Profile Modal */}
      <Modal
        visible={showForm}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Edit Profile</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter your age"
                placeholderTextColor="#8a8a8a"
                keyboardType="numeric"
                value={age.toString()}
                onChangeText={setAge}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{genderLabel}</Text>
                <Text style={styles.dropdownIcon}>{showGenderDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        gender === option.value && styles.selectedDropdownItem,
                      ]}
                      onPress={() => handleSelectGender(option.value, option.label)}
                    >
                      <Text 
                        style={[
                          styles.dropdownItemText,
                          gender === option.value && styles.selectedDropdownItemText,
                        ]}
                      >
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
                placeholder="Describe your style preferences"
                placeholderTextColor="#8a8a8a"
                multiline
                numberOfLines={4}
                value={preferences}
                onChangeText={setPreferences}
              />
            </View>
            
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={toggleForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formButton, 
                  styles.saveButton,
                  formSubmitting && styles.disabledButton
                ]}
                onPress={handleUpdateProfile}
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Change Password Modal */}
      <Modal
        visible={showPasswordForm}
        transparent={true}
        animationType="fade"
        onRequestClose={togglePasswordForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Change Password</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#8a8a8a"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#8a8a8a"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#8a8a8a"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={togglePasswordForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.formButton, 
                  styles.saveButton,
                  passwordSubmitting && styles.disabledButton
                ]}
                onPress={handleChangePassword}
                disabled={passwordSubmitting}
              >
                {passwordSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498db',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    alignItems: 'center',
  },
  // Profile Tab Styles
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2980b9',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Clothes Tab Styles
  clothesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  clothesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  addClothesButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addClothesButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  clothesList: {
    width: '100%',
  },
  clothCard: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  clothText: {
    fontSize: 16,
    color: '#fff',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Settings Tab Styles
  settingsCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    width: '100%',
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingsItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingsItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#fff',
  },
  settingsItemIcon: {
    fontSize: 20,
    color: '#aaa',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#333',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading & Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#3498db',
    fontSize: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
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
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownIcon: {
    color: '#3498db',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginTop: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedDropdownItem: {
    backgroundColor: '#3498db',
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
    borderRadius: 10,
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
  // Password Form Styles
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  eyeIconText: {
    fontSize: 18,
  },
});

export default Profile;
