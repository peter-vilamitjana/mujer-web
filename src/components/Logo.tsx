import Link from 'next/link';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/dashboard">
      <div className={cn("font-serif text-3xl font-bold text-primary tracking-tight cursor-pointer", className)}>
        Mujer
      </div>
    </Link>
  );
};

export default Logo;
