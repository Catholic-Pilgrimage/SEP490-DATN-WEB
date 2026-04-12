/**
 * Vietmap Service
 * Handles routing and geocoding with Vietmap API
 */

import { VIETMAP_CONFIG } from '@/config/vietmap.config';
import { extractErrorMessage } from '../lib/utils';

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  duration: number; // seconds
  distance: number; // meters
  durationMinutes: number; // converted to minutes
  durationText: string; // human readable (e.g., "45 phút", "1 giờ 30 phút")
  distanceKm: number; // converted to kilometers
}

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url: string, timeoutMs = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Calculate route between two points using Vietmap Routing API
 * @param from Starting point
 * @param to Destination point
 * @returns Route information including duration and distance
 */
export const calculateRoute = async (
  from: RoutePoint,
  to: RoutePoint,
): Promise<RouteResult> => {
  try {
    const url = `${VIETMAP_CONFIG.ROUTING_URL}?apikey=${VIETMAP_CONFIG.API_KEY}&point=${from.latitude},${from.longitude}&point=${to.latitude},${to.longitude}&vehicle=car&points_encoded=false`;

    const response = await fetchWithTimeout(url);
    const data = await response.json();

    if (!response.ok || !data.paths || data.paths.length === 0) {
      throw new Error('Không thể tính toán lộ trình');
    }

    const path = data.paths[0];
    const duration = path.time / 1000; // convert ms to seconds
    const distance = path.distance; // meters

    const durationMinutes = Math.ceil(duration / 60);
    const distanceKm = distance / 1000;

    // Format duration text in Vietnamese
    let durationText: string;
    if (durationMinutes < 60) {
      durationText = `${durationMinutes} phút`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      if (minutes === 0) {
        durationText = `${hours} giờ`;
      } else {
        durationText = `${hours} giờ ${minutes} phút`;
      }
    }

    return {
      duration,
      distance,
      durationMinutes,
      durationText,
      distanceKm,
    };
  } catch (error) {
    console.error('Calculate route error:', error);
    const message = extractErrorMessage(error, 'Không thể tính toán lộ trình');
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Yêu cầu bị hết thời gian chờ');
    }
    throw new Error(message);
  }
};

/**
 * Calculate estimated arrival time based on departure time and travel duration
 * @param departureTime Format "HH:MM"
 * @param durationMinutes Travel duration in minutes
 * @returns Object containing the formatted arrival time "HH:MM" and number of days added if it crosses midnight
 */
export const calculateArrivalTime = (
  departureTime: string,
  durationMinutes: number,
): { time: string; daysAdded: number } => {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const daysAdded = Math.floor(totalMinutes / (24 * 60));
  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;

  return {
    time: `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`,
    daysAdded
  };
};

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  display: string;
  district: string;
  province: string;
}

/**
 * Geocode address string to coordinates using Vietmap Search + Place API
 * @param address Address text to search
 * @param focus Optional center point {lat, lng} to bias results
 * @returns Geocode result or null if not found
 */
export const geocodeAddress = async (
  address: string,
  focus?: { lat: number; lng: number },
): Promise<GeocodeResult | null> => {
  try {
    const trimmed = address.trim();
    if (!trimmed) return null;

    const focusParam = focus ? `&focus=${focus.lat},${focus.lng}` : '';
    const searchUrl = `/vietmap/search/v4?apikey=${VIETMAP_CONFIG.API_KEY}&text=${encodeURIComponent(trimmed)}&display_type=2${focusParam}`;
    const searchRes = await fetchWithTimeout(searchUrl);
    if (!searchRes.ok) throw new Error(`Search HTTP ${searchRes.status}`);
    const searchData = await searchRes.json();

    const items = Array.isArray(searchData) ? searchData : [];
    const first = items[0];
    if (!first?.ref_id) return null;

    const refId = encodeURIComponent(first.ref_id);
    const placeUrl = `/vietmap/place/v4?apikey=${VIETMAP_CONFIG.API_KEY}&refid=${refId}`;
    const placeRes = await fetchWithTimeout(placeUrl);
    if (!placeRes.ok) throw new Error(`Place HTTP ${placeRes.status}`);
    const placeData = await placeRes.json();

    const lat = placeData?.lat;
    const lng = placeData?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    return {
      latitude: lat,
      longitude: lng,
      address: placeData.address ?? first.address ?? '',
      display: placeData.display ?? first.display ?? trimmed,
      district: placeData.district ?? first.boundaries?.find((b: { type: number }) => b.type === 1)?.full_name ?? '',
      province: placeData.city ?? placeData.province ?? first.boundaries?.find((b: { type: number }) => b.type === 0)?.full_name ?? '',
    };
  } catch (error) {
    console.error('[geocodeAddress] error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    return null;
  }
};

export default {
  calculateRoute,
  calculateArrivalTime,
  geocodeAddress,
};
