'use client';
// RealtimeWaveformWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Firestore } from "firebase/firestore";
import { useRealtimeMetrics } from "../hooks/useRealtimeMetrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  db: Firestore;
  sucursalId: string;
  width?: number;
  height?: number;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function RealtimeWaveformWidget({
  db,
  sucursalId,
  width = 620,
  height = 140,
}: Props) {
  const { nowCount, lastHourCount, sparkline, capacity, stale } =
    useRealtimeMetrics(db, sucursalId);

  const SAMPLES = 240;
  const baseline = height / 2;

  const [amp, setAmp] = useState(8);      
  const ampTargetRef = useRef(8);         
  const pointsRef = useRef<number[]>(
    Array.from({ length: SAMPLES }, () => baseline)
  );
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    if (nowCount === null) return;
    const maxRef =
      capacity ??
      (sparkline.length ? Math.max(1, ...sparkline) : 6); 
    const normalized = clamp((nowCount ?? 0) / maxRef, 0, 1);
    // The target amplitude is now the main driver of the wave's height.
    // It maps the number of clients to a pixel value for the wave's amplitude.
    // An amplitude of 0 means the wave is on the baseline.
    // We use a max amplitude of about 60px to avoid it going off-screen.
    ampTargetRef.current = normalized * (height / 2 - 10);
  }, [nowCount, sparkline, capacity, height]);

  useEffect(() => {
    if (!sparkline?.length) return;
    const maxRef =
      capacity ?? Math.max(1, ...sparkline);
    const mapped = sparkline.map((v, i) => {
      const norm = clamp(v / maxRef, 0, 1);
      // Map directly to a vertical position, no longer a sine wave
      const localAmp = norm * (height / 2 - 10);
      return baseline - localAmp;
    });
    const resampled: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const idx = Math.floor((i / SAMPLES) * mapped.length);
      resampled.push(mapped[clamp(idx, 0, mapped.length - 1)]);
    }
    pointsRef.current = resampled;
    setAmp(ampTargetRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparkline, capacity, height]); 

  const pathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    const animate = () => {
      setAmp((prev) => lerp(prev, ampTargetRef.current, 0.08));
      tRef.current += 0.06; 
      
      // The new point is now based on the smoothed amplitude, not a sine wave.
      // A small noise is added for a "breathing" effect.
      const noise = (Math.random() - 0.5) * 2; // small random flicker
      const y = baseline - amp + noise;

      const pts = pointsRef.current;
      pts.shift();
      pts.push(clamp(y, 5, height - 5)); // Clamp to stay within view

      if (pathRef.current) {
        const stepX = width / (SAMPLES - 1);
        let d = "";
        for (let i = 0; i < pts.length; i++) {
          const x = i * stepX;
          const y = pts[i];
          if (i === 0) d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
          else d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
        pathRef.current.setAttribute("d", d);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, baseline, SAMPLES, amp, height]);

  const gradientId = useMemo(
    () => `grad-${Math.random().toString(36).slice(2)}`,
    []
  );

  const isLoading = nowCount === null;

  return (
    <div className="p-4 w-full h-full flex flex-col justify-center items-center">
      {isLoading ? (
        <div className="space-y-4 w-full px-4">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-1/3 mx-auto" />
        </div>
      ) : (
        <>
          <div
            className="w-full relative"
            style={{
              height,
              marginTop: 8,
              marginBottom: 8,
              borderRadius: 16,
            }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5"></div>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#B794FF" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <line x1="0" y1={baseline} x2={width} y2={baseline} className="stroke-border/50" />

              <path
                ref={pathRef}
                d={`M 0 ${baseline} L ${width} ${baseline}`}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={3}
                filter="url(#glow)"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div
              className="text-5xl font-extrabold text-primary"
              style={{ lineHeight: 1 }}
            >
              {nowCount}
            </div>
            <div className="text-lg font-semibold text-foreground mt-2">
              clientas en este momento
            </div>
            <div className={cn("text-sm text-muted-foreground mt-1", stale && "text-amber-500 animate-pulse")}>
              Última hora: {lastHourCount} turnos {stale ? " · actualizando…" : ""}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
