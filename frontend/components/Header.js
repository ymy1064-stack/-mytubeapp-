import React from "react";
import { View, Text, Image } from "react-native";

export default function Header() {
  return (
    <View style={{ alignItems: "center", padding: 10 }}>
      <Image source={require("../assets/logo.png")} style={{ width: 60, height: 60 }} />
      <Text style={{ fontSize: 12, color: "gray" }}>Created by Lamyahed Latif</Text>
    </View>
  );
  }
