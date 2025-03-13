import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { api } from "@/utils/api";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) throw new Error("Not found!");

  const { data, isPending } = api.employee.getById.useQuery({ employeeId: id });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator className="size-4" />
      </View>
    );
  }

  return (
    <View>
      <Text>{data?.name}</Text>
    </View>
  );
}
