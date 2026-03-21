import { getPublicSalons } from '@/lib/services/marketplace.service';
import ExploreClient from './ExploreClient';

export default async function ExplorePage() {
  const salons = await getPublicSalons();
  return <ExploreClient salons={salons} />;
}
