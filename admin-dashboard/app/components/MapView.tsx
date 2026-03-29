"use client";
import dynamic from "next/dynamic";
import L from "leaflet";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  driver_name: string;
  latitude: number;
  longitude: number;
  updated_at?: string;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    iconSize: [32, 32],
  });

const MapContainer: any = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer: any = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker: any = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup: any = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

function getColor(count: number) {
  if (count === 0) return "green";
  if (count <= 2) return "yellow";
  if (count <= 5) return "yellow";
  return "red";
}

export default function MapView({ points }: any) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // initial fetch
  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*");
    setVehicles(data || []);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ✅ realtime listener with smooth updates
  useEffect(() => {
    const channel = supabase
      .channel("vehicles-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        (payload) => {
          console.log("Realtime update:", payload);

          const updatedVehicle = payload.new as Vehicle;
          setVehicles((prev) => {
            const exists = prev.find((v) => v.id === updatedVehicle.id);
        
            if (exists) {
              return prev.map((v) =>
                v.id === updatedVehicle.id ? updatedVehicle : v
              );
            } else {
              return [...prev, updatedVehicle];
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MapContainer
      center={[20.3548, 85.8199] as [number, number]}
      zoom={15}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* pickup points */}
      {points
        .filter(
          (point: any) =>
            point.latitude !== null &&
            point.longitude !== null &&
            point.latitude !== undefined &&
            point.longitude !== undefined
        )
        .map((point: any) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude] as [number, number]}
            icon={createIcon(getColor(point.count))}
          >
            <Popup>
              {point.name} <br />
              {point.count} students waiting
            </Popup>
          </Marker>
        ))}

      {/* vehicles */}
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={createIcon("blue")}
        >
          <Popup>
            Vehicle #{vehicle.id} <br />
            Driver: {vehicle.driver_name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}