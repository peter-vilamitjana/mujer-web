'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, Users, Scissors, Loader2 } from "lucide-react";
import { PopularServicesChart } from "@/components/charts/PopularServicesChart";
import { db } from "@/lib/firebase";
import VolumenTiempoReal from "@/components/VolumenTiempoReal";
import IngresosSemanalesCard from "@/components/IngresosSemanalesCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthlyVolumeChart } from "@/components/charts/MonthlyVolumeChart";
import { WeeklyTurnosChart } from "@/components/charts/WeeklyTurnosChart";
import { useSession } from "next-auth/react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

// Fallback mock data for charts while we build the real data ingestion
const mockChartData = {
  ingresosSemana: {
    total: 0,
    tendencia: 0,
  },
  turnosHoy: 0,
  totalClientes: 0,
  serviciosTop: [],
  horaPico: [],
  turnosSemana: [],
  volumenMensual: []
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchSalonData = async () => {
      try {
        // 1. Get User to find Salon ID (if not already in session)
        // In a real app we'd trust the session, but let's be double sure or handle the case where it's not updated yet
        // For now, let's try to get it from the user doc if we don't have it easily
        let salonId = (session.user as any).salonId;

        if (!salonId) {
          const userDoc = await getDoc(doc(db, "users", session.user.id));
          if (userDoc.exists()) {
            salonId = userDoc.data().salonId;
          }
        }

        if (!salonId) {
          setLoading(false);
          return;
        }

        // 2. Subscribe to Salon Document for realtime updates (optional, or just fetch)
        // For dashboard stats we might want to listen to a "stats" subcollection or just aggregated fields on the salon doc
        const unsub = onSnapshot(doc(db, "salons", salonId),
          (doc) => {
            if (doc.exists()) {
              setSalonData(doc.data());
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching salon data:", error);
            setLoading(false);
          }
        );

        return () => unsub();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [session]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
  }

  if (!salonData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No se encontró información del salón</h2>
        <p className="text-gray-500">Por favor contacta a soporte o registra tu salón.</p>
      </div>
    )
  }

  // Use real data where available, fallback to 0 or mocks
  const turnosHoy = 0; // TODO: Fetch from 'appointments' collection
  const totalClientes = 0; // TODO: Fetch from 'clients' collection count

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Hola, {salonData.name}</h1>
        <p className="text-muted-foreground mt-1">Resumen de la actividad y rendimiento de tu salón.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <IngresosSemanalesCard /> {/* Needs refactoring to accept props or fetch its own data */}

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Turnos de Hoy</span>
            </CardTitle>
            <CardDescription className="text-sm">Total de citas programadas para la jornada.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-4xl font-bold">{turnosHoy}</p>
            <Scissors className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Total de Clientes</span>
            </CardTitle>
            <CardDescription className="text-sm">Clientes registrados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-4xl font-bold">{totalClientes}</p>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <Tabs defaultValue="semana">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Volumen de Turnos</CardTitle>
                  <CardDescription>Comparación de la cantidad de turnos.</CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="dia">Día</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <TabsContent value="dia" className="h-80 w-full p-4">
              <WeeklyTurnosChart data={mockChartData.horaPico} />
            </TabsContent>
            <TabsContent value="semana" className="h-80 w-full p-4">
              <WeeklyTurnosChart data={mockChartData.turnosSemana} />
            </TabsContent>
            <TabsContent value="mes" className="h-80 w-full p-4">
              <MonthlyVolumeChart data={mockChartData.volumenMensual} />
            </TabsContent>
          </Tabs>
        </Card>
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>Top 5 más solicitados esta semana.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <PopularServicesChart items={mockChartData.serviciosTop} updatedAt={new Date()} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between rounded-2xl">
          <CardHeader>
            <CardTitle>Volumen en Tiempo Real</CardTitle>
            <CardDescription>Pulso de actividad del salón ahora mismo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-0">
            <VolumenTiempoReal db={db} sucursalId={salonData.id || "main"} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Hora Pico del Día</CardTitle>
            <CardDescription>Distribución de turnos a lo largo de la jornada.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <WeeklyTurnosChart data={mockChartData.horaPico} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
