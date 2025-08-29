import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function SEOCard({ script, setScript, onGenerate, busy, countToday }) {
  return (
    <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937" }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Script</Text>
      <TextInput
        style={{ backgroundColor: "#0b1220", color: "white", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 10, marginTop: 6, height: 120, textAlignVertical: "top" }}
        multiline
        placeholder="Write/paste your video script…"
        placeholderTextColor="#64748b"
        value={script}
        onChangeText={setScript}
      />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity onPress={onGenerate} disabled={busy} style={{ backgroundColor: "#6366f1", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, opacity: busy ? 0.6 : 1 }}>
          <Text style={{ color: "white", fontWeight: "800" }}>{busy ? "Generating…" : "Generate SEO"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: "#9ca3af", marginTop: 8, fontStyle: "italic" }}>Daily limit: {countToday}/3</Text>
    </View>
  );
    }
