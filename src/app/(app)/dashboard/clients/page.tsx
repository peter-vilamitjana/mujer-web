'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";

export default function ClientsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de datos de clientes.</p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Clientes</CardTitle>
                    <CardDescription>Busca y administra a tus clientas frecuentes.</CardDescription>
                    <div className="pt-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar por nombre, teléfono o email..."
                                className="pl-8 sm:w-[300px]"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Aún no tienes clientes registrados.</p>
                        <Button variant="link" className="mt-2">Agregar el primero</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
