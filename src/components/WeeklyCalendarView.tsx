'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Turno } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import NewAppointmentDialog from './NewAppointmentDialog';

interface WeeklyCalendarViewProps {
  turnos: Turno[];
}

export default function WeeklyCalendarView({ turnos }: WeeklyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const user = useUser();
  const userRole = user?.rol;

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const goToPreviousWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const turnosByDay = (day: Date) => {
    return turnos
      .filter(turno => isSameDay(parseISO(turno.fecha), day))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Agenda Semanal</CardTitle>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-36 text-center capitalize">
            {format(start, "d MMM", { locale: es })} - {format(end, "d MMM, yyyy", { locale: es })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {(userRole === 'admin' || userRole === 'clienta') && (
            <NewAppointmentDialog />
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[500px] flex flex-col">
        <div className="grid grid-cols-7 flex-grow gap-1">
          {weekDays.map(day => (
            <div key={day.toString()} className="flex flex-col rounded-lg border bg-card">
              <div className={cn(
                "text-center py-2 border-b rounded-t-lg transition-colors",
                isToday(day) ? "bg-primary text-primary-foreground font-bold" : "bg-muted/50"
              )}>
                <p className="font-semibold text-sm capitalize">{format(day, 'eee', { locale: es })}</p>
                <p className={cn("text-lg", isToday(day) && 'font-bold')}>{format(day, 'd', { locale: es })}</p>
              </div>
              <ScrollArea className="flex-grow">
                <div className="space-y-1 p-1">
                  {turnosByDay(day).length > 0 ? (
                    turnosByDay(day).map(turno => (
                      <Link href={`/clientes/${turno.clienteId}`} key={turno.id} title={`${turno.clienteNombre} - ${turno.servicio}`}>
                        <div 
                            className={cn(
                                "p-1.5 rounded-md text-xs border-l-4 cursor-pointer hover:bg-accent/50 transition-colors",
                                new Date(turno.fecha) < new Date() && turno.estado === 'realizado'
                                ? "bg-muted/50 border-slate-300 opacity-70" 
                                : "bg-primary/10 border-primary"
                            )}>
                            <p className="font-bold">{format(parseISO(turno.fecha), 'HH:mm')}</p>
                            <p className="font-semibold truncate">{turno.clienteNombre}</p>
                             <p className="text-muted-foreground truncate">{turno.servicio}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div />
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
