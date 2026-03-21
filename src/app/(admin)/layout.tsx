import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { UserProvider } from '@/contexts/UserContext';
import { UIProvider } from '@/contexts/UIContext';

// Este layout solo se renderiza si el middleware ya validó la sesión.
// No necesita verificar auth — el middleware lo garantiza.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <UIProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Sidebar />
          <div className="flex flex-col md:pl-64 transition-all duration-300">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </UIProvider>
    </UserProvider>
  );
}
