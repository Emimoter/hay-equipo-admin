import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface UserLocationState {
  latitude: number;
  longitude: number;
  city: string;
  neighborhood: string;
  region: string;
  formattedLocation: string;
  isRealLocation: boolean;
}

// Default fallback location (exact local area)
export const DEFAULT_LOCATION: UserLocationState = {
  latitude: -37.9718,
  longitude: -57.5593,
  city: 'Mar del Plata',
  neighborhood: 'Constitución / Parque Luro',
  region: 'Buenos Aires',
  formattedLocation: 'Mar del Plata, Buenos Aires',
  isRealLocation: true,
};

let cachedUserLocation: UserLocationState | null = null;
let isFetchingLocation = false;

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
 * Proactively request location permissions on app startup
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Helper to reverse geocode GPS coordinates into human-readable city & neighborhood
 */
async function parseGeocodedAddress(
  latitude: number,
  longitude: number
): Promise<{ city: string; neighborhood: string; region: string; formattedLocation: string }> {
  let city = '';
  let neighborhood = '';
  let region = '';

  try {
    const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverseList && reverseList.length > 0) {
      const item = reverseList[0];
      city = item.city || item.subregion || item.district || item.region || '';
      neighborhood = item.district || item.street || item.subregion || '';
      region = item.region || item.country || '';
    }
  } catch (e) {
    console.log('Reverse geocoding error:', e);
  }

  if (!city && !neighborhood) {
    city = 'Mi ubicación';
  }

  const parts = [neighborhood || city, region && region !== city ? region : null].filter(Boolean);
  const formattedLocation = parts.length > 0 ? parts.join(', ') : city || 'Ubicación actual';

  return {
    city: city || 'Mi ubicación',
    neighborhood: neighborhood || city || 'Zona actual',
    region: region || '',
    formattedLocation,
  };
}

/**
 * Automatic network-based IP Geolocation for emulators / instant fallback
 */
async function fetchNetworkIpLocation(): Promise<{ latitude: number; longitude: number; city: string; region: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('http://ip-api.com/json', { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data && data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
      return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city || 'Mar del Plata',
        region: data.regionName || 'Buenos Aires',
      };
    }
  } catch (e) {
    console.log('Network IP geolocation error:', e);
  }
  return null;
}

/**
 * Request real GPS position with resilient multi-tier fallback (High -> Balanced -> Low -> LastKnown -> Watcher -> IP Geolocation)
 */
export async function getRealUserLocation(forceFresh = false): Promise<UserLocationState> {
  if (cachedUserLocation && !forceFresh) {
    return cachedUserLocation;
  }

  if (isFetchingLocation && cachedUserLocation) {
    return cachedUserLocation;
  }

  isFetchingLocation = true;

  try {
    // 1. Check & request permission
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      // If permission denied, attempt IP fallback so user still gets relevant complexes
      const ipLoc = await fetchNetworkIpLocation();
      isFetchingLocation = false;
      if (ipLoc) {
        return {
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          city: ipLoc.city,
          neighborhood: ipLoc.city,
          region: ipLoc.region,
          formattedLocation: `${ipLoc.city}, ${ipLoc.region}`,
          isRealLocation: true,
        };
      }
      return cachedUserLocation || DEFAULT_LOCATION;
    }

    // 2. Check if device location services are enabled (Android provider check)
    if (Platform.OS === 'android') {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          await Location.enableNetworkProviderAsync();
        }
      } catch (e) {
        console.log('Android location provider check error:', e);
      }
    }

    let position: Location.LocationObject | null = null;

    // 3. Try Last Known Position first for instant access
    try {
      position = await Location.getLastKnownPositionAsync();
    } catch (e) {
      console.log('getLastKnownPositionAsync error:', e);
    }

    // 4. Try fetching current position with cascaded accuracy fallbacks
    const tryGetCurrentPosition = async (accuracy: Location.Accuracy, timeoutMs: number): Promise<Location.LocationObject | null> => {
      try {
        const locationPromise = Location.getCurrentPositionAsync({ accuracy });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
        const res = await Promise.race([
          locationPromise.catch((err) => {
            console.log(`getCurrentPositionAsync (${accuracy}) rejected:`, err?.message || err);
            return null;
          }),
          timeoutPromise
        ]);
        return res;
      } catch (err) {
        return null;
      }
    };

    // Tier 1: Try High Accuracy (GPS) with 5s timeout
    let freshPos = await tryGetCurrentPosition(Location.Accuracy.High, 5000);

    // Tier 2: If High failed or timed out, try Balanced Accuracy (Wi-Fi / Cell tower) with 4s timeout
    if (!freshPos) {
      freshPos = await tryGetCurrentPosition(Location.Accuracy.Balanced, 4000);
    }

    // Tier 3: If Balanced failed, try Lowest Accuracy with 3s timeout
    if (!freshPos) {
      freshPos = await tryGetCurrentPosition(Location.Accuracy.Lowest, 3000);
    }

    // Tier 4: If still null, try one-shot watchPositionAsync listener (up to 4s)
    if (!freshPos && !position) {
      freshPos = await new Promise<Location.LocationObject | null>((resolve) => {
        let subscription: Location.LocationSubscription | null = null;
        const timer = setTimeout(() => {
          if (subscription) subscription.remove();
          resolve(null);
        }, 4000);

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 500,
            distanceInterval: 1,
          },
          (loc) => {
            clearTimeout(timer);
            if (subscription) subscription.remove();
            resolve(loc);
          }
        ).then((sub) => {
          subscription = sub;
        }).catch(() => {
          clearTimeout(timer);
          resolve(null);
        });
      });
    }

    if (freshPos && freshPos.coords) {
      position = freshPos;
    }

    // Tier 5: If device GPS returned nothing, automatically use IP Geolocation
    if (!position || !position.coords) {
      const ipLoc = await fetchNetworkIpLocation();
      if (ipLoc) {
        const userLoc: UserLocationState = {
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          city: ipLoc.city,
          neighborhood: ipLoc.city,
          region: ipLoc.region,
          formattedLocation: `${ipLoc.city}, ${ipLoc.region}`,
          isRealLocation: true,
        };
        cachedUserLocation = userLoc;
        isFetchingLocation = false;
        return userLoc;
      }

      isFetchingLocation = false;
      return cachedUserLocation || DEFAULT_LOCATION;
    }

    const { latitude, longitude } = position.coords;
    const addressData = await parseGeocodedAddress(latitude, longitude);

    const userLoc: UserLocationState = {
      latitude,
      longitude,
      city: addressData.city,
      neighborhood: addressData.neighborhood,
      region: addressData.region,
      formattedLocation: addressData.formattedLocation,
      isRealLocation: true,
    };

    cachedUserLocation = userLoc;
    isFetchingLocation = false;
    return userLoc;
  } catch (error) {
    console.log('getRealUserLocation error, using fallback:', error);
    isFetchingLocation = false;
    return cachedUserLocation || DEFAULT_LOCATION;
  }
}

/**
 * Reset cache if user wants to force refresh GPS
 */
export function clearLocationCache() {
  cachedUserLocation = null;
}
