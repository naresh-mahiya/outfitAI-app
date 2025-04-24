import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Linking, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions,
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AboutUs = ({ navigation }) => {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Start animations when component mounts
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
  
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo_main.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.headerTitle}>About OutfitAI</Text>
          <Text style={styles.headerText}>
            Revolutionizing fashion with AI technology
          </Text>
        </View>

        <Animated.View 
          style={[styles.sectionContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="flag" size={28} color="#6c5ce7" />
            </View>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              Our mission is to provide users with an innovative platform for
              personalized fashion recommendations, wardrobe management, and a
              seamless online shopping experience. We leverage Artificial
              Intelligence and Augmented Reality to make your wardrobe smarter and
              more efficient.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="eye" size={28} color="#6c5ce7" />
            </View>
            <Text style={styles.sectionTitle}>Our Vision</Text>
            <Text style={styles.sectionText}>
              We envision a future where fashion is tailored to every individual's
              style and needs. With our AI-driven wardrobe assistant, we aim to
              simplify the way people shop, organize, and interact with their
              clothes. We believe that technology can transform the fashion industry
              by creating personalized and sustainable wardrobe solutions.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="people" size={28} color="#6c5ce7" />
            </View>
            <Text style={styles.sectionTitle}>Our Team</Text>
            
            <View style={styles.teamList}>
              <View style={styles.teamMemberCard}>
                <View style={styles.teamMemberHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>AK</Text>
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.memberName}>Aditya Kurani</Text>
                    <TouchableOpacity onPress={() => handleEmailPress('adityakurani26@gmail.com')}>
                      <Text style={styles.email}>adityakurani26@gmail.com</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.teamMemberRole}>
                  Frontend development (UI/UX) and Backend integration (API setup,
                  database management, Fashion Recommendations).
                </Text>
              </View>

              <View style={styles.teamMemberCard}>
                <View style={styles.teamMemberHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>PR</Text>
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.memberName}>Naresh Mahiya</Text>
                    <TouchableOpacity onPress={() => handleEmailPress('naresh_mahiya@gmail.com')}>
                      <Text style={styles.email}>naresh_mahiya@gmail.com</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.teamMemberRole}>
                  AI model development for Cloth identification and shopping.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="code-slash" size={28} color="#6c5ce7" />
            </View>
            <Text style={styles.sectionTitle}>Technologies</Text>
            <View style={styles.techContainer}>
              {['React Native', 'Node.js', 'MongoDB', 'Express', 'AI/ML', 'Cloudinary'].map((tech, index) => (
                <View key={index} style={styles.techBadge}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}> 2025 OutfitAI</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#121212',
    padding: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#2a2a2a',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 26,
    textAlign: 'center',
  },
  teamList: {
    marginTop: 15,
  },
  teamMemberCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#6c5ce7',
  },
  teamMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamMemberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6c5ce7',
  },
  teamMemberRole: {
    fontSize: 15,
    color: '#bbb',
    lineHeight: 22,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  techBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  techText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#aaa',
    fontSize: 14,
  },
  footerVersion: {
    color: '#777',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AboutUs;