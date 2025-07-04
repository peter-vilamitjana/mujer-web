import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-muted-foreground text-sm">Estilismo y belleza para realzar tu esencia. © {new Date().getFullYear()} Mujer. Todos los derechos reservados.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> Av. Siempre Viva 123, Springfield</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 text-primary" /> (011) 1234-5678</li>
              <li className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 text-primary" /> contacto@mujer.com</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Navegación</h3>
             <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="#promotions" className="text-muted-foreground hover:text-primary transition-colors">Promociones</Link></li>
                <li><Link href="#horarios" className="text-muted-foreground hover:text-primary transition-colors">Horarios</Link></li>
                <li><Link href="#testimonios" className="text-muted-foreground hover:text-primary transition-colors">Testimonios</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Mi Cuenta</Link></li>
             </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Síguenos</h3>
            <div className="flex mt-4 space-x-4">
              <Link href="#" aria-label="Instagram">
                <Button variant="outline" size="icon"><Instagram className="h-5 w-5"/></Button>
              </Link>
              <Link href="#" aria-label="Facebook">
                <Button variant="outline" size="icon"><Facebook className="h-5 w-5"/></Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
