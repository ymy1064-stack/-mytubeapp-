import React from "react";
import { View, Text, Image } from "react-native";

export default function Header() {
  return (
    <View style={{ padding: 16, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image source={require("../assets/logo.png")} style={{ width: 36, height: 36, borderRadius: 999 }} />
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>SEO YouGrow</Text>
      </View>
    </View>
  );
  }
