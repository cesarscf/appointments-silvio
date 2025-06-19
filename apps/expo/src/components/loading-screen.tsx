import { primaryColor } from "@/lib/colors";
import { ActivityIndicator, View } from "react-native";

export function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator
        color={primaryColor}
        style={{ width: 16, height: 16 }}
      />
    </View>
  );
}
