import Constants from 'expo-constants';

export const getBackendUrl = () => {
  return Constants.expoConfig?.extra?.backendUrl || "http://localhost:10000";
};

export const formatError = (error) => {
  if (error.message.includes('network') || error.message.includes('Network')) {
    return "Network error. Please check your internet connection.";
  } else if (error.message.includes('quota') || error.message.includes('limit')) {
    return "Daily limit reached. Please try again tomorrow.";
  } else if (error.message.includes('failed') || error.message.includes('server')) {
    return "Server temporarily unavailable. Please try again later.";
  }
  return error.message || "An unexpected error occurred.";
};
