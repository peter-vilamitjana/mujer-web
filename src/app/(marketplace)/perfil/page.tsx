import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import {
  getMyUpcomingAppointments,
  getMyHairProfile,
  getMyPreferences,
  getMyFavorites,
} from '@/actions/profile.actions';
import PerfilClient from './PerfilClient';

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [appointments, hairProfile, preferences, favorites] = await Promise.all([
    getMyUpcomingAppointments(),
    getMyHairProfile(),
    getMyPreferences(),
    getMyFavorites(),
  ]);

  return (
    <PerfilClient
      initialAppointments={appointments}
      initialHairProfile={hairProfile}
      initialPreferences={preferences}
      initialFavorites={favorites}
      initialPhone={(session.user as any)?.phone ?? undefined}
    />
  );
}
