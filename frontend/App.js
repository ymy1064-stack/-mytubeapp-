import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { AdMobBanner, AdMobInterstitial, AdMobRewarded, setTestDeviceIDAsync } from "expo-ads-admob";

// ================== CONFIG ===================
const BACKEND_BASE = "http://YOUR_BACKEND_URL"; // backend URL
const LOGO = require("./assets/logo.png");

// Ad Unit IDs (replace with your AdMob IDs)
const BANNER_UNIT_ID = "b unit";           // Banner
const INTERSTITIAL_UNIT_ID = "I unit";    // Interstitial
const REWARDED_UNIT_ID = "r unit";        // Rewarded

// ================== STYLES ===================
const styles = {
  container: { flex: 1, backgroundColor: "#0f172a" },
  pad: { padding: 16 },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 14, marginBottom: 12 },
  btn: { backgroundColor: "#6366f1", padding: 12, borderRadius: 12, alignItems: "center" },
  h1: { color: "white", fontSize: 22, fontWeight: "800" },
  input: { backgroundColor: "#0b1220", color: "white", borderRadius: 10, padding: 10, marginTop: 6 },
  tag: { backgroundColor: "#0b1220", color: "#e5e7eb", padding: 6, borderRadius: 999, marginRight: 6, marginBottom: 6, fontSize: 12 },
};

// ================== MAIN APP ===================
export default function App() {
  const [tab, setTab] = useState("seo"); // "seo", "thumbnail", "learn"
  const [script, setScript] = useState("");
  const [thumb, setThumb] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try { await setTestDeviceIDAsync("EMULATOR"); } catch {}
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Allow gallery access");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true });
    if (!res.canceled && res.assets?.[0]) setThumb(`data:image/jpeg;base64,${res.assets[0].base64}`);
  };

  const generateSEO = async () => {
    if (!script.trim()) return Alert.alert("Enter script", "Write or paste your script first.");
    setBusy(true);
    try {
      const r = await fetch(`${BACKEND_BASE}/api/seo/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, thumb })
      });
      const data = await r.json();
      setResult(data);
    } catch (e) {
      Alert.alert("Error", e.message || e.toString());
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image source={LOGO} style={{ width: 36, height: 36, borderRadius: 999 }} />
            <Text style={styles.h1}>Creator Studio</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setTab("seo")} style={{ padding: 8 }}><Text style={{color:"white"}}>SEO</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab("thumbnail")} style={{ padding: 8 }}><Text style={{color:"white"}}>Thumbnail</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab("learn")} style={{ padding: 8 }}><Text style={{color:"white"}}>Learning</Text></TouchableOpacity>
          </View>
        </View>

        {/* Ad Banner */}
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <AdMobBanner bannerSize="smartBannerPortrait" adUnitID={BANNER_UNIT_ID} servePersonalizedAds />
        </View>

        {/* Main Content */}
        <View style={styles.pad}>
          {tab === "seo" && (
            <View style={styles.card}>
              <TextInput style={[styles.input, { height: 120 }]} multiline placeholder="Script..." placeholderTextColor="#64748b" value={script} onChangeText={setScript} />
              <TouchableOpacity onPress={generateSEO} style={[styles.btn, { marginTop: 10 }]}>
                {busy ? <ActivityIndicator color="white" /> : <Text style={{color:"white"}}>Generate SEO</Text>}
              </TouchableOpacity>
              {result && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{color:"white"}}>Title: {result.title}</Text>
                  <Text style={{color:"white"}}>Description: {result.description}</Text>
                  <View style={{ flexDirection:"row", flexWrap:"wrap", marginTop:6 }}>
                    {result.tags?.map((t,i)=><Text key={i} style={styles.tag}>{t}</Text>)}
                  </View>
                </View>
              )}
            </View>
          )}
          {tab === "thumbnail" && (
            <View style={styles.card}>
              <TouchableOpacity onPress={pickImage} style={styles.btn}><Text style={{color:"white"}}>{thumb?"Change Thumbnail":"Pick Thumbnail"}</Text></TouchableOpacity>
            </View>
          )}
          {tab === "learn" && (
            <View style={styles.card}>
              <Text style={{color:"white"}}>Learning Hub content will appear here.</Text>
            </View>
          )}
        </View>

        {/* Footer Credit */}
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{color:"#9ca3af", fontSize:12}}>Created by <Text style={{color:"white"}}>Lamyahed_Latif</Text></Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
    }
