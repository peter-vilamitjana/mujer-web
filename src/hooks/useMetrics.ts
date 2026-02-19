import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, getCountFromServer } from 'firebase/firestore';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, isSameDay, subMonths, startOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '@/lib/schema';
import { useTenant } from '@/contexts/TenantContext';

export interface DashboardMetrics {
    turnosHoy: number;
    turnosSemana: { dia: string; cantidad: number }[];
    ingresosSemana: { total: number; tendencia: number }; // Tendencia dummy por ahora
    totalClientes: number;
    serviciosTop: { nombre: string; porcentaje: number; deltaPct: number }[];
    volumenMensual: { mes: string; total: number }[];
    horaPico: { hora: string; turnos: number }[];
    loading: boolean;
}

export function useMetrics() {
    const { tenantId } = useTenant();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [totalClientes, setTotalClientes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        setLoading(true);

        // 1. Fetch Appointments (Last 2 months for trends/volume)
        const startDate = startOfMonth(subMonths(new Date(), 1));
        const q = query(
            collection(db, 'tenants', tenantId, 'appointments'),
            where('date', '>=', Timestamp.fromDate(startDate))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(data);
            setLoading(false);
        });

        // 2. Fetch Total Customers Count (One-off)
        const fetchCustomersCount = async () => {
            try {
                const coll = collection(db, 'tenants', tenantId, 'customers');
                const snapshot = await getCountFromServer(coll);
                setTotalClientes(snapshot.data().count);
            } catch (e) {
                console.error("Error fetching customer count:", e);
            }
        };
        fetchCustomersCount();

        return () => unsubscribe();
    }, [tenantId]);

    const metrics = useMemo((): DashboardMetrics => {
        const now = new Date();
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });

        // A. Turnos Hoy
        const turnosHoy = appointments.filter(a =>
            isSameDay(a.date.toDate(), now) && a.status !== 'cancelled'
        ).length;

        // B. Ingresos Semana
        const turnosThisWeek = appointments.filter(a => {
            const d = a.date.toDate();
            return d >= startOfCurrentWeek && d <= endOfCurrentWeek && a.status !== 'cancelled';
        });

        const ingresosTotal = turnosThisWeek.reduce((sum, a) => sum + (a.priceFinal || a.priceEstimated || 0), 0);

        // C. Turnos Por Dia (Semana)
        const weekDaysMap = new Map<string, number>();
        ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(d => weekDaysMap.set(d, 0));

        turnosThisWeek.forEach(a => {
            const dayName = format(a.date.toDate(), 'eee', { locale: es });
            // Normalize generic day names if needed, usually 'lun', 'mar' etc from date-fns
            const formattedKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            // Mapping simple for now, relying on date-fns locale match
            // A simpler approach: index 0-6
            const dayIndex = (a.date.toDate().getDay() + 6) % 7; // Mon=0
            const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            weekDaysMap.set(labels[dayIndex], (weekDaysMap.get(labels[dayIndex]) || 0) + 1);
        });
        const turnosSemana = Array.from(weekDaysMap.entries()).map(([dia, cantidad]) => ({ dia, cantidad }));

        // D. Top Servicios
        const serviceCounts = new Map<string, number>();
        appointments.forEach(a => {
            if (a.serviceNames && a.status !== 'cancelled') {
                // Split if multiple? usually straightforward string
                const services = a.serviceNames.split(',').map(s => s.trim());
                services.forEach(s => serviceCounts.set(s, (serviceCounts.get(s) || 0) + 1));
            }
        });
        const totalServices = Array.from(serviceCounts.values()).reduce((a, b) => a + b, 0) || 1;
        const serviciosTop = Array.from(serviceCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([nombre, count]) => ({
                nombre,
                porcentaje: Math.round((count / totalServices) * 100),
                deltaPct: 0 // No trend calculation for now
            }));

        // E. Volumen Mensual
        const currentMonthKey = format(now, 'MMMM', { locale: es });
        const lastMonthKey = format(subMonths(now, 1), 'MMMM', { locale: es });

        const countCurrentMonth = appointments.filter(a => format(a.date.toDate(), 'MMMM', { locale: es }) === currentMonthKey).length;
        const countLastMonth = appointments.filter(a => format(a.date.toDate(), 'MMMM', { locale: es }) === lastMonthKey).length;

        const volumenMensual = [
            { mes: lastMonthKey, total: countLastMonth },
            { mes: currentMonthKey, total: countCurrentMonth }
        ];

        // F. Hora Pico
        const hoursMap = new Map<string, number>();
        appointments.forEach(a => {
            const h = a.date.toDate().getHours();
            const key = `${String(h).padStart(2, '0')}:00`;
            hoursMap.set(key, (hoursMap.get(key) || 0) + 1);
        });
        // Sort by hour
        const horaPico = Array.from(hoursMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([hora, turnos]) => ({ hora, turnos }));


        return {
            turnosHoy,
            turnosSemana,
            ingresosSemana: { total: ingresosTotal, tendencia: 0 },
            totalClientes,
            serviciosTop,
            volumenMensual,
            horaPico,
            loading
        };

    }, [appointments, totalClientes, loading]);

    return metrics;
}
