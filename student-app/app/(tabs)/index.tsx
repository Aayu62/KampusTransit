import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Alert } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { getDistance } from "geolib";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);

  useEffect(() => {
    getLocation();
    fetchPickupPoints();
  }, []);

  async function fetchPickupPoints() {
    const { data, error } = await supabase
      .from("pickup_points")
      .select("*");
  
    if (error) {
      console.log(error);
    } else {
      setPickupPoints(data);
    }
  }

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    let userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
  }

  async function raiseHand(point: any) {
    if (!location) {
      Alert.alert("Location not available");
      return;
    }
  
    const distance = getDistance(
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      {
        latitude: point.latitude,
        longitude: point.longitude,
      }
    );
  
    if (distance > 100) {
      Alert.alert(
        "Too Far",
        "You must be within 50 meters of the pickup point."
      );
      return;
    }
  
    const lastRaise = await AsyncStorage.getItem("lastRaiseTime");
    const now = Date.now();
  
    if (lastRaise) {
      const diff = now - parseInt(lastRaise);
  
      if (diff < 10000) {
        const remaining = Math.ceil((180000 - diff) / 1000);
  
        Alert.alert(
          "Please wait",
          `You can raise another request in ${remaining} seconds`
        );
        return;
      }
    }
  
    await AsyncStorage.setItem("lastRaiseTime", now.toString());
  
    const { error } = await supabase
      .from("raise_requests")
      .insert({
        pickup_point_id: point.id,
      });
    
    if (error) {
      Alert.alert("Error", "Failed to send request");
    } else {
      Alert.alert("Success", `Request sent at ${point.name}`);
    }
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
            description="Tap to request transport"
            onCalloutPress={() => raiseHand(point)}
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