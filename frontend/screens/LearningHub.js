import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { getBackendUrl } from "../utils/helpers";

export default function LearningHub() {
  const [rules, setRules] = useState(null);
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

  return (
    <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1f2937" }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>SEO Learning Hub (Auto-updates every 24h)</Text>
      <Text style={{ color: "#a7f3d0", marginTop: 10 }}>SEO Rules</Text>
      {(rules?.seo || []).map((r, i) => <Text key={i} style={{ color: "#e5e7eb" }}>• {r}</Text>)}

      <Text style={{ color: "#a7f3d0", marginTop: 10 }}>Long Thumbnail Rules</Text>
      {(rules?.thumb_long || []).map((r, i) => <Text key={i} style={{ color: "#e5e7eb" }}>• {r}</Text>)}

      <Text style={{ color: "#a7f3d0", marginTop: 10 }}>Short Thumbnail Rules</Text>
      {(rules?.thumb_short || []).map((r, i) => <Text key={i} style={{ color: "#e5e7eb" }}>• {r}</Text>)}
    </View>
  );
                           }
