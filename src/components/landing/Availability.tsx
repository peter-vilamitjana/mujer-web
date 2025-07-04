import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const weeklyAvailability = [
  { day: 'Lunes', slots: ['09:00', '11:00', '14:00', '16:00', '18:00'] },
  { day: 'Martes', slots: ['10:00', '12:00', '15:00', '17:00'] },
  { day: 'Miércoles', slots: ['09:00', '11:00', '14:00', '16:00', '18:00'] },
  { day: 'Jueves', slots: ['10:00', '12:00', '15:00', '17:00'] },
  { day: 'Viernes', slots: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'] },
  { day: 'Sábado', slots: ['09:00', '11:00', '13:00'] },
];

export default function Availability() {
  return (
    <section id="horarios" className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Nuestros Horarios</h2>
          <p className="mt-4 text-lg text-muted-foreground">Encuentra un momento para ti. Estos son nuestros horarios de atención.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyAvailability.map((dayInfo) => (
            <Card key={dayInfo.day} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-center text-primary">{dayInfo.day}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-col items-center space-y-3">
                  {dayInfo.slots.map(slot => (
                     <Badge key={slot} variant="secondary" className="text-base font-mono py-1 px-4 w-32 justify-center bg-accent/50 text-accent-foreground">
                      {slot} hs
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
