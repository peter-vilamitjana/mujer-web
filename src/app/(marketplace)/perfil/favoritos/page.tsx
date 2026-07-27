import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getMyFavorites } from '@/actions/profile.actions';
import FavoritosClient from './FavoritosClient';

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const favorites = await getMyFavorites();
  return <FavoritosClient initialFavorites={favorites} />;
}
