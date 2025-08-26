'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Turno } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyCalendarViewProps {
  turnos: Turno[];
  currentDate: Date;
}

export default function WeeklyCalendarView({ turnos, currentDate }: WeeklyCalendarViewProps) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const turnosByDay = (day: Date) => {
    return turnos
      .filter(turno => isSameDay(parseISO(turno.fecha), day))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  };

  return (
    <CardContent className="h-[500px] flex flex-col p-0 md:p-6">
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
  );
}

    