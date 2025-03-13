import { ActivityIndicator, Text, View } from "react-native";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import { api } from "@/utils/api";

export default function Index() {
  const { data, isPending } = api.employee.all.useQuery();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <View className="mb-4 flex flex-row items-center gap-3 rounded-lg rounded-md border border-zinc-200 bg-white p-4">
            <View className="size-20 rounded-full bg-zinc-200" />
            <View>
              <Text className="text-xl font-semibold text-black">
                {item.name}
              </Text>
              <Text className="text-base text-gray-600">Data: {item.role}</Text>
            </View>

            <Link
              className="text-md ml-auto font-semibold text-blue-500"
              href={`/(drawer)/(tabs)/employees/${item.id}`}
            >
              Ver detalhes
            </Link>
          </View>
        )}
      />
    </View>
  );
}
