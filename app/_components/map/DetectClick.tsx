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

      // switch to manual mode
      enterManualMode();

      router.push(`/parklist/form?lat=${lat}&lng=${lng}`);

      e.target.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      } as L.ZoomPanOptions);
    },
  });

  return null;
}
