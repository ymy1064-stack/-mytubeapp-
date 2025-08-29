import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function ThumbnailCard({ type, thumb, pickImage, onAnalyze, analyzing, tips }) {
  return (
    <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          {type === "long" ? "Long Thumbnail Trainer" : "Shorts Thumbnail Trainer"}
        </Text>
        <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#1f2937", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{thumb ? "Change Image" : "Pick Image"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 10, height: 180, borderRadius: 12, overflow: "hidden", backgroundColor: "#0b1220", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1f2937" }}>
        {thumb ? <Image source={{ uri: thumb }} style={{ width: "100%", height: "100%", resizeMode: "cover" }} /> : <Text style={{ color: "#64748b" }}>No image selected</Text>}
      </View>

      <TouchableOpacity onPress={onAnalyze} disabled={analyzing || !thumb} style={{ marginTop: 10, backgroundColor: "#10b981", paddingVertical: 12, borderRadius: 12, alignItems: "center", opacity: analyzing || !thumb ? 0.6 : 1 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>{analyzing ? "Analyzing…" : "Analyze"}</Text>
      </TouchableOpacity>

      {tips?.length ? (
        <View style={{ marginTop: 10 }}>
          {tips.map((t, i) => (
            <Text key={i} style={{ color: t.ok ? "#86efac" : "#fca5a5" }}>
              {t.ok ? "✔️" : "❌"} {t.text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
  }
