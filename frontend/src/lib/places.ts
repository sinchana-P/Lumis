import { PHOTON_API_URL } from './constants';

export interface PlaceResult {
  name: string;
  state?: string;
  country?: string;
  countryCode?: string;
  type?: string;
}

const PLACE_TYPES = [
  'city', 'town', 'village', 'municipality',
  'hamlet', 'suburb', 'district', 'county', 'state',
];

/**
 * Search for places using the Photon geocoding API (photon.komoot.io).
 * Free, no API key required, browser-safe, built for place search.
 */
export async function getPlaces(query: string, limit = 8): Promise<PlaceResult[]> {
  if (query.length < 2) return [];

  const response = await fetch(
    `${PHOTON_API_URL}/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`
  );
  if (!response.ok) throw new Error('Places search failed');

  const data = await response.json();

  return (data.features || [])
    .filter((f: any) => PLACE_TYPES.includes(f.properties?.type))
    .map((f: any) => ({
      name: f.properties.name,
      state: f.properties.state,
      country: f.properties.country,
      countryCode: f.properties.countrycode?.toUpperCase(),
      type: f.properties.type,
    }));
}

export function formatPlaceName(place: PlaceResult): string {
  const parts = [place.name];
  if (place.state && place.state !== place.name) parts.push(place.state);
  if (place.country) parts.push(place.country);
  return parts.join(', ');
}
