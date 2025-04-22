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

const Planner = () => {
  const [weatherSummaries, setWeatherSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [suggestionMain, setSuggestion] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [weather, setWeather] = useState("Off");
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

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
    try {
      const response = await fetch(`${backendUrl}/user/copytoprofileweekcloths`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clothesforweek: suggestionMain }),
      });
      const data = await response.json();
      Alert.alert("Success", "Outfits saved to profile");
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
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              Weather and location based recommendation: {isOn ? "On" : "Off"}
            </Text>
            <Switch
              value={isOn}
              onValueChange={handleChange}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isOn ? "#0a84ff" : "#f4f3f4"}
            />
          </View>

          <Text style={styles.title}>
            Get outfit suggestion from clothes you uploaded for a week.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter events you might attend this week"
            placeholderTextColor="#666"
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
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Get recommendation</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.recommendation}>
          {loading ? (
            <ActivityIndicator size="large" color="#0a84ff" />
          ) : suggestionMain ? (
            <Text style={styles.suggestionText}>{suggestionMain}</Text>
          ) : (
            <Text style={styles.placeholderText}>
              Enter the week task and click get recommendation button to get outfits.
            </Text>
          )}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, !suggestionMain && styles.buttonDisabled]}
              onPress={copytoprofile}
              disabled={!suggestionMain}
            >
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.actionButtonText}>Copy to profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !suggestionMain && styles.buttonDisabled]}
              onPress={() => copyToClipboard(suggestionMain)}
              disabled={!suggestionMain}
            >
              <Ionicons
                name={copiedIndex === 0 ? "checkmark" : "copy"}
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>
                {copiedIndex === 0 ? "Copied!" : "Copy outfits"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleText: {
    color: "white",
    fontSize: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#3a3a3a",
    color: "white",
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0a84ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recommendation: {
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  suggestionText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a84ff",
    padding: 12,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Planner; 