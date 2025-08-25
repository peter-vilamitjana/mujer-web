'use client';
// useRealtimeMetrics.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot, type Firestore } from "firebase/firestore";

type MetricsDoc = {
  updatedAt?: any;
  ahora?: { count: number };
  ultimaHora?: { count: number };
  sparkline?: number[];
  capacidadSillones?: number;
};

export function useRealtimeMetrics(
  db: Firestore,
  sucursalId: string
) {
  const [nowCount, setNowCount] = useState<number | null>(null);
  const [lastHourCount, setLastHourCount] = useState<number | null>(null);
  const [sparkline, setSparkline] = useState<number[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [stale, setStale] = useState<boolean>(false);

  useEffect(() => {
    if (!db || !sucursalId) return;
    const ref = doc(db, `sucursales/${sucursalId}/metrics/realtime`);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNowCount(0); // Default to 0 instead of null
        setLastHourCount(0);
        setSparkline([]);
        setCapacity(null);
        setStale(true);
        return;
      }
      const d = snap.data() as MetricsDoc;
      setNowCount(d.ahora?.count ?? 0);
      setLastHourCount(d.ultimaHora?.count ?? 0);
      setSparkline(Array.isArray(d.sparkline) ? d.sparkline : []);
      setCapacity(typeof d.capacidadSillones === "number" ? d.capacidadSillones : null);

      // si no hay updatedAt o está viejo (+2min) marcamos stale
      const updated = d.updatedAt?.toMillis?.() ?? 0;
      setStale(updated > 0 && Date.now() - updated > 2 * 60_000);
    });

    return () => unsub();
  }, [db, sucursalId]);

  return { nowCount, lastHourCount, sparkline, capacity, stale };
}
