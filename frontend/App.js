import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />
      <HomeScreen />
    </SafeAreaView>
  );
  }
