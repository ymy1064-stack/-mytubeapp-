import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import HomeScreen from "./screens/HomeScreen";

const API_BASE_URL = "https://seo-you-grow.onrender.com";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 सेकंड का लोडर
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return <HomeScreen apiUrl={API_BASE_URL} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
