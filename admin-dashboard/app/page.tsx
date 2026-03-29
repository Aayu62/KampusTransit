"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
});

export default function Dashboard() {
  const [demand, setDemand] = useState<any[]>([]);

  useEffect(() => {
    fetchDemand();
  
    const channel = supabase
      .channel("realtime-demand")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "raise_requests",
        },
        () => {
          fetchDemand();
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  async function acknowledgeRequests(pickupName: string) {
    const { data: points } = await supabase
      .from("pickup_points")
      .select("id")
      .eq("name", pickupName)
      .single();
  
    if (!points) return;
  
    await supabase
      .from("raise_requests")
      .delete()
      .eq("pickup_point_id", points.id);
  
    alert(`Demand at ${pickupName} acknowledged`);
    fetchDemand();
  }

  async function fetchDemand() {
    // 1. Get all pickup points
    const { data: points, error: pointError } = await supabase
      .from("pickup_points")
      .select("id, name, latitude, longitude");
  
    if (pointError) {
      console.log(pointError);
      return;
    }
  
    // 2. Get all raise requests
    const { data: requests, error: reqError } = await supabase
      .from("raise_requests")
      .select("pickup_point_id");
  
    if (reqError) {
      console.log(reqError);
      return;
    }
  
    // 3. Count requests per pickup point
    const counts: any = {};
  
    requests.forEach((req: any) => {
      if (!counts[req.pickup_point_id]) {
        counts[req.pickup_point_id] = 0;
      }
      counts[req.pickup_point_id]++;
    });
  
    // 4. Merge with pickup points
    const result = points.map((point: any) => ({
      id: point.id,
      name: point.name,
      latitude: point.latitude,
      longitude: point.longitude,
      count: counts[point.id] || 0,
    }));
  
    setDemand(result);
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Campus Transport Demand
      </h1>

      <MapView points={demand} />

      <div className="space-y-4">
        {demand.map((point) => (
          <div
            key={point.name}
            className="p-4 border rounded-lg flex justify-between items-center"
              >
            <span className="text-lg">{point.name}</span>
          
            <div className="flex gap-4 items-center">
              <span className={`font-bold ${point.count === 0 ? "text-gray-400" : "text-black"}`}>
                {point.count} students waiting
              </span>
          
              <button
                onClick={() => acknowledgeRequests(point.name)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}