import { ActivityIndicator, Image, Text, View } from "react-native";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import { LoadingScreen } from "@/components/loading-screen";
import { api } from "@/utils/api";

export default function Index() {
  const { data, isPending } = api.employee.listEmployees.useQuery();

  if (isPending) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlashList
        data={data}
        estimatedItemSize={80}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#e4e4e7",
              backgroundColor: "white",
              padding: 16,
            }}
          >
            <Image
              src={item.image ?? ""}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />

            <View>
              <Text style={{ fontSize: 20, fontWeight: "600", color: "black" }}>
                {item.name}
              </Text>
            </View>

            <Link
              style={{
                marginLeft: "auto",
                fontSize: 16,
                fontWeight: "600",
                color: "#3b82f6",
              }}
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
