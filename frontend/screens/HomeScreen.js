import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Alert, Platform } from "react-native";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEOCard from "../components/SEOCard";
import { AdMobBanner, setTestDeviceIDAsync } from "expo-ads-admob";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SEOAnalyzer from "./SEOAnalyzer";
import ThumbnailTrainer from "./ThumbnailTrainer";
import LearningHub from "./LearningHub";
import { getBackendUrl } from "../utils/helpers";

export default function HomeScreen() {
  const [tab, setTab] = useState("seo");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [countToday, setCountToday] = useState(0);
  const [result, setResult] = useState(null);

  const BACKEND = getBackendUrl();
  
  // AdMob Unit IDs - यहाँ अपने actual IDs डालें
  const AD_BANNER_ID = Platform.select({
    android: "ca-app-pub-5942855485424016/3095540737", // ✅ ANDROID_BANNER_ID
    ios: "ca-app-pub-your-ios-banner-id",         // ✅ IOS_BANNER_ID
    default: "ca-app-pub-3940256099942544/6300978111"
  });

  useEffect(() => {
    (async () => {
      try { 
        await setTestDeviceIDAsync("EMULATOR");
        
        // Development में test ads, production में real ads
        if (__DEV__) {
          console.log("Using test AdMob IDs in development");
        } else {
          console.log("Using production AdMob IDs");
        }
      } catch (e) {
        console.log("AdMob setup error:", e);
      }
      
      const today = new Date().toISOString().slice(0, 10);
      const savedDay = await AsyncStorage.getItem("day");
      const savedCnt = await AsyncStorage.getItem("cnt");
      
      if (savedDay !== today) {
        await AsyncStorage.multiSet([["day", today], ["cnt", "0"]]);
        setCountToday(0);
      } else {
        setCountToday(Number(savedCnt || 0));
      }
    })();
  }, []);

  const doGenerate = async () => {
    if (!script.trim()) return Alert.alert("Error", "Please write or paste your script first.");
    if (countToday >= 3) return Alert.alert("Limit Reached", "Daily limit reached (3/3). Try tomorrow.");

    setBusy(true);
    setResult(null);
    
    try {
      const userId = (await AsyncStorage.getItem("uid")) || `u_${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem("uid", userId);

      const response = await fetch(`${BACKEND}/api/seo/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "x-user": userId 
        },
        body: JSON.stringify({ script })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }
      
      setResult(data.data || data);

      const today = new Date().toISOString().slice(0, 10);
      const currentCount = Number((await AsyncStorage.getItem("cnt")) || 0) + 1;
      await AsyncStorage.multiSet([["day", today], ["cnt", String(currentCount)]]);
      setCountToday(currentCount);
      
    } catch (error) {
      let errorMessage = "An error occurred";
      
      if (error.message.includes("quota") || error.message.includes("limit")) {
        errorMessage = "Daily limit reached. Please try tomorrow.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "Server error";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24, backgroundColor: "#0f172a" }}>
      <Header />

      {/* Tabs */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10 }}>
        {["seo", "thumb", "learn"].map(t => (
          <Text
            key={t}
            onPress={() => setTab(t)}
            style={{
              color: "#fff",
              backgroundColor: tab === t ? "#111827" : "#0b1220",
              borderWidth: 1,
              borderColor: "#1f2937",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              overflow: "hidden"
            }}
          >
            {t === "seo" ? "SEO" : t === "thumb" ? "Thumbnail" : "Learning"}
          </Text>
        ))}
      </View>

      {/* Banner Ad */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <AdMobBanner
          bannerSize="smartBannerPortrait"
          adUnitID={AD_BANNER_ID}
          servePersonalizedAds={true}
          onDidFailToReceiveAdWithError={(error) => console.log("Ad failed:", error)}
        />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {tab === "seo" ? (
          <>
            <SEOCard 
              script={script} 
              setScript={setScript} 
              onGenerate={doGenerate} 
              busy={busy} 
              countToday={countToday} 
            />
            
            {result ? (
              <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937", marginTop: 12 }}>
                <Text style={{ color: "#a7f3d0", fontSize: 14 }}>Title</Text>
                <Text style={{ color: "#fff", fontWeight: "700", marginTop: 4 }}>{result.title}</Text>
                
                <Text style={{ color: "#a7f3d0", marginTop: 10, fontSize: 14 }}>Description</Text>
                <Text style={{ color: "#fff", marginTop: 4 }}>{result.description}</Text>
                
                <Text style={{ color: "#a7f3d0", marginTop: 10, fontSize: 14 }}>Tags</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {(result.tags || []).map((t, i) => (
                    <Text key={i} style={{ color: "#e5e7eb", backgroundColor: "#0b1220", borderWidth: 1, borderColor: "#1f2937", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, marginRight: 6 }}>
                      {t}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}

            <SEOAnalyzer />
          </>
        ) : tab === "thumb" ? (
          <ThumbnailTrainer />
        ) : (
          <LearningHub />
        )}
      </View>

      <Footer />
    </ScrollView>
  );
                   }
