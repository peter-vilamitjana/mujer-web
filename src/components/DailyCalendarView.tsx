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

const professionals = [
  { id: 'carolina_spranda', name: 'Carolina Spranda' },
  { id: 'laura_bortolazo', name: 'Laura Bortolazo' },
  { id: 'fabiana_estilista', name: 'Fabiana' },
];

const timeSlots = Array.from({ length: (19 - 9) * 4 }, (_, i) => {
    const totalMinutes = 9 * 60 + i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

interface DailyCalendarViewProps {
  turnos: Turno[];
}

export default function DailyCalendarView({ turnos }: DailyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const user = useUser();
  const userRole = user?.rol;

  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getTurnosForDay = (day: Date, professionalId: string) => {
    return turnos.filter(turno => 
        isSameDay(parseISO(turno.fecha), day) && 
        turno.empleadaAsignadaId === professionalId
    );
  };
  
  const getTurnoForSlot = (professionalId: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = setMinutes(setHours(startOfDay(currentDate), hours), minutes);

    return turnos.find(turno => {
        const turnoStartTime = parseISO(turno.fecha);
        if (turno.empleadaAsignadaId !== professionalId || !isSameDay(turnoStartTime, currentDate)) {
            return false;
        }
        
        const turnoEndTime = new Date(turnoStartTime.getTime() + (turno.duracion || 30) * 60000);
        
        return turnoStartTime.getHours() === hours && turnoStartTime.getMinutes() === minutes;
    });
  };

  return (
    <>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-48 text-center capitalize">
            {format(currentDate, "eeee, d 'de' MMMM", { locale: es })}
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
      <CardContent className="h-auto md:h-[500px]">
        <ScrollArea className="w-full h-full">
         <div className="flex w-fit md:w-full">
            <div className="sticky left-0 bg-background z-10">
                <div className="h-10 border-b flex items-center justify-center font-semibold text-sm">Hora</div>
                {timeSlots.map(time => (
                    <div key={time} className="h-10 border-b flex items-center justify-center text-xs text-muted-foreground px-2">
                        {time}
                    </div>
                ))}
            </div>

            <div className="grid flex-1" style={{gridTemplateColumns: `repeat(${professionals.length}, minmax(150px, 1fr))`}}>
                {professionals.map(prof => (
                    <div key={prof.id} className="border-l">
                        <div className="h-10 border-b flex items-center justify-center font-semibold text-sm text-center p-2">{prof.name}</div>
                        <div className="relative">
                             {timeSlots.map(time => (
                                <div key={`${prof.id}-${time}`} className="h-10 border-b"/>
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
                                      className="absolute w-full p-1"
                                      style={{ top: `${topPosition}px`, height: `${height}px` }}
                                    >
                                        <div className={cn(
                                            "h-full w-full p-1.5 rounded-md text-xs border-l-4 cursor-pointer hover:bg-primary/20 transition-colors flex flex-col justify-center",
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
             </div>
           </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
