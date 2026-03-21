'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, Timestamp, getDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MigrationPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const targetTenantId = 'demo-salon'; // Hardcoded target for migration

    const log = (msg: string) => setStatus(prev => prev + '\n' + msg);

    // 1. MIGRATE USERS (Legacy 'usuarios' -> 'users' + Membership)
    const migrateUsers = async () => {
        setLoading(true);
        setStatus('Starting User Migration...');
        setError('');

        try {
            const legacyRef = collection(db, 'usuarios');
            const legacySnap = await getDocs(legacyRef);

            if (legacySnap.empty) {
                log('No legacy users found.');
                setLoading(false);
                return;
            }

            log(`Found ${legacySnap.size} legacy users.`);
            const batch = writeBatch(db);
            let count = 0;

            for (const docSnap of legacySnap.docs) {
                const data = docSnap.data();
                const uid = docSnap.id;

                // 1. Create/Update User Profile
                const userRef = doc(db, 'users', uid);
                batch.set(userRef, {
                    id: uid,
                    displayName: data.nombre || 'Usuario',
                    email: data.email || null,
                    photoURL: data.photoURL || null,
                    migratedAt: new Date(),
                    phone: data.telefono || null
                }, { merge: true });

                // 2. Create Membership
                // Map legacy 'rol' to new roles. Legacy 'clienta' -> 'clienta', 'admin' -> 'admin'
                const role = data.rol || 'clienta';
                const memberRef = doc(db, 'users', uid, 'memberships', targetTenantId);
                batch.set(memberRef, {
                    role: role,
                    tenantId: targetTenantId,
                    migratedAt: new Date()
                }, { merge: true });

                count++;
            }

            await batch.commit();
            log(`Successfully migrated ${count} users and memberships.`);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. MIGRATE CUSTOMERS (Legacy 'clientes' -> 'tenants/.../customers')
    const migrateCustomers = async () => {
        setLoading(true);
        setStatus('Starting Customer Migration...');

        try {
            const legacyRef = collection(db, 'clientes');
            const legacySnap = await getDocs(legacyRef);

            if (legacySnap.empty) {
                log('No legacy clients found.');
                setLoading(false);
                return;
            }

            log(`Found ${legacySnap.size} legacy clients.`);
            const batch = writeBatch(db);
            let count = 0;

            for (const docSnap of legacySnap.docs) {
                const data = docSnap.data();

                const newCustomer = {
                    firstName: data.nombre || '',
                    lastName: data.apellido || '',
                    email: data.email || '',
                    phone: data.telefono || '',
                    notes: data.observaciones || '',
                    createdAt: data.fechaRegistro || Timestamp.now(),
                    migratedAt: new Date(),
                    originalId: docSnap.id
                };

                const newRef = doc(db, 'tenants', targetTenantId, 'customers', docSnap.id);
                batch.set(newRef, newCustomer, { merge: true });
                count++;
            }

            await batch.commit();
            log(`Successfully migrated ${count} customers.`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. MIGRATE SERVICES (Legacy 'servicios' -> 'tenants/.../services')
    const migrateServices = async () => {
        setLoading(true);
        setStatus('Starting Services Migration...');

        try {
            const legacyRef = collection(db, 'servicios');
            const legacySnap = await getDocs(legacyRef);

            if (legacySnap.empty) {
                log('No legacy services found.');
                setLoading(false);
                return;
            }

            log(`Found ${legacySnap.size} legacy services.`);
            const batch = writeBatch(db);
            let count = 0;

            for (const docSnap of legacySnap.docs) {
                const data = docSnap.data();

                const newService = {
                    ...data,
                    migratedAt: new Date(),
                    active: true
                };

                const newRef = doc(db, 'tenants', targetTenantId, 'services', docSnap.id);
                batch.set(newRef, newService, { merge: true });
                count++;
            }

            await batch.commit();
            log(`Successfully migrated ${count} services.`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. MIGRATE APPOINTMENTS (Legacy 'turnos' -> 'tenants/.../appointments')
    const migrateAppointments = async () => {
        setLoading(true);
        setStatus('Starting Appointments Migration...');

        try {
            const legacyRef = collection(db, 'turnos');
            const legacySnap = await getDocs(legacyRef);

            if (legacySnap.empty) {
                log('No legacy appointments found.');
                setLoading(false);
                return;
            }

            log(`Found ${legacySnap.size} legacy appointments.`);
            const batch = writeBatch(db);
            let count = 0;

            for (const docSnap of legacySnap.docs) {
                const data = docSnap.data();

                // Map Status
                let status = 'pending';
                if (data.estado === 'realizado') status = 'completed';
                if (data.estado === 'cancelado') status = 'cancelled';
                if (data.estado === 'pendiente_pago') status = 'pending_payment';

                let dateValue = new Date();
                if (data.fecha) {
                    if (data.fecha instanceof Timestamp) dateValue = data.fecha.toDate();
                    else if (typeof data.fecha === 'string') dateValue = new Date(data.fecha);
                }

                const newAppt = {
                    id: docSnap.id,
                    tenantId: targetTenantId,
                    clientId: data.clienteId || '',
                    clientName: data.clienteNombre || 'Cliente Migrado',
                    staffId: data.empleadaAsignadaId || '',
                    staffName: data.empleadaNombre || '',
                    serviceNames: data.servicio || '',
                    date: Timestamp.fromDate(dateValue),
                    status: status,
                    priceEstimated: data.precio || 0,
                    durationMinutes: data.duracion || 30,
                    migratedAt: new Date(),
                    source: 'migration_tool'
                };

                const newRef = doc(db, 'tenants', targetTenantId, 'appointments', docSnap.id);
                batch.set(newRef, newAppt, { merge: true });
                count++;
            }

            await batch.commit();
            log(`Successfully migrated ${count} appointments.`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. MIGRATE SALON INFO (Legacy 'salons' -> 'tenants')
    const migrateTenantInfo = async () => {
        setLoading(true);
        setStatus('Starting Tenant Info Migration...');

        try {
            // Find valid salon doc. We assume there might be one related to this tenant or just pick one.
            const legacyRef = collection(db, 'salons');
            const legacySnap = await getDocs(legacyRef);

            if (legacySnap.empty) {
                log('No legacy salons found.');
                setLoading(false);
                return;
            }

            // For this specific migration, we act somewhat blindly, taking the first salon doc found
            // or we could match by ID if we knew it. 
            // We'll migrate ALL found salons as tenants? No, we transform into OUR target tenant.
            // We will prioritize the one that matches our target if possible, or just the first one.
            const data = legacySnap.docs[0].data();

            log(`Found legacy salon: ${data.name}. Migrating to tenant ${targetTenantId}...`);

            const batch = writeBatch(db);
            const tenantRef = doc(db, 'tenants', targetTenantId);

            // [HARDENING] Sanitize payload to remove undefined values
            const sanitize = (obj: any) => {
                return Object.entries(obj)
                    .filter(([_, v]) => v !== undefined)
                    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
            };

            const payload = sanitize({
                name: data.name || 'Sin Nombre',
                address: data.address || null, // Explicit null if missing
                phone: data.phone || null,
                slug: data.slug || targetTenantId,
                migratedAt: new Date(),
                // Preserve settings if they exist, or set defaults
                settings: { currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' }
            });

            log(`Payload preview: ${JSON.stringify(payload, null, 2)}`);

            batch.set(tenantRef, payload, { merge: true });

            await batch.commit();
            log(`Successfully migrated tenant info.`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Migration Command Center</h1>
                    <p className="text-muted-foreground">Legacy Root to Multi-Tenant SaaS (Target: <code>{targetTenantId}</code>)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">1. Users & Auth</CardTitle>
                        <CardDescription>Usuarios (Root) to Users + Memberships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={migrateUsers} disabled={loading} className="w-full">
                            <PlayCircle className="mr-2 h-4 w-4" /> Run Users Migration
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">2. Customers</CardTitle>
                        <CardDescription>Clientes (Root) to Tenants/Customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={migrateCustomers} disabled={loading} className="w-full" variant="secondary">
                            <PlayCircle className="mr-2 h-4 w-4" /> Run Customers Migration
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">3. Services</CardTitle>
                        <CardDescription>Servicios (Root) to Tenants/Services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={migrateServices} disabled={loading} className="w-full" variant="outline">
                            <PlayCircle className="mr-2 h-4 w-4" /> Run Services Migration
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">4. Appointments</CardTitle>
                        <CardDescription>Turnos (Root) to Tenants/Appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={migrateAppointments} disabled={loading} className="w-full" variant="secondary">
                            <PlayCircle className="mr-2 h-4 w-4" /> Run Appointments Migration
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">5. Business Profile</CardTitle>
                        <CardDescription>Salons (Root) to Tenants Info</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={migrateTenantInfo} disabled={loading} className="w-full" variant="default">
                            <PlayCircle className="mr-2 h-4 w-4" /> Run Tenant Info Migration
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-950 text-slate-50 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} /> Execution Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-green-400 min-h-[100px]">
                        {status || 'Waiting to start...'}
                    </pre>
                    {error && (
                        <div className="mt-4 p-4 bg-red-900/20 text-red-400 rounded border border-red-900/50 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
