import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Image, ActivityIndicator } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import SEOAnalyzer from "./screens/SEOAnalyzer";
import ThumbnailTrainer from "./screens/ThumbnailTrainer";
import LearningHub from "./screens/LearningHub";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Admob
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Header />
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="SEO" component={SEOAnalyzer} />
        <Tab.Screen name="Thumbnail" component={ThumbnailTrainer} />
        <Tab.Screen name="LearningHub" component={LearningHub} />
      </Tab.Navigator>
      <BannerAd unitId="b unit" size={BannerAdSize.BANNER} />
      <Footer />
    </NavigationContainer>
  );
    }
