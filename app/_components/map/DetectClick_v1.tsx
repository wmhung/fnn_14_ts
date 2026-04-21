'use client';
import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export default function DetectClick() {
  const router = useRouter();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      // 🔹 Update the URL
      router.push(`/parklist/form?lat=${lat}&lng=${lng}`);

      // 🔹 Recenter the map directly
      e.target.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      } as L.ZoomPanOptions);
    },
  });

  return null; // 👈 important for react-leaflet hooks
}
