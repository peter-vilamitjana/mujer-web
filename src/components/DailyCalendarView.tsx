'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Turno } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, parseISO, isSameDay, addDays, subDays, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Staff } from '@/lib/schema';

const timeSlots = Array.from({ length: (19 - 9) * 4 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

interface DailyCalendarViewProps {
  turnos: Turno[];
  currentDate: Date;
  staff: Staff[];
}

export default function DailyCalendarView({ turnos, currentDate, staff }: DailyCalendarViewProps) {

  const getTurnosForDay = (day: Date, professionalId: string) => {
    return turnos.filter(turno =>
      isSameDay(parseISO(turno.fecha), day) &&
      turno.empleadaAsignadaId === professionalId
    );
  };

  // Use passed staff or fallback if empty (prevent empty grid while loading) 
  const displayStaff = Array.isArray(staff) && staff.length > 0 ? staff : [];

  return (
    <CardContent className="h-[500px] p-0 md:p-6">
      <ScrollArea className="w-full h-full">
        <div className="flex w-full min-w-max">
          <div className="sticky left-0 bg-background z-10 border-r">
            <div className="h-10 border-b flex items-center justify-center font-semibold text-sm bg-muted/20">Hora</div>
            {timeSlots.map(time => (
              <div key={time} className="h-10 border-b flex items-center justify-center text-xs text-muted-foreground px-2 bg-background">
                {time}
              </div>
            ))}
          </div>

          <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, displayStaff.length)}, minmax(150px, 1fr))` }}>
            {displayStaff.map(prof => (
              <div key={prof.id} className="border-r last:border-r-0">
                <div className="h-10 border-b flex items-center justify-center font-semibold text-sm text-center p-2 bg-muted/20 sticky top-0 z-10 truncate px-4" title={prof.name}>{prof.name}</div>
                <div className="relative">
                  {timeSlots.map(time => (
                    <div key={`${prof.id}-${time}`} className="h-10 border-b border-dashed" />
                  ))}
                  {getTurnosForDay(currentDate, prof.id).map(turno => {
                    const turnoStartTime = parseISO(turno.fecha);
                    const startHour = turnoStartTime.getHours();
                    const startMinute = turnoStartTime.getMinutes();

                    const topPosition = ((startHour - 9) * 4 + (startMinute / 15)) * 40;
                    const height = (turno.duracion / 15) * 40;

                    return (
                      <Link
                        href={`/clientes/${turno.clienteId}`}
                        key={turno.id}
                        className="absolute w-full p-1 z-10"
                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                      >
                        <div className={cn(
                          "h-full w-full p-1.5 rounded-md text-xs border-l-4 cursor-pointer hover:bg-primary/20 transition-colors flex flex-col justify-center overflow-hidden shadow-sm",
                          "bg-primary/10 border-primary"
                        )}>
                          <p className="font-bold">{format(turnoStartTime, 'HH:mm')}</p>
                          <p className="font-semibold truncate">{turno.clienteNombre}</p>
                          <p className="text-muted-foreground truncate">{turno.servicio}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {displayStaff.length === 0 && (
              <div className="col-span-full h-full flex items-center justify-center text-muted-foreground p-8">
                No hay profesionales activos o no se cargaron.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </CardContent>
  );
}

