'use client';
import { useEffect, useState, useRef, useCallback } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { Turno } from "@/lib/types";
import { safeFormatDate } from "@/lib/utils";

const INTERVAL_MS = 3000; // 3 seconds
const WINDOW_MIN = 15; // 15 minutes
const MAX_SERIES_POINTS = (WINDOW_MIN * 60 * 1000) / INTERVAL_MS;

type SeriePoint = { t: number; v: number };

const isTurnoActive = (turno: Turno, now: number): boolean => {
  const estadoValido = ["confirmado", "check-in", "en_progreso"].includes(turno.estado);
  if (!estadoValido) return false;

  const inicio = new Date(turno.fecha).getTime();
  const fin = inicio + (turno.duracion || 30) * 60 * 1000;

  return inicio <= now && now < fin;
};

const didTurnoOverlapLastHour = (turno: Turno, now: number): boolean => {
  const estadoValido = ["confirmado", "check-in", "en_progreso", "realizado"].includes(turno.estado);
  if (!estadoValido) return false;

  const oneHourAgo = now - 60 * 60 * 1000;
  const inicio = new Date(turno.fecha).getTime();
  const fin = inicio + (turno.duracion || 30) * 60 * 1000;

  return inicio < now && fin > oneHourAgo;
};


export function useOcupacionEnVivo(db: Firestore, sucursalId: string) {
  const [turnosDelDia, setTurnosDelDia] = useState<Turno[]>([]);
  const [ocupacionActual, setOcupacionActual] = useState(0);
  const [ocupacionUltimaHora, setOcupacionUltimaHora] = useState(0);
  const [serie, setSerie] = useState<SeriePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const turnosRef = useRef(turnosDelDia);
  turnosRef.current = turnosDelDia;

  // Subscribe to today's appointments
  useEffect(() => {
    if (!db || !sucursalId) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const turnosQuery = query(
      collection(db, "turnos"),
      where("sucursalId", "==", sucursalId)
    );

    // Mocking a single active appointment for demonstration if no real data exists
    // In a real scenario, you'd rely solely on Firestore
    const createMockTurno = () => {
      const now = new Date();
      const mock: Turno = {
        id: 'mock-1',
        sucursalId: 'main',
        clienteId: 'mock-client',
        clienteNombre: 'Clienta de Prueba',
        servicio: 'Corte',
        servicioIds: ['corte'],
        fecha: now.toISOString(),
        empleadaAsignadaId: 'mock-prof',
        empleadaNombre: 'Profesional de Prueba',
        estado: 'en_progreso',
        duracion: 60,
        precio: 5000,
      };
      setTurnosDelDia([mock]);
      setIsLoading(false);
    };

    const unsubscribe = onSnapshot(turnosQuery,
      (snapshot) => {
        const turnosData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fecha: safeFormatDate(data.fecha),
          } as Turno;
        }).filter(turno => {
          const fechaTurno = new Date(turno.fecha);
          return fechaTurno >= todayStart && fechaTurno <= todayEnd;
        });

        if (turnosData.length === 0 && process.env.NODE_ENV === 'development') {
          console.log("No appointments for today. Using mock data for demonstration.");
          createMockTurno();
        } else {
          setTurnosDelDia(turnosData);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        setIsLoading(false);
        // Fallback to mock on error during dev
        if (process.env.NODE_ENV === 'development') createMockTurno();
      }
    );

    return () => unsubscribe();
  }, [db, sucursalId]);

  // Interval to calculate metrics
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isLoading) return;

      const now = Date.now();

      // Calculate current occupation
      const currentOccupation = turnosRef.current.filter(t => isTurnoActive(t, now)).length;
      setOcupacionActual(currentOccupation);

      // Calculate last hour occupation
      const lastHourOccupation = turnosRef.current.filter(t => didTurnoOverlapLastHour(t, now)).length;
      setOcupacionUltimaHora(lastHourOccupation);

      // Update data series for the chart
      setSerie(prevSerie => {
        const newPoint = { t: now, v: currentOccupation };
        const newSerie = [...prevSerie, newPoint];
        // Keep the series window fixed
        while (newSerie.length > MAX_SERIES_POINTS) {
          newSerie.shift();
        }
        return newSerie;
      });

    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Dummy staleness check - in a real scenario this would be based on backend update time
  useEffect(() => {
    const staleTimer = setTimeout(() => setIsStale(true), 2 * 60 * 1000); // 2 minutes
    return () => clearTimeout(staleTimer);
  }, []);


  return { ocupacionActual, ocupacionUltimaHora, serie, isLoading, isStale };
}
