'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { useLocation } from '../../_lib/contexts/LocationContext';
import { useUrlPosition } from '../../_lib/hooks/useUrlPosition';
import { BiSolidNavigation } from 'react-icons/bi';
import { usePlaces } from '../../_lib/contexts/PlaceContext';
import { Place } from '../../_lib/contexts/PlaceContext';
import { useBookmarks } from '../../_lib/contexts/BookmarkContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DetectClick from './DetectClick';
import StarDisplay from '../StarDisplay';
import Loader from './Loader';
import { fetchNearbyPois, NearbyError } from '../../_lib/services/overpass';
import {
  POI_MARKER_COLOR,
  POI_DEDUPE_RADIUS_M,
} from '../../_lib/utils/constants';
import { haversineDistance } from '../../_lib/utils/distance';
import type { Poi } from '@/types/place';

type AiMarker = { coordinates: [number, number]; title?: string };
type Mode = 'ai' | 'manual';

// ----------------- divIcon helper -----------------
// Three states encoded as inline SVG. Active overrides bookmarked.
function makeIcon(state: 'default' | 'bookmarked' | 'active'): L.DivIcon {
  const fill =
    state === 'active'
      ? '#dc2626' // red — clicked
      : state === 'bookmarked'
        ? '#f59e0b' // gold — bookmarked
        : '#2563eb'; // blue — default

  // Optional star badge for bookmarked
  const badge =
    state === 'bookmarked'
      ? `<g transform="translate(16,2)">
           <circle r="6" fill="#fff" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="0" y="3" text-anchor="middle" font-size="8" fill="#f59e0b">★</text>
         </g>`
      : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path
        d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"
        fill="${fill}" stroke="#fff" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
      ${badge}
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '', // strip Leaflet's default class so our SVG is unstyled
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -36],
  });
}

const ICONS = {
  default: makeIcon('default'),
  bookmarked: makeIcon('bookmarked'),
  active: makeIcon('active'),
};

// "You are here" — kept distinct from default (blue), bookmarked (gold),
// active (red), and the magenta route polyline below.
const userPositionIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;
    background:#06b6d4;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 2px #06b6d4, 0 2px 4px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// [NEW] Overpass POI candidate — green pin with a star badge, kept distinct
// from blue (saved), gold (bookmarked), red (active), cyan (you-are-here).
const poiIcon = L.divIcon({
  className: '',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path
        d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"
        fill="${POI_MARKER_COLOR}" stroke="#fff" stroke-width="1"/>
      <path d="M12.5 6l2 4.5 4.5.4-3.4 3 1 4.4-4.1-2.4-4.1 2.4 1-4.4-3.4-3 4.5-.4z"
        fill="#fff" opacity="0.95"/>
    </svg>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -36],
});

export default function Map() {
  const { places, currentPlace } = usePlaces() as {
    places: Place[];
    currentPlace: Place | null;
  };

  const { bookmarkedPlaceIds } = useBookmarks();

  // Current user's email — dedupe candidates only against THIS user's saved places
  const { data: session } = useSession();
  const myEmail = session?.user?.email ?? null;

  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getPosition,
    error: locationError, // [NEW] surfaced so a denied/failed fix can't hang the POI loader
    route, // active travel route set by the Distance tab
  } = useLocation();

  const [mapPosition] = useState<[number, number]>([25.0457, 121.5379]);
  const [mapLat, mapLng] = useUrlPosition();
  const [hasClicked, setHasClicked] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [aiMarker, setAiMarker] = useState<AiMarker | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(
    null,
  );
  const [activePlaceId, setActivePlaceId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('manual');
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const pendingFlyToRef = useRef<[number, number] | null>(null);

  // [NEW] "parks near me" (Overpass) state
  const [pois, setPois] = useState<Poi[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState<boolean>(false);
  const [poiError, setPoiError] = useState<string | null>(null);
  const lastPoiKeyRef = useRef<string | null>(null);

  const poisRef = useRef<Poi[]>([]);

  const pendingNearbyRef = useRef<boolean>(false);

  const pickIcon = (placeId: number) => {
    if (activePlaceId === placeId) return ICONS.active;
    if (bookmarkedPlaceIds.has(placeId)) return ICONS.bookmarked;
    return ICONS.default;
  };

  const enterManualMode = () => setMode('manual');
  const enterAiMode = () => setMode('ai');

  useEffect(() => {
    if (mode === 'manual') {
      setAiMarker(null);
      setSubmittedQuestion(null);
    }
  }, [mode]);

  useEffect(() => {
    if (mapLat && mapLng && mapRef.current) {
      const coords: [number, number] = [mapLat, mapLng];
      pendingFlyToRef.current = coords;

      const fallback = setTimeout(() => {
        if (pendingFlyToRef.current === coords) {
          pendingFlyToRef.current = null;
          mapRef.current?.flyTo(coords, 16, {
            animate: true,
            duration: 1.5,
          });
        }
      }, 400);
      return () => clearTimeout(fallback);
    }
  }, [mapLat, mapLng]);

  function handleGetPosition() {
    enterManualMode();
    getPosition();
    setHasClicked(true);
  }

  // Drop candidates that coincide with a place the user already saved, so
  // discovery never duplicates their own pins.
  function dedupeAgainstSaved(found: Poi[]): Poi[] {
    if (!myEmail) return found; // no session yet → don't hide anything
    const saved = (Array.isArray(places) ? places : [])
      .filter((p) => p.email === myEmail)
      .map((p) => ({
        lat: Number(p.position?.lat),
        lng: Number(p.position?.lng),
      }))
      .filter((s) => !Number.isNaN(s.lat) && !Number.isNaN(s.lng));

    return found.filter(
      (poi) =>
        !saved.some(
          (s) =>
            haversineDistance(s, { lat: poi.lat, lng: poi.lng }) * 1000 <=
            POI_DEDUPE_RADIUS_M,
        ),
    );
  }

  // [NEW] Fetch nearby parks for a given point (via the /api/overpass proxy).
  async function runNearby(lat: number, lng: number): Promise<void> {
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

    if (key === lastPoiKeyRef.current && poisRef.current.length) return;

    setIsLoadingPois(true);
    setPoiError(null);
    try {
      const found = await fetchNearbyPois({ at: { lat, lng } });
      setPois(dedupeAgainstSaved(found));

      lastPoiKeyRef.current = key;
      mapRef.current?.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
    } catch (err) {
      console.error('[nearby] fetch failed:', err);
      setPoiError(
        err instanceof NearbyError && err.code === 'BUSY'
          ? 'Parks service is busy — please try again.'
          : 'Could not load nearby parks.',
      );
    } finally {
      setIsLoadingPois(false);
    }
  }

  // "Find parks near me" button.
  function handleFindNearby() {
    enterManualMode();

    setHasClicked(false);
    if (geolocationPosition?.lat && geolocationPosition?.lng) {
      runNearby(geolocationPosition.lat, geolocationPosition.lng);
    } else {
      setIsLoadingPois(true);
      setPoiError(null);
      pendingNearbyRef.current = true;
      getPosition();
    }
  }

  // Remove the green candidate markers and reset the quantization guard
  function clearPois() {
    setPois([]);
    setPoiError(null);
    lastPoiKeyRef.current = null;
    pendingNearbyRef.current = false;
  }

  useEffect(() => {
    if (
      hasClicked &&
      geolocationPosition?.lat &&
      geolocationPosition?.lng &&
      mapRef.current
    ) {
      const { lat, lng } = geolocationPosition;

      setHasClicked(false);
      mapRef.current?.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.5,
      });
      router.push(`/placelist/form?lat=${lat}&lng=${lng}`);
    }
  }, [geolocationPosition, hasClicked]);

  useEffect(() => {
    poisRef.current = pois;
  }, [pois]);

  useEffect(() => {
    if (
      pendingNearbyRef.current &&
      geolocationPosition?.lat &&
      geolocationPosition?.lng
    ) {
      pendingNearbyRef.current = false;
      runNearby(geolocationPosition.lat, geolocationPosition.lng);
    }
  }, [geolocationPosition]);

  useEffect(() => {
    if (pendingNearbyRef.current && locationError) {
      pendingNearbyRef.current = false;
      setIsLoadingPois(false);
      setPoiError(
        'Location unavailable — enable location to find nearby parks.',
      );
    }
  }, [locationError]);

  useEffect(() => {
    if (
      currentPlace?.position?.lat &&
      currentPlace?.position?.lng &&
      mapRef.current
    ) {
      const coords: [number, number] = [
        currentPlace.position.lat,
        currentPlace.position.lng,
      ];
      pendingFlyToRef.current = coords;

      const fallback = setTimeout(() => {
        if (pendingFlyToRef.current === coords) {
          pendingFlyToRef.current = null;
          mapRef.current?.flyTo(coords, 16, {
            animate: true,
            duration: 1.5,
          });
        }
      }, 400);

      return () => clearTimeout(fallback);
    }
  }, [currentPlace]);

  useEffect(() => {
    if (route && mapRef.current && route.geometry.length > 1) {
      mapRef.current.fitBounds(route.geometry as L.LatLngBoundsExpression, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
        duration: 1.2,
      });
    }
  }, [route]);

  useEffect(() => {
    if (currentPlace) setActivePlaceId(currentPlace.id);
  }, [currentPlace]);

  const ZoomHandler: React.FC = () => {
    const map = useMap();
    const flyToMarker = (coordinates: [number, number], zoom: number) => {
      if (coordinates && typeof coordinates[0] !== 'undefined') {
        map.flyTo(coordinates, zoom, { animate: true, duration: 1.5 });
      }
    };
    useMapEvents({ zoomend: () => setLoading(false) });
    useEffect(() => {
      if (aiMarker?.coordinates) flyToMarker(aiMarker.coordinates, 16);
    }, [aiMarker]);
    return null;
  };

  const MapResizeHandler: React.FC = () => {
    const map = useMap();
    useEffect(() => {
      const container = map.getContainer();

      let raf1 = 0;
      let raf2 = 0;
      const safety = setTimeout(() => map.invalidateSize(), 250);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => map.invalidateSize());
      });

      const ro = new ResizeObserver(() => {
        // 1) Sync Leaflet's cached container dimensions to the new box.
        map.invalidateSize();
        // 2) If a flyTo was queued while we were waiting for the resize,
        //    execute it now with the freshly-corrected cached size.
        if (pendingFlyToRef.current) {
          const coords = pendingFlyToRef.current;
          pendingFlyToRef.current = null;
          map.flyTo(coords, 16, { animate: true, duration: 1.5 });
        }
      });
      ro.observe(container);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(safety);
        ro.disconnect();
      };
    }, [map]);
    return null;
  };

  async function handleSubmit(): Promise<void> {
    if (!inputValue.trim()) return;
    setLoading(true);
    try {
      setSubmittedQuestion(inputValue);
      setInputValue('');
      const res = await fetch('/api/openai/Coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: inputValue }),
      });
      const data: AiMarker = await res.json();
      if (data?.coordinates?.length === 2) {
        setAiMarker(data);
        enterAiMode();
      }
    } catch (err) {
      console.error('AI location fetch error:', err);
    } finally {
      setLoading(false);
      setInputValue('');
    }
  }

  function clearAiState() {
    setSubmittedQuestion(null);
    setAiMarker(null);
  }

  return (
    <div className='flex-1 relative h-full w-lg rounded-lg'>
      {loading && <Loader />}

      <MapContainer
        center={mapPosition}
        zoom={15}
        zoomControl={false}
        className='h-[90vh] z-0 md:h-[83vh] shadow-lg rounded-lg'
        style={{ width: '100%', zIndex: 0 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MapResizeHandler />
        <DetectClick enterManualMode={enterManualMode} />
        {Array.isArray(places) &&
          places.map((place) => (
            <Marker
              key={place.id}
              position={[place.position.lat, place.position.lng]}
              icon={pickIcon(place.id)}
              eventHandlers={{
                click: () => {
                  clearAiState();
                  setActivePlaceId(place.id);
                  mapRef.current?.flyTo(
                    [place.position.lat, place.position.lng],
                    16,
                    { animate: true, duration: 1.2 },
                  );
                },
              }}
            >
              <Popup className='flex flex-col'>
                <span className='leading-7'>
                  <StarDisplay rating={place.star_rating} />
                </span>
                <hr />
                <span className='leading-8 text-base'>{place.place_name}</span>
                <hr />
                <span className='leading-8 text-base'>{place.notes}</span>
                <hr />
                <span className='leading-8 text-base'>
                  by {place.user_name}
                </span>
              </Popup>
            </Marker>
          ))}
        {/* [NEW] Overpass "parks near me" candidates — ephemeral until saved */}
        {pois.map((poi) => (
          <Marker key={poi.osmId} position={[poi.lat, poi.lng]} icon={poiIcon}>
            <Popup className='flex flex-col'>
              <span className='text-xs font-bold uppercase tracking-wide text-green-700'>
                {poi.kind}
              </span>
              <span className='leading-7 text-base'>
                {poi.name ?? `Unnamed ${poi.kind}`}
              </span>
              <span className='text-sm text-slate-500'>
                {poi.distanceM} m away
              </span>
              <button
                type='button'
                onClick={() => {
                  const url = `/placelist/form?lat=${poi.lat}&lng=${poi.lng}&name=${encodeURIComponent(
                    poi.name ?? '',
                  )}`;
                  // Clear candidates before navigating so they're gone when the
                  // user returns from the Add form.
                  clearPois();
                  router.push(url);
                }}
                className='mt-2 px-3 py-2 bg-green-600 text-slate-50 rounded-lg font-semibold hover:bg-green-700'
              >
                ＋ Add this place
              </button>
            </Popup>
          </Marker>
        ))}
        {aiMarker?.coordinates?.length === 2 && (
          <Marker position={aiMarker.coordinates} icon={ICONS.active}>
            <Popup>{aiMarker.title}</Popup>
          </Marker>
        )}

        {/* "You are here" dot — lit up whenever LocationContext has a position. */}
        {geolocationPosition && (
          <Marker
            position={[geolocationPosition.lat, geolocationPosition.lng]}
            icon={userPositionIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {route && route.geometry.length > 1 && (
          <>
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: '#ffffff',
                weight: 12,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: '#ae3ec9',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        <ZoomHandler />
      </MapContainer>

      <div className='absolute top-5 right-5 z-10 flex flex-col items-end gap-2'>
        <button
          type='button'
          onClick={handleGetPosition}
          className='p-2 rounded-full bg-accent-600 text-slate-50 hover:text-accent-600 hover:bg-slate-50 shadow-xl z-40'
        >
          {isLoadingPosition ? (
            <span className='text-sm text-slate-50'>...</span>
          ) : (
            <BiSolidNavigation className='w-7 h-7 z-40' />
          )}
        </button>

        {!isLoadingPosition && locationError && (
          <div className='max-w-[220px] text-right text-xs bg-slate-800 text-slate-50 px-3 py-2 rounded-lg shadow-xl'>
            {locationError}
            <button
              type='button'
              onClick={handleGetPosition}
              className='block mt-1 ml-auto font-semibold text-accent-300 hover:underline'
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {mode === 'ai' && submittedQuestion && (
        <div className='absolute top-[5rem] w-full flex justify-center z-30'>
          <h1 className='text-xl font-bold text-slate-50 p-2 bg-accent-600 rounded-md shadow-xl'>
            {submittedQuestion}
          </h1>
        </div>
      )}
      <div className='absolute top-5 left-0 2xs:w-[85%] z-10 flex justify-center md:justify-start'>
        <div className='w-[88%] max-w-[24rem] ml-[0.5rem] relative shadow-xl md:ml-[1rem]'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={clearAiState}
            placeholder='Ask me for recommendation...'
            className='w-full px-4 py-3 border rounded-xl dark:bg-slate-800'
          />
          <button
            type='button'
            onClick={handleSubmit}
            className='absolute top-1 bottom-1 right-2 px-3  bg-accent-600 text-slate-50 rounded-xl shadow-xl hover:text-accent-50 hover:bg-accent-300'
          >
            GO
          </button>
        </div>
      </div>

      {/* Find parks near me — thumb-reachable at the bottom */}
      <div className='absolute bottom-24 md:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2'>
        <button
          type='button'
          onClick={handleFindNearby}
          disabled={isLoadingPois}
          className='flex items-center gap-2 px-5 py-3 rounded-full bg-accent-600 text-slate-50 font-semibold shadow-xl hover:text-accent-50 hover:bg-accent-300 disabled:opacity-70 whitespace-nowrap'
        >
          {isLoadingPois ? '…' : pois.length ? 'Search' : 'Parks nearby'}
        </button>
        {pois.length > 0 && !isLoadingPois && (
          <button
            type='button'
            onClick={clearPois}
            aria-label='Clear nearby parks'
            className='flex items-center gap-1 px-4 py-3 rounded-full bg-gray-700 text-slate-50 font-semibold shadow-xl hover:bg-gray-800 whitespace-nowrap'
          >
            ✕ Clear
          </button>
        )}
      </div>

      {poiError && (
        <div className='absolute bottom-40 md:bottom-24 left-1/2 -translate-x-1/2 z-10 max-w-[80%] text-center bg-slate-800 text-slate-50 text-sm px-4 py-2 rounded-lg shadow-xl'>
          {poiError}
        </div>
      )}
    </div>
  );
}
