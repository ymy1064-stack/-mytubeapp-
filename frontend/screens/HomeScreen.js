// Production AdMob IDs - यहाँ अपने actual IDs डालें
const AD_BANNER_ID = Platform.select({
  android: "ca-app-pub-5942855485424016/3095540737", // ✅ ANDROID_BANNER_ID
  ios: "ca-app-pub-your-ios-banner-id",         // ✅ IOS_BANNER_ID
  default: "ca-app-pub-3940256099942544/6300978111"
});

const AD_INTERSTITIAL_ID = Platform.select({
  android: "ca-app-pub-5942855485424016/6028825834", // ✅ ANDROID_INTERSTITIAL_ID
  ios: "ca-app-pub-your-ios-interstitial-id",         // ✅ IOS_INTERSTITIAL_ID
  default: "ca-app-pub-3940256099942544/1033173712"
});

const AD_REWARDED_ID = Platform.select({
  android: "ca-app-pub-5942855485424016/8316880155", // ✅ ANDROID_REWARDED_ID
  ios: "ca-app-pub-your-ios-rewarded-id",         // ✅ IOS_REWARDED_ID
  default: "ca-app-pub-3940256099942544/5224354917"
});
