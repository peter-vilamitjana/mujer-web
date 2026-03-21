import { Card, CardContent } from '@/components/ui/card';
import type { Staff } from '@/lib/schema';
import { User2 } from 'lucide-react';
import Image from 'next/image';

export default function PublicStaffCard({ member }: { member: Staff }) {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors text-center h-full">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center border-2 border-primary/10">
          {member.avatarUrl ? (
            <Image src={member.avatarUrl} alt={member.name} fill className="object-cover object-top" />
          ) : (
            <User2 className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-foreground line-clamp-1">{member.name}</h4>
          <p className="text-sm text-muted-foreground capitalize line-clamp-1">{member.role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
