'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, Calendar, Clock, CheckCircle, Ban } from 'lucide-react';
import { searchAppointmentsByPhone } from '@/actions/customer.actions';
import type { DashboardAppointment } from '@/lib/services/customer.service';
import type { AppointmentStatus } from '@/lib/schema';

function getStatusInfo(status: AppointmentStatus) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return {
        text: 'Pendiente',
        icon: Clock,
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
    case 'pending_payment':
      return {
        text: 'Pendiente de Seña',
        icon: Clock,
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      };
    case 'completed':
    case 'cobrado':
      return {
        text: 'Realizado',
        icon: CheckCircle,
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
      };
    case 'cancelled':
    case 'no_show':
      return {
        text: 'Cancelado',
        icon: Ban,
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
      };
    default:
      return {
        text: 'Desconocido',
        icon: Clock,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
  }
}

interface PhoneSearchViewProps {
  tenantSlug: string;
}

export function PhoneSearchView({ tenantSlug }: PhoneSearchViewProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DashboardAppointment[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const appointments = await searchAppointmentsByPhone(tenantSlug, phone.trim());
      setResults(appointments);
    } catch (err) {
      console.error('[PhoneSearchView] Error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Tus Turnos</h1>
        <p className="text-muted-foreground mt-1 text-base">
          Ingresá tu número de teléfono para ver tus turnos.
        </p>
      </div>

      <Card className="bg-card border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Buscar por teléfono
          </CardTitle>
          <CardDescription>
            Ingresá el número con el que te registraste en el salón.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="phone" className="sr-only">
                Número de teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ej: +54 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !phone.trim()}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results !== null && (
        <Card className="bg-card border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No encontramos turnos con ese número.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((appt) => {
                  const statusInfo = getStatusInfo(appt.status);
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/40 dark:bg-muted/10 border dark:border-border/50"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{appt.date}</p>
                        <p className="text-sm text-muted-foreground">{appt.serviceName}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`gap-2 text-xs font-bold ${statusInfo.className}`}
                      >
                        <statusInfo.icon className="h-3.5 w-3.5" />
                        <span>{statusInfo.text}</span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
