"use client";

import { useEffect, useState } from "react";
import { Text, Icon } from "citrica-ui-toolkit";
import { useSupabase } from "@/shared/context/supabase-context";

export default function TodayMeetingsBanner() {
  const { supabase } = useSupabase();
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTodayMeetings = async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("type_id", 1)
        .eq("booking_date", todayStr)
        .in("status", ["pending", "confirmed"]);

      setCount(data?.length || 0);
      setLoaded(true);
    };

    fetchTodayMeetings();
  }, [supabase]);

  if (!loaded || count === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-[#EEF1F7] border border-[#D4DEED] rounded-xl px-4 py-3 mb-4">
      <div className="w-8 h-8 bg-[#265197] rounded-lg flex items-center justify-center shrink-0">
        <Icon name="Calendar" size={16} color="#FFFFFF" />
      </div>
      <Text isAdmin variant="body" color="#265197">
        Tienes <strong>{count} reunión{count > 1 ? "es" : ""}</strong> programada{count > 1 ? "s" : ""} para hoy
      </Text>
      <a href="/admin/crm/reuniones" className="ml-auto">
        <Text isAdmin variant="label" weight="bold" color="#265197" className="hover:underline cursor-pointer">
          Ver reuniones →
        </Text>
      </a>
    </div>
  );
}
