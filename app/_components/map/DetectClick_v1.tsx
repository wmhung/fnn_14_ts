'use client';

import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type DetectClickProps = {
  onMapClick?: () => void; // 🔥 optional callback from parent
};

export default function DetectClick({ onMapClick }: DetectClickProps) {
  const router = useRouter();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      // Enter "manual mode" → clear AI state
      onMapClick?.();

      // Update URL (form sync)
      router.push(`/parklist/form?lat=${lat}&lng=${lng}`);

      // Move map
      e.target.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      } as L.ZoomPanOptions);
    },
  });

  return null; // 👈 required for react-leaflet hooks
}
