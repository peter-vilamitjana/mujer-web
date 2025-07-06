import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link href={href} className={cn("flex items-center group", className)}>
      <Image
        src="https://instagram.faep14-2.fna.fbcdn.net/v/t51.2885-19/334717644_222300560169435_1515275533066349174_n.jpg?_nc_ht=instagram.faep14-2.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QGbEnNCeZeVsvJLCF1Snod_fCzWDzhWAb_3pDrhFZg3in_t8zauuG_d7sWAVRv5osA&_nc_ohc=_wy069Nj3MsQ7kNvwESYCmC&_nc_gid=k-lYrvKwIId3LHFv5JX_kQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfOZkJ9C7uMGYqKthL-wQBRs0PSnMVyjq0BSN6b6CqM_Xg&oe=686DD265&_nc_sid=7a9f4b"
        alt="Mujer Logo"
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
