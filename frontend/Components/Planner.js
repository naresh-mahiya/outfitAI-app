import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import {API_URL} from './config'
import { useRoute, useNavigation } from '@react-navigation/native';

const Planner = () => {
  const [weatherSummaries, setWeatherSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [suggestionMain, setSuggestion] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [weather, setWeather] = useState("Off");
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const token = route.params?.token;

  const backendUrl = API_URL;

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
    };
    return descriptions[code] || "Unknown";
  };

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required for weather updates.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,cloudcover,windspeed_10m,weathercode&timezone=auto`;

      const res = await fetch(url);
      const data = await res.json();
      const hourly = data.hourly;

      const dailyMap = {};
      hourly.time.forEach((t, i) => {
        const date = t.split("T")[0];
        if (!dailyMap[date]) {
          dailyMap[date] = [];
        }
        dailyMap[date].push(i);
      });

      const avg = (arr) =>
        (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

      const summaries = Object.keys(dailyMap)
        .slice(0, 7)
        .map((date) => {
          const indices = dailyMap[date];
          return {
            date,
            temp: avg(indices.map((i) => hourly.temperature_2m[i])),
            temp_min: Math.min(
              ...indices.map((i) => hourly.temperature_2m[i])
            ).toFixed(1),
            temp_max: Math.max(
              ...indices.map((i) => hourly.temperature_2m[i])
            ).toFixed(1),
            feels_like: avg(
              indices.map((i) => hourly.apparent_temperature[i])
            ),
            weather: getWeatherDescription(
              hourly.weathercode[indices[12] || indices[0]]
            ),
            wind: avg(indices.map((i) => hourly.windspeed_10m[i])),
            humidity: avg(indices.map((i) => hourly.relative_humidity_2m[i])),
            rain_probability: avg(
              indices.map((i) => hourly.precipitation_probability[i])
            ),
            cloud_cover: avg(indices.map((i) => hourly.cloudcover[i])),
          };
        });

      setWeatherSummaries(summaries);
    } catch (err) {
      console.error("Error fetching weather:", err);
      Alert.alert("Error", "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/user/images`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setClothes(data.Wardrobe.allclothes[0]);
    } catch (error) {
      console.error("Clothes could not be fetched", error);
      Alert.alert("Error", "Failed to fetch clothes data");
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionForWeek = async () => {
    if (!clothes.length || !weatherSummaries.length) {
      Alert.alert("Error", "Weather and clothes must be fetched first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/chat/suggestionforweek`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weather: weatherSummaries, input, clothes }),
        }
      );

      const data = await response.json();
      const cleanedResponse = data.response
        .replace(/\*/g, "")
        .replace(/<.*?>/g, "")
        .replace(/(?=[A-Z][a-z]+day:)/g, "\n")
        .trim();

      setSuggestion(cleanedResponse);
    } catch (error) {
      console.error("Failed to get weekly suggestion", error);
      Alert.alert("Error", "Failed to get outfit suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    setIsOn(!isOn);
    setWeather(isOn ? "Off" : "On");
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedIndex(0);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const copytoprofile = async () => {
    if (!token) {
      Alert.alert("Error", "Authentication token is missing. Please log in again.");
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/user/copytoprofileweekcloths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ clothesforweek: suggestionMain }),
      });
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Success", "Outfits saved to profile");
        navigation.navigate("Profile",{token:token});
      } else {
        throw new Error(data.message || "Failed to save outfits");
      }
    } catch (err) {
      console.error("Error saving to profile:", err);
      Alert.alert("Error", "Failed to save outfits to profile");
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchClothes();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Weekly Outfit Planner</Text>
          <Text style={styles.headerSubtitle}>Plan your outfits for the entire week</Text>
        </View>

        {weatherSummaries.length > 0 && (
          <View style={styles.weatherSection}>
            <Text style={styles.sectionTitle}>Weather Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherScroll}>
              {weatherSummaries.map((day, index) => (
                <View key={index} style={styles.weatherCard}>
                  <Text style={styles.dateText}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={styles.weatherRow}>
                    <Text style={styles.weatherLabel}>Weather:</Text>
                    <Text style={styles.weatherValue}>{day.weather}</Text>
                  </View>
                  <View style={styles.weatherRow}>
                    <Text style={styles.weatherLabel}>Temperature:</Text>
                    <Text style={styles.weatherValue}>{day.temp}°C</Text>
                  </View>
                  <View style={styles.weatherRow}>
                    <Text style={styles.weatherLabel}>Range:</Text>
                    <Text style={styles.weatherValue}>{day.temp_min}° - {day.temp_max}°C</Text>
                  </View>
                  <View style={styles.weatherRow}>
                    <Text style={styles.weatherLabel}>Humidity:</Text>
                    <Text style={styles.weatherValue}>{day.humidity}%</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <LinearGradient
          colors={['#1E1E1E', '#252525']}
          style={styles.toggleContainer}
        >
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              Weather-based recommendations
            </Text>
            <Switch
              value={isOn}
              onValueChange={handleChange}
              trackColor={{ false: "#444", true: "#8A7BFF" }}
              thumbColor={isOn ? "#6C5CE7" : "#f4f3f4"}
              ios_backgroundColor="#444"
            />
          </View>

          <Text style={styles.title}>
            Get outfit suggestions for your upcoming week
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter events you might attend this week (meetings, parties, etc.)"
            placeholderTextColor="#888"
            multiline
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={getSuggestionForWeek}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="shirt-outline" size={20} color="white" style={{marginRight: 8}} />
                <Text style={styles.buttonText}>Generate Weekly Outfits</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={['#1E1E1E', '#252525']}
          style={styles.recommendation}
        >
          <Text style={styles.sectionTitle}>Your Weekly Outfits</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C5CE7" />
              <Text style={styles.loadingText}>Generating your personalized outfits...</Text>
            </View>
          ) : suggestionMain ? (
            <Text style={styles.suggestionText}>{suggestionMain}</Text>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color="#555" />
              <Text style={styles.placeholderText}>
                Enter your weekly events above and click "Generate Weekly Outfits" to get personalized recommendations.
              </Text>
            </View>
          )}

          {suggestionMain && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, !suggestionMain && styles.buttonDisabled]}
                onPress={copytoprofile}
                disabled={!suggestionMain}
              >
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Save to Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, !suggestionMain && styles.buttonDisabled]}
                onPress={() => copyToClipboard(suggestionMain)}
                disabled={!suggestionMain}
              >
                <Ionicons
                  name={copiedIndex === 0 ? "checkmark" : "copy-outline"}
                  size={20}
                  color="white"
                />
                <Text style={styles.actionButtonText}>
                  {copiedIndex === 0 ? "Copied!" : "Copy to Clipboard"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(108, 92, 231, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  weatherSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 5,
    letterSpacing: 0.3,
  },
  weatherScroll: {
    paddingBottom: 10,
  },
  weatherCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateText: {
    color: "#6C5CE7",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weatherLabel: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  weatherValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  toggleContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 6,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#444",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    backgroundColor: "#6C5CE7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  recommendation: {
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: "#AAAAAA",
    marginTop: 15,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  suggestionText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.3,
    padding: 10,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 15,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C5CE7",
    padding: 14,
    borderRadius: 12,
    minWidth: 150,
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#8A7BFF",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});

export default Planner;