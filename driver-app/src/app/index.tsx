import { useEffect } from "react";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";
import { Text, View } from "react-native";

export default function HomeScreen() {
  useEffect(() => {
    console.log("Driver app started");
    startTracking();
  }, []);

  async function startTracking() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Permission status:", status);
    if (status !== "granted") return;

    await Location.enableNetworkProviderAsync();

    Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 2000,
    distanceInterval: 2,
  },
  async (location) => {
    const { latitude, longitude, accuracy } = location.coords;

    console.log("Accuracy:", accuracy);

    if (accuracy == null || accuracy > 30) {
      console.log("Skipping low accuracy");
      return;
    }

    await supabase.from("vehicles").upsert({
      id: "driver-1",
      driver_name: "Driver 1",
      latitude,
      longitude,
      updated_at: new Date(),
    });
  }
);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Driver App Running 🚐</Text>
    </View>
  );
}