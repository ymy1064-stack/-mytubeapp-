import React from "react";
import { View, Text } from "react-native";

export default function Footer() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 10 }}>
      {/* अगर क्रेडिट हटाना हो तो अगली लाइन डिलीट कर दीजिए */}
      <Text style={{ color: "#9ca3af", fontSize: 12 }}>Created by Lamyahed Latif</Text>
    </View>
  );
}
