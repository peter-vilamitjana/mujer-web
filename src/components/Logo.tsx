'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link href={href} className={cn("flex items-center group", className)}>
      <Image
        src="https://placehold.co/40x40.png"
        alt="Mujer Logo"
        data-ai-hint="logo"
        width={40}
        height={40}
        className="rounded-full"
        priority
      />
      <span className="ml-3 font-serif text-2xl font-bold text-primary tracking-tight transition-colors">
        Mujer
      </span>
    </Link>
  );
};

export default Logo;
