'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { db, auth } from '@/lib/firebase';
import { collection, doc, writeBatch, Timestamp, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// Hardcoded data — these are seeded into tenants/demo-salon/*
const SERVICES = [
    { id: 'alisado-fotonico', name: 'Alisado Fotónico Laser', description: 'Tratamiento de alisado con tecnología láser fotónico para un cabello liso y brillante.', price: 34999, durationMinutes: 120, image: '/images/services/alisado.png', variablePrice: true, requiresLengthSelection: true },
    { id: 'permanente', name: 'Permanente', description: 'Rizado permanente profesional con los mejores productos del mercado.', price: 34999, durationMinutes: 150, image: '/images/services/permanente.png', variablePrice: false, requiresLengthSelection: true },
    { id: 'balayage', name: 'Balayage', description: 'Técnica de coloración francesa que crea un degradé natural y luminoso.', price: 29999, durationMinutes: 180, image: '/images/services/balayage.png', variablePrice: true, requiresLengthSelection: true },
    { id: 'corte-estilo', name: 'Corte & Estilo', description: 'Corte personalizado con ending styling profesional acorde a tu look.', price: 15999, durationMinutes: 60, image: '/images/services/corte.png', variablePrice: false, requiresLengthSelection: false },
    { id: 'coloracion', name: 'Coloración Profesional', description: 'Coloración completa con productos de primera línea para mayor durabilidad y brillo.', price: 24999, durationMinutes: 120, image: '/images/services/coloracion.png', variablePrice: true, requiresLengthSelection: true },
    { id: 'keratina', name: 'Keratina Profesional', description: 'Tratamiento de keratina que elimina el frizz y aporta brillo y suavidad duraderos.', price: 39999, durationMinutes: 150, image: '/images/services/keratina.png', variablePrice: true, requiresLengthSelection: true },
];

const PROMOS = [
    { id: 'promo-tradicional', name: 'Pack Tradicional', description: 'Corte + Peinado', price: 22000, durationMinutes: 90 },
    { id: 'promo-premium', name: 'Pack Premium', description: 'Corte + Color + Peinado', price: 45000, durationMinutes: 180 },
    { id: 'promo-novia', name: 'Pack Novia', description: 'Peinado nupcial + Maquillaje', price: 80000, durationMinutes: 240 },
];

const STAFF = [
    { id: 'staff-valeria', name: 'Valeria', role: 'Estilista Senior', image: null },
    { id: 'staff-lucia', name: 'Lucía', role: 'Colorista', image: null },
    { id: 'staff-camila', name: 'Camila', role: 'Estilista', image: null },
];

const BRANCHES = [
    { id: 'sucursal-centro', name: 'Sucursal Centro', address: 'Av. Corrientes 1234, CABA', phone: '+54 11 4567-8900', active: true },
];

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setUser(u));
        return () => unsub();
    }, []);

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (e: unknown) {
            console.error(e);
            setResult({ success: false, message: 'Error al loguearse: ' + (e instanceof Error ? e.message : String(e)) });
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto py-12 flex justify-center">
                <Card className="w-full max-w-md text-center p-6">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Requiere Autenticación</h2>
                    <p className="text-muted-foreground mb-6">Debes iniciar sesión para ejecutar la migración.</p>
                    <Button onClick={handleLogin}>Iniciar Sesión con Google</Button>
                </Card>
            </div>
        )
    }

    const handleSeed = async () => {
        setLoading(true);
        setResult(null);

        try {
            const batch = writeBatch(db);
            const tenantId = 'demo-salon'; // Hardcoded for migration

            // 1. Create Tenant Doc
            const tenantRef = doc(db, 'tenants', tenantId);
            batch.set(tenantRef, {
                id: tenantId,
                name: 'Mujer | Estilismo y Belleza',
                slug: 'demo-salon',
                createdAt: Timestamp.now(),
                settings: { currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' }
            });

            // 2. Services
            SERVICES.forEach(service => {
                const ref = doc(db, `tenants/${tenantId}/services`, service.id);
                batch.set(ref, {
                    ...service,
                    categoryId: 'hair',
                    active: true,
                    variablePrice: service.variablePrice || false // Ensure defaults
                });
            });

            // 3. Promotions
            PROMOS.forEach(promo => {
                const ref = doc(db, `tenants/${tenantId}/promotions`, promo.id);
                batch.set(ref, { ...promo, active: true });
            });

            // 4. Staff
            STAFF.forEach(staff => {
                const ref = doc(db, `tenants/${tenantId}/staff`, staff.id);
                batch.set(ref, {
                    ...staff,
                    assignedBranchIds: ['sucursal-centro'],
                    active: true
                })
            });

            // 5. Branches
            BRANCHES.forEach(branch => {
                const ref = doc(db, `tenants/${tenantId}/branches`, branch.id);
                batch.set(ref, branch);
            })

            await batch.commit();
            setResult({ success: true, message: `Se migraron ${SERVICES.length} servicios, ${PROMOS.length} promos, ${STAFF.length} staff y ${BRANCHES.length} sucursales al tenant '${tenantId}'.` });

        } catch (error: any) {
            console.error(error);
            setResult({ success: false, message: error.message || 'Error desconocido al ejecutar seed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMigrateTurnos = async () => {
        setLoading(true);
        setResult(null);
        try {
            const tenantId = 'demo-salon';
            const snapshot = await getDocs(collection(db, 'turnos'));
            const batch = writeBatch(db);
            let count = 0;

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const newRef = doc(db, `tenants/${tenantId}/appointments`, docSnap.id);

                // Map legacy data to new schema
                let date = Timestamp.now();
                if (data.fecha) {
                    // Try to parse fecha
                    if (typeof data.fecha === 'string') {
                        date = Timestamp.fromDate(new Date(data.fecha));
                    } else if (data.fecha instanceof Timestamp) {
                        date = data.fecha;
                    }
                }

                let status = 'pending';
                if (data.estado === 'realizado') status = 'completed';
                else if (data.estado === 'cancelado') status = 'cancelled';
                else if (data.estado === 'pendiente_pago') status = 'pending_payment';

                batch.set(newRef, {
                    date: date,
                    clientId: data.clienteId || 'unknown',
                    clientName: data.clienteNombre || 'Sin Nombre',
                    staffId: data.empleadaAsignadaId || 'unknown',
                    staffName: data.empleadaNombre || 'Sin Asignar',
                    serviceNames: data.servicio || '',
                    status: status,
                    priceEstimated: data.precio || 0,
                    durationMinutes: data.duracion || 30,
                    createdAt: data.created_at || Timestamp.now(),
                    migratedFrom: 'turnos_legacy'
                });
                count++;
            });

            await batch.commit();
            setResult({ success: true, message: `Se migraron ${count} turnos a 'tenants/${tenantId}/appointments'.` });

        } catch (error: any) {
            console.error(error);
            setResult({ success: false, message: error.message || 'Error al migrar turnos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMigrateClientes = async () => {
        setLoading(true);
        setResult(null);
        try {
            const tenantId = 'demo-salon';
            const snapshot = await getDocs(collection(db, 'clientes'));
            const batch = writeBatch(db);
            let count = 0;

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const newRef = doc(db, `tenants/${tenantId}/customers`, docSnap.id);

                batch.set(newRef, {
                    firstName: data.nombre || '',
                    lastName: data.apellido || '',
                    email: data.email || '',
                    phone: data.telefono || '',
                    notes: data.observaciones || '',
                    createdAt: data.fechaRegistro || Timestamp.now(),
                    lastVisit: data.ultimaVisita || null,
                    migratedFrom: 'clientes_legacy',
                    userId: docSnap.id // Assuming ID matches Auth UID for some, or just keeping the ref
                });
                count++;
            });

            await batch.commit();
            setResult({ success: true, message: `Se migraron ${count} clientes a 'tenants/${tenantId}/customers'.` });

        } catch (error: any) {
            console.error(error);
            setResult({ success: false, message: error.message || 'Error al migrar clientes.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async () => {
        setLoading(true);
        setResult(null);
        if (!user) return;

        try {
            const tenantId = 'demo-salon';
            const batch = writeBatch(db);

            // 1. Assign Admin membership
            const membershipRef = doc(db, `users/${user.uid}/memberships/${tenantId}`);
            batch.set(membershipRef, {
                role: 'admin',
                tenantId: tenantId,
                tenantName: 'Mujer | Estilismo y Belleza'
            });

            await batch.commit();
            setResult({ success: true, message: `Se asignó el rol ADMIN al usuario actual (${user.email}) para el tenant '${tenantId}'.` });

        } catch (error: any) {
            console.error(error);
            setResult({ success: false, message: error.message || 'Error al asignar rol.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Migración de Datos (Seed)</CardTitle>
                    <CardDescription>
                        Esta herramienta poblará la base de datos Firestore con los datos hardcodeados actuales.
                        <br /> <span className="font-bold text-yellow-600">Tenant Target: demo-salon</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-md text-sm">
                        <h4 className="font-semibold mb-2">Datos a migrar:</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            <li>{SERVICES.length} Servicios (Corte, Color, etc.)</li>
                            <li>{PROMOS.length} Promociones (Tradicional, Premium...)</li>
                            <li>{STAFF.length} Profesionales</li>
                            <li>1 Sucursal "Centro"</li>
                        </ul>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-md flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {result.success ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
                            <div>
                                <p className="font-semibold">{result.success ? 'Éxito' : 'Error'}</p>
                                <p className="text-sm">{result.message}</p>
                            </div>
                        </div>
                    )}

                    <Button onClick={handleSeed} disabled={loading} className="w-full mb-4">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : '1. Migrar Catálogo (Servicios/Staff)'}
                    </Button>

                    <Button onClick={handleMigrateTurnos} disabled={loading} variant="secondary" className="w-full mb-4">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : '2. Migrar Turnos (Historial)'}
                    </Button>

                    <Button onClick={handleMigrateClientes} disabled={loading} variant="outline" className="w-full mb-4">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : '3. Migrar Clientes'}
                    </Button>

                    <Button onClick={handleMakeAdmin} disabled={loading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : '4. Hacerme Admin (Setup)'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
