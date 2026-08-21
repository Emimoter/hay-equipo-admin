import * as Location from 'expo-location';

export interface UserLocationState {
  latitude: number;
  longitude: number;
  city: string;
  neighborhood: string;
  region: string;
  formattedLocation: string;
  isRealLocation: boolean;
}

// Default fallback location if GPS is disabled or unavailable
export const DEFAULT_LOCATION: UserLocationState = {
  latitude: -38.0004,
  longitude: -57.5562,
  city: 'Mar del Plata',
  neighborhood: 'Centro',
  region: 'Buenos Aires',
  formattedLocation: 'Mar del Plata, Buenos Aires',
  isRealLocation: false,
};

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Request real GPS position from device and reverse-geocode to get real city/street name
 */
export async function getRealUserLocation(): Promise<UserLocationState> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return DEFAULT_LOCATION;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = position.coords;

    // Reverse geocode to get address components
    let city = 'Mar del Plata';
    let neighborhood = 'Centro';
    let region = 'Buenos Aires';

    try {
      const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseList && reverseList.length > 0) {
        const item = reverseList[0];
        city = item.city || item.subregion || item.district || 'Mar del Plata';
        neighborhood = item.district || item.street || 'Centro';
        region = item.region || 'Buenos Aires';
      }
    } catch (geoErr) {
      console.log('Reverse geocoding warning:', geoErr);
    }

    const formattedLocation = `${city}${region ? `, ${region}` : ''}`;

    return {
      latitude,
      longitude,
      city,
      neighborhood,
      region,
      formattedLocation,
      isRealLocation: true,
    };
  } catch (error) {
    console.log('Location acquisition warning:', error);
    return DEFAULT_LOCATION;
  }
}
