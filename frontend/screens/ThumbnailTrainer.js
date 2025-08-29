import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ThumbnailCard from "../components/ThumbnailCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBackendUrl } from "../utils/helpers";

export default function ThumbnailTrainer() {
  const [longThumb, setLongThumb] = useState(null);
  const [shortThumb, setShortThumb] = useState(null);
  const [tipsLong, setTipsLong] = useState([]);
  const [tipsShort, setTipsShort] = useState([]);
  const [busyLong, setBusyLong] = useState(false);
  const [busyShort, setBusyShort] = useState(false);

  const BACKEND = getBackendUrl();

  const pick = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Please allow gallery access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.9
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setter(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const analyze = async (type) => {
    const setterBusy = type === "long" ? setBusyLong : setBusyShort;
    const setterTips = type === "long" ? setTipsLong : setTipsShort;
    const img = type === "long" ? longThumb : shortThumb;
    if (!img) return;
    setterTips([]);
    setterBusy(true);
    try {
      const userId = (await AsyncStorage.getItem("uid")) || `u_${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem("uid", userId);
      const r = await fetch(`${BACKEND}/api/thumbnail/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user": userId },
        body: JSON.stringify({ type, image: img })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      setterTips(j.data?.checks || []);
    } catch (e) {
      Alert.alert("Error", String(e.message || e));
    } finally {
      setterBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <ThumbnailCard
        type="long"
        thumb={longThumb}
        pickImage={() => pick(setLongThumb)}
        onAnalyze={() => analyze("long")}
        analyzing={busyLong}
        tips={tipsLong}
      />
      <ThumbnailCard
        type="short"
        thumb={shortThumb}
        pickImage={() => pick(setShortThumb)}
        onAnalyze={() => analyze("short")}
        analyzing={busyShort}
        tips={tipsShort}
      />
    </View>
  );
      }
