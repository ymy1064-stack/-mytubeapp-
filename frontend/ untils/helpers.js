import Constants from "expo-constants";

export const getBackendUrl = () => {
  // app.json -> expo.extra.backendUrl
  return Constants.expoConfig?.extra?.backendUrl || "http://localhost:8080";
};
