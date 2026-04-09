'use client';

import { useEffect, useRef } from 'react';
import { Map } from 'lucide-react';

interface SalonMapProps {
  salons: Array<{
    name: string;
    slug: string;
    lat?: number;
    lng?: number;
    address: string;
  }>;
  onSalonSelect?: (slug: string) => void;
}

// Dark zinc map styles for Google Maps (type kept as object literal to avoid global google namespace)
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#09090b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#09090b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#18181b' }] },
] as const;

// Buenos Aires default center
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };
const DEFAULT_ZOOM = 12;

function MapFallback() {
  return (
    <div className="w-full h-full rounded-2xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] rounded-2xl" />
      <Map className="h-14 w-14 text-zinc-700 mb-5 relative z-10" />
      <h3 className="text-white font-inter font-medium relative z-10 text-lg">
        Mapa disponible próximamente
      </h3>
      <p className="text-zinc-500 text-sm text-center mt-2 relative z-10">
        Configurá{' '}
        <code className="text-zinc-400 bg-zinc-800 px-1 rounded text-xs">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </code>{' '}
        para activar el mapa.
      </p>
    </div>
  );
}

export function SalonMap({ salons, onSalonSelect }: SalonMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    let isMounted = true;

    async function initMap() {
      const { Loader } = await import('@googlemaps/js-api-loader');

      const loader = new Loader({
        apiKey: apiKey as string,
        version: 'weekly',
      });

      await loader.load();

      if (!isMounted || !mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (!g?.maps) return;

      const map = new g.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // TODO: add lat/lng to Tenant schema when geocoding is implemented
      const salonsWithCoords = salons.filter(
        (s): s is typeof s & { lat: number; lng: number } =>
          typeof s.lat === 'number' && typeof s.lng === 'number'
      );

      for (const salon of salonsWithCoords) {
        const marker = new g.maps.Marker({
          position: { lat: salon.lat, lng: salon.lng },
          map,
          title: salon.name,
        });

        if (onSalonSelect) {
          marker.addListener('click', () => {
            onSalonSelect(salon.slug);
          });
        }
      }
    }

    initMap().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [apiKey, salons, onSalonSelect]);

  if (!apiKey) {
    return <MapFallback />;
  }

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
}
