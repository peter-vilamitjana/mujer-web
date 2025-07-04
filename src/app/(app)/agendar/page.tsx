'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, CreditCard, User, Tag } from 'lucide-react';
import Link from 'next/link';

function AgendarContent() {
    const searchParams = useSearchParams();
    const servicioId = searchParams.get('servicio');

    // In a real app, you would fetch service details based on the ID
    const serviceDetails = {
        id: servicioId,
        nombre: 'Corte y Color (Ejemplo)',
        precio: 15000,
        montoSeña: 3000,
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
    }

    return (
        <div className="space-y-6">
             <Link href="/servicios" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Volver a Servicios
             </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agendar Turno</h1>
              <p className="text-muted-foreground">
                Estás a punto de reservar tu lugar.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Resumen de tu Turno</CardTitle>
                    <CardDescription>Por favor, revisa los detalles y confirma para continuar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                        <p className="flex items-center gap-2 font-semibold text-lg"><Tag className="h-5 w-5 text-primary"/> {serviceDetails.nombre}</p>
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Peluquera: <span className="font-medium">Ana (Ejemplo)</span></p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> Fecha y Hora: <span className="font-medium">A seleccionar</span></p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Detalle de Pago</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Precio del servicio:</span>
                            <span className="font-medium">{formatPrice(serviceDetails.precio)}</span>
                        </div>
                        <div className="flex justify-between items-center text-primary font-bold text-lg mt-2">
                            <span>Seña requerida para reservar:</span>
                            <span>{formatPrice(serviceDetails.montoSeña)}</span>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">La seña se descontará del total al momento de tu visita.</p>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button className="w-full" size="lg">
                        <CreditCard className="mr-2 h-5 w-5"/>
                        Pagar Seña y Confirmar Turno
                    </Button>
                </CardFooter>
            </Card>

            <div className="text-center text-muted-foreground text-sm max-w-md mx-auto">
                <p>En el próximo paso, integraríamos un calendario para seleccionar la fecha y hora, y luego la pasarela de pago para la seña.</p>
            </div>
        </div>
    );
}


export default function AgendarPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AgendarContent />
        </Suspense>
    )
}
