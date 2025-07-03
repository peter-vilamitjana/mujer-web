import Link from 'next/link';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/">
      <div className={cn("text-2xl font-bold text-primary tracking-tighter cursor-pointer", className)}>
        Mujer
      </div>
    </Link>
  );
};

export default Logo;