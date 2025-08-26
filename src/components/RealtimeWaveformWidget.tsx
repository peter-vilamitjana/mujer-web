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

  const baseline = height / 2;

  // ===== reemplazo de la “lógica de onda” por curva de nivel suave =====
  const pathRef = useRef<SVGPathElement | null>(null);

  // buffer de puntos (últimos N minutos). Cada punto representa un sample.
  const WINDOW_MIN = 15; // ventana visible ~15 min (ajustable: más largo = más lenta)
  const SAMPLE_EVERY_MS = 2000; // muestreo cada 2s (ajusta a 3000 si la querés más lenta)
  const SAMPLES = Math.ceil((WINDOW_MIN * 60_000) / SAMPLE_EVERY_MS);

  const pointsRef = useRef<number[]>(
    Array.from({ length: SAMPLES }, () => baseline)
  );

  // nivel suavizado (EMA): sube/baja lento hacia el target (según nowCount)
  const levelRef = useRef(baseline);
  const targetRef = useRef(baseline);

  // mapea cantidad de clientas a Y de pantalla (arriba = más clientas)
  function yForCount(count: number) {
    const maxRef =
      capacity ?? Math.max(1, ...sparkline, 6); // normaliza por capacidad o por histórico
    const norm = Math.max(0, Math.min(1, count / maxRef));
    const top = baseline - 50; // altura máxima (sube hasta 50px por encima del medio)
    const bottom = baseline + 10; // y mínimo (ligeramente debajo del medio)
    return bottom - (bottom - top) * norm; // más clientas => más arriba
  }

  // cuando cambia nowCount/ capacidad / sparkline, movemos el target
  useEffect(() => {
    targetRef.current = yForCount(nowCount ?? 0);
  }, [nowCount, capacity, sparkline, yForCount]);

  useEffect(() => {
    let raf: number | null = null;
    let last = performance.now();
    let acc = 0;

    const EMA_ALPHA_RISE = 0.12; // rapidez al subir
    const EMA_ALPHA_FALL = 0.10; // rapidez al bajar (ligeramente más lenta; elegí a gusto)

    const tick = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      acc += dt;

      // amortiguación del nivel hacia el target (sube/baja despacio)
      const cur = levelRef.current;
      const tgt = targetRef.current;
      const alpha = tgt < cur ? EMA_ALPHA_RISE : EMA_ALPHA_FALL; // ojo: en Y, menor = más arriba
      levelRef.current = cur + (tgt - cur) * alpha;

      // cada SAMPLE_EVERY_MS agregamos un nuevo punto y desplazamos
      if (acc >= SAMPLE_EVERY_MS) {
        acc = 0;
        const pts = pointsRef.current;
        pts.shift();
        // micro-variación de ±1px para que no quede 100% rígida
        const micro = (Math.random() - 0.5) * 2;
        pts.push(levelRef.current + micro);
      }

      // dibujar path suave (Catmull-Rom → Bézier simple)
      if (pathRef.current) {
        const pts = pointsRef.current;
        const stepX = width / (SAMPLES - 1);
        // path con L simple (rápido y limpio); si querés más suavidad, podés implementar Bezier
        let d = "";
        for (let i = 0; i < pts.length; i++) {
          const x = i * stepX;
          const y = pts[i];
          d += (i === 0) ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
        pathRef.current.setAttribute("d", d);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, baseline, SAMPLES, SAMPLE_EVERY_MS]);

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
