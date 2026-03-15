import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

const pickupPoints = [
  {
    id: 1,
    name: "Campus 25 (BLOCK A)",
    latitude: 20.364304,
    longitude:   85.816157,
  },
  {
    id: 2,
    name: "Campus 25 (KIIT KAFE)",
    latitude: 20.363693,
    longitude:  85.817290,
  },
  {
    id: 3,
    name: "Campus 14",
    latitude: 20.356463,
    longitude:  85.815693,
  },
  {
    id: 4,
    name: "Campus 13",
    latitude: 20.356376,
    longitude: 85.818497,
  },
  {
    id: 5,
    name: "Campus 12",
    latitude: 20.354561,
    longitude: 85.819339,
  },
  {
    id: 6,
    name: "Campus 6",
    latitude: 20.352551,
    longitude: 85.819276,
  },
  {
    id: 7,
    name: "Campus 17",
    latitude: 20.349300,
    longitude: 85.819440,
  },
  {
    id: 8,
    name: "Transport",
    latitude: 20.354712,
    longitude: 85.818027,
  },
  {
    id: 9,
    name: "Campus 14 (South Gate)",
    latitude: 20.355495,
    longitude: 85.815649,
  },
];

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    getLocation();
  }, []);

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    let userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 20.3548,
          longitude: 85.8199,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {pickupPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={point.name}
            description="Pickup Point"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});