'use client';

import { useRouter } from 'next/navigation';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type DetectClickProps = {
  enterManualMode: () => void;
};

export default function DetectClick({ enterManualMode }: DetectClickProps) {
  const router = useRouter();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      // switch to manual mode (unchanged — still clears AI state on every click)
      enterManualMode();

      const target = e.originalEvent?.target as HTMLElement | null;
      if (target?.closest('button, a, .leaflet-popup')) return;

      router.push(`/placelist/form?lat=${lat}&lng=${lng}`);

      e.target.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      } as L.ZoomPanOptions);
    },
  });

  return null;
}
