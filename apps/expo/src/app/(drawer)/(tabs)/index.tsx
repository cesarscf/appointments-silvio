import { Text, TouchableOpacity, View } from "react-native";

import { authClient } from "@/utils/auth";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <TouchableOpacity
        className="mt-4 w-full rounded bg-blue-500 p-3"
        onPress={async () => {
          await authClient.signOut();
        }}
      >
        <Text className="text-center font-bold text-white">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
