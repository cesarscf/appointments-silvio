import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <View className="h-full w-full bg-background p-4">
        <Text>Login</Text>
      </View>
    </SafeAreaView>
  );
}
