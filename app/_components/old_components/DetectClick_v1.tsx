'use client';
import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';

export default function DetectClick() {
  const router = useRouter();

  useMapEvents({
    click: (e) => {
      router.push(`/parklist/form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}
