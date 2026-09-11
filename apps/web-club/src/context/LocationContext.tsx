import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';

interface LocationContextType {
  userLocation: UserCoordinates | null;
  isLocating: boolean;
  permissionStatus: LocationPermissionStatus;
  requestLocation: () => void;
  getDistanceFromUser: (lat?: number, lng?: number) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Coordenadas céntricas de referencia para Mar del Plata (Plaza San Martín / Catedral)
export const MDP_CENTER_COORDS: UserCoordinates = {
  lat: -38.005470,
  lng: -57.542611,
};

/**
 * Fórmula de Haversine para calcular la distancia en kilómetros entre dos coordenadas
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10; // Redondear a 1 decimal
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt');

  const handlePositionSuccess = useCallback((pos: GeolocationPosition) => {
    const coords: UserCoordinates = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    setUserLocation(coords);
    setIsLocating(false);
    setPermissionStatus('granted');

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hay_equipo_user_loc', JSON.stringify(coords));
      }
    } catch {
      // Ignorar error de storage
    }
  }, []);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    setIsLocating(false);
    if (err.code === err.PERMISSION_DENIED) {
      setPermissionStatus('denied');
    } else {
      setPermissionStatus('unavailable');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionStatus('unavailable');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [handlePositionSuccess, handlePositionError]);

  // Al entrar a la web, solicitar inmediatamente permisos de geolocalización
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionStatus('unavailable');
      setIsLocating(false);
      return;
    }

    // Si ya teníamos una ubicación en sesión, la recuperamos inmediatamente para evitar parpadeos
    try {
      const cached = sessionStorage.getItem('hay_equipo_user_loc');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.lat && parsed.lng) {
          setUserLocation(parsed);
          setPermissionStatus('granted');
        }
      }
    } catch {
      // Ignore
    }

    // Solicitar permiso nativo al navegador
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }, [handlePositionSuccess, handlePositionError]);

  const getDistanceFromUser = useCallback(
    (lat?: number, lng?: number): number | null => {
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      const ref = userLocation || MDP_CENTER_COORDS;
      return calculateHaversineKm(ref.lat, ref.lng, lat, lng);
    },
    [userLocation]
  );

  const value = useMemo(
    () => ({
      userLocation,
      isLocating,
      permissionStatus,
      requestLocation,
      getDistanceFromUser,
    }),
    [userLocation, isLocating, permissionStatus, requestLocation, getDistanceFromUser]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export function useUserLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
