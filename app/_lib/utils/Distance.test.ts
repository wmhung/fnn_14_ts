import { describe, it, expect } from 'vitest';
import { haversineDistance, formatDistance } from './distance';

describe('haversineDistance', () => {
  it('is ~0 for the same point', () => {
    const p = { lat: 25.033, lng: 121.5645 }; // Taipei 101
    expect(haversineDistance(p, p)).toBeCloseTo(0, 5);
  });

  it('is ~5 km from Taipei 101 to Taipei Main Station', () => {
    const km = haversineDistance(
      { lat: 25.033, lng: 121.5645 },
      { lat: 25.0478, lng: 121.517 },
    );
    // True great-circle distance for these coords ≈ 5.06 km; assert a sane band.
    expect(km).toBeGreaterThan(4.5);
    expect(km).toBeLessThan(5.5);
  });
});

describe('formatDistance', () => {
  it('renders sub-kilometre distances in metres', () => {
    expect(formatDistance(0.85)).toBe('850 m');
  });

  it('renders kilometre distances with one decimal', () => {
    expect(formatDistance(3.24)).toBe('3.2 km');
  });
});
