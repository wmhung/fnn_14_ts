'use client';
import { useState } from 'react';
import { usePlaceData } from '../_lib/contexts/PlaceDataContext';
import { useLocation } from '../_lib/contexts/LocationContext';
import {
  getRoute,
  RoutingError,
  RouteResult,
  RoutingMode,
} from '../_lib/services/routing';
import { haversineDistance, formatDistance } from '../_lib/utils/distance';
import { BiSolidNavigation } from 'react-icons/bi';
import { FaWalking, FaCar } from 'react-icons/fa';

interface DistanceResult {
  walking?: RouteResult;
  driving?: RouteResult;
  approxKm?: number; // Haversine fallback, only set when both modes failed
  warning?: string;
}

// Pick the friendliest warning string from a rejected promise.
function warningFor(reason: unknown): string {
  if (reason instanceof RoutingError) {
    if (reason.code === 'NO_ROUTE')
      return 'No route found — showing straight-line distance.';
    if (reason.code === 'NOT_CONFIGURED')
      return 'Routing service is not configured — showing straight-line distance.';
  }
  return 'Routing service unavailable — showing straight-line distance.';
}

export default function DistanceTab() {
  const { bookmarks = [] } = usePlaceData();
  const {
    position,
    isLoading: locLoading,
    error: locError,
    getPosition,
    setRoute,
    clearRoute,
  } = useLocation();

  const [selectedId, setSelectedId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<DistanceResult | null>(null);
  const [activeMode, setActiveMode] = useState<RoutingMode>('walking');

  const routableBookmarks = bookmarks.filter(
    (b) =>
      b.position &&
      typeof b.position.lat === 'number' &&
      typeof b.position.lng === 'number',
  );

  const selected = routableBookmarks.find((b) => String(b.id) === selectedId);

  async function handleCalculate() {
    if (!position || !selected?.position) return;

    setIsCalculating(true);
    setResult(null);
    clearRoute();

    // Fire walking + driving in parallel. allSettled so one failure doesn't
    // kill the other — the user may still get driving even if walking has
    // no path (rare, but possible at the edges of ORS coverage).
    const [walkRes, driveRes] = await Promise.allSettled([
      getRoute({ from: position, to: selected.position, mode: 'walking' }),
      getRoute({ from: position, to: selected.position, mode: 'driving' }),
    ]);

    const walking = walkRes.status === 'fulfilled' ? walkRes.value : undefined;
    const driving =
      driveRes.status === 'fulfilled' ? driveRes.value : undefined;

    if (!walking && !driving) {
      // Both modes failed → Haversine fallback.
      const approxKm = haversineDistance(position, selected.position);
      const reason =
        walkRes.status === 'rejected'
          ? walkRes.reason
          : driveRes.status === 'rejected'
            ? driveRes.reason
            : undefined;
      setResult({ approxKm, warning: warningFor(reason) });
      setIsCalculating(false);
      return;
    }

    // Default the visible polyline to walking when available, else driving.
    const defaultMode: RoutingMode = walking ? 'walking' : 'driving';
    setActiveMode(defaultMode);
    setRoute(walking ?? driving!); // safe: at least one is defined here

    setResult({ walking, driving });
    setIsCalculating(false);
  }

  function handleReset() {
    setSelectedId('');
    setResult(null);
    setActiveMode('walking');
    clearRoute();
  }

  function showOnMap(mode: RoutingMode) {
    if (!result) return;
    const target = mode === 'walking' ? result.walking : result.driving;
    if (!target) return;
    setRoute(target);
    setActiveMode(mode);
  }

  const canCalculate = !!position && !!selected && !isCalculating;
  const hasBothModes = !!result?.walking && !!result?.driving;

  return (
    <div className='flex flex-col gap-3 p-2 text-sm'>
      {/*  my location */}
      <section>
        <div className='flex items-center justify-between mb-1'>
          <span className='font-bold uppercase text-xs text-slate-500'>
            Step 1 · My location
          </span>
          {position && (
            <button
              onClick={getPosition}
              className='text-xs text-accent-600 hover:underline'
              type='button'
              disabled={locLoading}
            >
              {locLoading ? 'Updating…' : 'Refresh'}
            </button>
          )}
        </div>

        {position ? (
          <div className='rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:text-slate-200'>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        ) : (
          <button
            type='button'
            onClick={getPosition}
            disabled={locLoading}
            className='w-full flex items-center justify-center gap-2 rounded-md bg-accent-600 text-slate-50 py-2 hover:bg-accent-500 disabled:opacity-60'
          >
            <BiSolidNavigation className='w-4 h-4' />
            {locLoading ? 'Locating…' : 'Get my location'}
          </button>
        )}

        {locError && <p className='mt-1 text-xs text-red-500'>{locError}</p>}
      </section>

      {/*  pick a bookmark */}
      <section>
        <label
          htmlFor='distance-bookmark'
          className='block font-bold uppercase text-xs text-slate-500 mb-1'
        >
          Step 2 · Choose a bookmark
        </label>
        <select
          id='distance-bookmark'
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setResult(null);
            clearRoute();
          }}
          disabled={!routableBookmarks.length}
          className='w-full rounded-md border border-slate-300 bg-slate-50 dark:bg-slate-700 dark:text-slate-50 px-2 py-2 disabled:opacity-60'
        >
          <option value=''>— Select —</option>
          {routableBookmarks.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.place_name}
            </option>
          ))}
        </select>
        {!routableBookmarks.length && (
          <p className='mt-1 text-xs text-slate-500'>
            You have no bookmarks with saved coordinates yet.
          </p>
        )}
      </section>

      {/* ---------- Step 3: calculate ---------- */}
      <section className='flex gap-2'>
        <button
          type='button'
          onClick={handleCalculate}
          disabled={!canCalculate}
          className='flex-1 rounded-md bg-accent-600 text-slate-50 py-2 hover:bg-accent-500 disabled:opacity-60'
        >
          {isCalculating ? 'Calculating…' : 'Calculate'}
        </button>
        {result && (
          <button
            type='button'
            onClick={handleReset}
            className='rounded-md border border-slate-300 px-3 hover:bg-slate-100 dark:hover:bg-slate-700'
          >
            Clear
          </button>
        )}
      </section>

      {/* ---------- Result ---------- */}
      {result && (
        <section
          className={`rounded-md p-3 ${
            result.approxKm !== undefined
              ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-300'
              : 'bg-slate-100 dark:bg-slate-700'
          }`}
        >
          <div className='text-xs uppercase text-slate-500 mb-2'>
            From you to <strong>{selected?.place_name}</strong>
          </div>

          {/* Haversine fallback view (both modes failed) */}
          {result.approxKm !== undefined && (
            <>
              <div className='text-lg font-bold'>
                {formatDistance(result.approxKm)}
                <span className='ml-2 text-xs font-normal text-slate-500'>
                  (approx)
                </span>
              </div>
              {result.warning && (
                <p className='mt-2 text-xs text-amber-700 dark:text-amber-300'>
                  {result.warning}
                </p>
              )}
            </>
          )}

          {/* Real-route view: one row per mode. */}
          {result.walking && (
            <div className='flex items-center gap-2 py-1'>
              <FaWalking className='w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0' />
              <span className='font-bold'>
                {formatDistance(result.walking.distanceKm)}
              </span>
              <span className='text-slate-600 dark:text-slate-300'>
                · ~{Math.round(result.walking.durationMin)} min
              </span>
            </div>
          )}
          {result.driving && (
            <div className='flex items-center gap-2 py-1'>
              <FaCar className='w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0' />
              <span className='font-bold'>
                {formatDistance(result.driving.distanceKm)}
              </span>
              <span className='text-slate-600 dark:text-slate-300'>
                · ~{Math.round(result.driving.durationMin)} min
              </span>
            </div>
          )}

          {/* Toggle: only meaningful when both succeeded. */}
          {hasBothModes && (
            <div className='mt-3'>
              <div className='text-xs uppercase text-slate-500 mb-1'>
                Show on map
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => showOnMap('walking')}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-md py-1 text-xs transition-colors ${
                    activeMode === 'walking'
                      ? 'bg-accent-600 text-slate-50'
                      : 'border border-slate-300 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <FaWalking className='w-3 h-3' /> Walking
                </button>
                <button
                  type='button'
                  onClick={() => showOnMap('driving')}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-md py-1 text-xs transition-colors ${
                    activeMode === 'driving'
                      ? 'bg-accent-600 text-slate-50'
                      : 'border border-slate-300 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <FaCar className='w-3 h-3' /> Driving
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
