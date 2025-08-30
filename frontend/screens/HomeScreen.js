import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Alert } from "react-native";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEOCard from "../components/SEOCard";
import { AdMobBanner, AdMobInterstitial, AdMobRewarded, setTestDeviceIDAsync } from "expo-ads-admob";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SEOAnalyzer from "./SEOAnalyzer";
import ThumbnailTrainer from "./ThumbnailTrainer";
import LearningHub from "./LearningHub";
import { getBackendUrl } from "../utils/helpers";

export default function HomeScreen() {
  const [tab, setTab] = useState("seo"); // seo | learn | thumb
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [countToday, setCountToday] = useState(0);
  const [result, setResult] = useState(null);

  const BACKEND = getBackendUrl();

  useEffect(() => {
    (async () => {
      try { await setTestDeviceIDAsync("EMULATOR"); } catch {}
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
    if (!script.trim()) return Alert.alert("Enter script", "Write or paste your script first.");
    if (countToday >= 3) return Alert.alert("Limit", "Daily limit reached (3/3). Try tomorrow.");

    setBusy(true);
    setResult(null);
    try {
      const userId = (await AsyncStorage.getItem("uid")) || `u_${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem("uid", userId);

      const r = await fetch(`${BACKEND}/api/seo/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user": userId },
        body: JSON.stringify({ script })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      setResult(j.data || j);

      const today = new Date().toISOString().slice(0, 10);
      let c = Number((await AsyncStorage.getItem("cnt")) || 0) + 1;
      await AsyncStorage.multiSet([["day", today], ["cnt", String(c)]]);
      setCountToday(c);
    } catch (e) {
      Alert.alert("Error", String(e.message || e));
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

      {/* Banner Ad (b unit) */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <AdMobBanner
          bannerSize="smartBannerPortrait"
          adUnitID="ca-app-pub-5942855485424016/3095540737"
          servePersonalizedAds
          onDidFailToReceiveAdWithError={() => {}}
        />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {tab === "seo" ? (
          <>
            <SEOCard script={script} setScript={setScript} onGenerate={doGenerate} busy={busy} countToday={countToday} />
            {result ? (
              <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937", marginTop: 12 }}>
                <Text style={{ color: "#a7f3d0" }}>Title</Text>
                <Text style={{ color: "#fff", fontWeight: "700", marginTop: 4 }}>{result.title}</Text>
                <Text style={{ color: "#a7f3d0", marginTop: 10 }}>Description</Text>
                <Text style={{ color: "#fff", marginTop: 4 }}>{result.description}</Text>
                <Text style={{ color: "#a7f3d0", marginTop: 10 }}>Tags</Text>
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
