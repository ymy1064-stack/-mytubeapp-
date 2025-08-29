import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBackendUrl } from "../utils/helpers";

export default function SEOAnalyzer() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [rules, setRules] = useState(null);
  const [report, setReport] = useState(null);

  const BACKEND = getBackendUrl();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/rules`);
        const j = await r.json();
        if (j.ok) setRules(j.data);
      } catch {}
    })();
  }, []);

  const analyze = async () => {
    setReport(null);
    try {
      const userId = (await AsyncStorage.getItem("uid")) || `u_${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem("uid", userId);
      const r = await fetch(`${BACKEND}/api/seo/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user": userId },
        body: JSON.stringify({ title, description: desc, tags: tags.split(",").map(s => s.trim()).filter(Boolean) })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      setReport(j.data);
    } catch (e) {
      Alert.alert("Error", String(e.message || e));
    }
  };

  return (
    <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937", marginTop: 12 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>SEO सीखना (Analyze your own)</Text>

      <TextInput placeholder="Your Title…" placeholderTextColor="#64748b" value={title} onChangeText={setTitle}
        style={{ backgroundColor: "#0b1220", color: "#fff", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 10, marginTop: 8 }} />
      <TextInput placeholder="Your Description…" placeholderTextColor="#64748b" value={desc} onChangeText={setDesc} multiline
        style={{ backgroundColor: "#0b1220", color: "#fff", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 10, marginTop: 8, height: 100, textAlignVertical: "top" }} />
      <TextInput placeholder="tag1, tag2, tag3" placeholderTextColor="#64748b" value={tags} onChangeText={setTags}
        style={{ backgroundColor: "#0b1220", color: "#fff", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 10, marginTop: 8 }} />

      <TouchableOpacity onPress={analyze} style={{ marginTop: 10, backgroundColor: "#10b981", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Analyze</Text>
      </TouchableOpacity>

      {rules ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#a7f3d0" }}>Latest Rules (auto-refresh 24h):</Text>
          {(rules.seo || []).map((r, i) => <Text key={i} style={{ color: "#e5e7eb" }}>• {r}</Text>)}
        </View>
      ) : null}

      {report ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#a7f3d0" }}>AI Feedback:</Text>
          {report.issues?.map((it, i) => <Text key={i} style={{ color: it.ok ? "#86efac" : "#fca5a5" }}>{it.ok ? "✔️" : "❌"} {it.text}</Text>)}
          {report.suggestions?.length ? <>
            <Text style={{ color: "#a7f3d0", marginTop: 8 }}>Suggestions:</Text>
            {report.suggestions.map((s, i) => <Text key={i} style={{ color: "#e5e7eb" }}>• {s}</Text>)}
          </> : null}
        </View>
      ) : null}
    </View>
  );
     }
