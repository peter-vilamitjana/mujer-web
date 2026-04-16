'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link href={href} className={cn("flex items-center", className)}>
      <Image
        src="/logo.png?v=4"
        alt="Ouleeh"
        width={40}
        height={40}
        className="rounded-full object-cover"
        priority
        unoptimized
      />
      <span className="ml-3 font-serif text-2xl font-bold text-[#9D6EFE] tracking-tight transition-colors">
        OULEEH
      </span>
    </Link>
  );
};

export default Logo;
