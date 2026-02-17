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
import { useUser } from "@/contexts/UserContext";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

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
  const user = useUser();
  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [debugStep, setDebugStep] = useState('Initializing...');

  useEffect(() => {
    if (!user) {
      setDebugStep('Waiting for user context...');
      return;
    }

    const fetchSalonData = async () => {
      try {
        setDebugStep(`User Context OK. ID: ${user.id}. Rol: ${user.rol}`);

        let salonId = user.salonId;

        if (!salonId) {
          setDebugStep('No Salon ID found in user profile.');
          setLoading(false);
          return;
        }

        setDebugStep(`Subscribing to Salon: ${salonId}...`);
        const unsub = onSnapshot(doc(db, "salons", salonId),
          (doc) => {
            if (doc.exists()) {
              setSalonData(doc.data());
              setDebugStep('Salon data loaded!');
            } else {
              setDebugStep(`Salon document "${salonId}" does not exist.`);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching salon data:", error);
            setDebugStep(`Error subscribing to salon: ${error.message}`);
            setLoading(false);
          }
        );

        return () => unsub();
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setDebugStep(`Fatal error: ${error.message}`);
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [user]);

  const handleFixAccount = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setDebugStep('Iniciando reparación automática de cuenta...');

      // 1. Update User with salonId: "main"
      await setDoc(doc(db, "users", user.id), {
        salonId: "main",
        rol: "admin", // Ensure role is admin
        nombre: user.nombre || "Administradora",
        email: user.email || "admin@mujer.com"
      }, { merge: true });

      // 2. Create default Salon doc: "main"
      await setDoc(doc(db, "salons", "main"), {
        name: "Mi Salón",
        ownerId: user.id,
        createdAt: new Date().toISOString()
      }, { merge: true });

      setDebugStep('¡Cuenta reparada! Recargando página...');

      // Delay slightly to ensure writes propagate then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (e: any) {
      console.error(e);
      setDebugStep(`Error al reparar cuenta: ${e.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        <p className="text-gray-500 font-mono text-sm">{debugStep}</p>
      </div>
    );
  }

  if (!salonData) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold">No se encontró información del salón</h2>
        <p className="text-gray-500">Estado Final: {debugStep}</p>
        <p className="text-xs text-gray-400 mt-4">ID de Usuario: {user?.id}</p>

        <div className="mt-8">
          <Button onClick={handleFixAccount} variant="default">
            Crear Mi Salón y Vincular Cuenta (Automático)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Esto creará los datos faltantes en la base de datos por ti.
          </p>
        </div>
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
