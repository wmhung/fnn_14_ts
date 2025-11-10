'use client';
import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';

export default function DetectClick() {
  const router = useRouter();

  const map = useMapEvents({
    click: (e) => {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];

      // 1. Update URL
      router.push(`/parklist/form?lat=${coords[0]}&lng=${coords[1]}`);

      // 2. Recenter map
      map.flyTo(coords, 15, {
        animate: true,
        duration: 1.5,
      });
    },
  });

  return null; // must return something (null is fine)
}
