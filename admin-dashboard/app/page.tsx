"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [demand, setDemand] = useState<any[]>([]);

  useEffect(() => {
    fetchDemand();
  
    const channel = supabase
      .channel("realtime-demand")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
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


  async function clearRequests(pickupName: string) {
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
  
    fetchDemand();
  }

  async function fetchDemand() {
    const { data, error } = await supabase
      .from("raise_requests")
      .select(`
        id,
        pickup_points (
          name
        )
      `);

    if (error) {
      console.log(error);
      return;
    }

    const counts: any = {};

    data.forEach((req: any) => {
      const name = req.pickup_points.name;

      if (!counts[name]) counts[name] = 0;
      counts[name]++;
    });

    const result = Object.keys(counts).map((key) => ({
      name: key,
      count: counts[key],
    }));

    setDemand(result);
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Campus Transport Demand
      </h1>

      <div className="space-y-4">
        {demand.map((point) => (
          <div
            key={point.name}
            className="p-4 border rounded-lg flex justify-between items-center"
              >
            <span className="text-lg">{point.name}</span>
          
            <div className="flex gap-4 items-center">
              <span className="font-bold">
                {point.count} students waiting
              </span>
          
              <button
                onClick={() => clearRequests(point.name)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}