import React from "react";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 18 }}>Welcome to MyYouTubeApp 🚀</Text>
      <Text style={{ fontSize: 14, marginTop: 10 }}>Choose a tab below to get started</Text>
    </View>
  );
  }
