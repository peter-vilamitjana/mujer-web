'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Turno } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

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
  
  const goToToday = () => {
    setCurrentDate(new Date());
  }

  const turnosByDay = (day: Date) => {
    return turnos
      .filter(turno => isSameDay(parseISO(turno.fecha), day))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  };

  return (
    <>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
         <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
           <span className="text-sm font-medium w-36 text-center capitalize">
            {format(start, "d MMM", { locale: es })} - {format(end, "d MMM, yyyy", { locale: es })}
          </span>
        </div>
        {(userRole === 'admin' || userRole === 'clienta') && (
          <Link href="/turnos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Turno
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="h-auto md:h-[500px] flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 flex-grow gap-1">
          {weekDays.map(day => (
            <div key={day.toString()} className="flex flex-col rounded-lg border bg-card min-h-[150px]">
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
    </>
  );
}
