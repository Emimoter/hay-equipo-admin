import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SportBadge } from '../SportBadge';

export interface MapClub {
  id: string;
  name: string;
  address: string;
  city: string;
  sports: ('PADEL' | 'FUTBOL')[];
  rating: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  minPrice?: number;
  minPricePerPlayer?: number;
  images?: string[];
  coverImage?: string;
  amenities?: {
    parking?: boolean;
    buffet?: boolean;
    showers?: boolean;
    covered?: boolean;
    wifi?: boolean;
    lighting?: boolean;
    lockers?: boolean;
    syntheticWPT?: boolean;
  };
  [key: string]: any;
}

interface ClubsMapViewProps {
  clubs: MapClub[];
  onSelectClub: (club: MapClub) => void;
  activeSport?: string;
}

/* ────────────────────────────────────────────────────────────
   Minimal SVG Vector Icons (Swiss Brutalist — Zero Emojis)
   ──────────────────────────────────────────────────────────── */
const Icons = {
  Plus: ({ size = 16, color = '#ffffff' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: ({ size = 16, color = '#ffffff' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Locate: ({ size = 16, color = 'var(--color-crimson-signal)' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="1" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="1" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="23" y2="12" />
    </svg>
  ),
  Star: ({ size = 12, color = '#FACC15', fill = '#FACC15' }: { size?: number; color?: string; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  MapPin: ({ size = 13, color = '#94a3b8' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Close: ({ size = 14, color = '#94a3b8' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowRight: ({ size = 13, color = '#ffffff' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// SVG strings for Leaflet custom HTML markers
const PADEL_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a7 7 0 0 0-7 7c0 3.1 2 5.7 4.9 6.6L9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l-.9-5.4A7.002 7.002 0 0 0 19 9a7 7 0 0 0-7-7z"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="14" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/></svg>`;
const FUTBOL_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="12 6 15 9 14 13 10 13 9 9" fill="currentColor"/></svg>`;
const DUAL_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3a4.5 4.5 0 0 0-4.5 4.5c0 2 1.3 3.7 3.1 4.2L5 15h3l-.6-3.3A4.5 4.5 0 0 0 7 3z"/><circle cx="17" cy="12" r="5"/><polygon points="17 9 18.5 10.5 18 12.5 16 12.5 15.5 10.5" fill="currentColor"/></svg>`;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ClubsMapView: React.FC<ClubsMapViewProps> = ({
  clubs,
  onSelectClub,
  activeSport = 'ALL',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [selectedClub, setSelectedClub] = useState<MapClub | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Mar del Plata default center coordinates
  const DEFAULT_CENTER = { lat: -37.9950, lng: -57.5680 };

  // 1. Load Leaflet library dynamically (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // Inject CSS if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Inject JS if not present
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet script'));
          document.body.appendChild(script);
        });
      }

      setMapLoaded(true);
    };

    loadLeaflet().catch(err => console.error('Leaflet load error:', err));
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);

    // Google Maps tile layer (identical to mobile app)
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle background map click to deselect
    map.on('click', () => {
      setSelectedClub(null);
    });

    // Request user location on initial load
    handleLocateUser(false);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapLoaded]);

  // 3. User Geolocation Handler
  const handleLocateUser = (flyTo = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const L = (window as any).L;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        // User Pulsing Pin
        const userIcon = L.divIcon({
          className: 'user-marker-icon',
          html: `
            <div class="user-pulse-container">
              <div class="user-pulse-ring"></div>
              <div class="user-pulse-dot"></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: userIcon,
            zIndexOffset: 1500,
          }).addTo(map);
        }

        if (flyTo) {
          map.flyTo([latitude, longitude], 15, { animate: true, duration: 0.8 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation notice:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 4. Update Club Markers Reactively
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();

    clubs.forEach((club) => {
      // Verify valid coordinates
      const lat = club.latitude;
      const lng = club.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

      const isPadel = club.sports?.includes('PADEL');
      const isFutbol = club.sports?.includes('FUTBOL');
      const isBoth = isPadel && isFutbol;

      let sportIconSvg = PADEL_SVG;
      if (isBoth) {
        sportIconSvg = DUAL_SVG;
      } else if (isFutbol) {
        sportIconSvg = FUTBOL_SVG;
      }

      const isActive = selectedClub?.id === club.id;
      const priceVal = club.minPrice || (club.minPricePerPlayer ? club.minPricePerPlayer * 4 : 28000);
      const formattedPrice = Number(priceVal).toLocaleString('es-AR');

      const pinHtml = `
        <div class="custom-pin ${isActive ? 'active' : ''}">
          <span class="pin-icon">${sportIconSvg}</span>
          <span class="pin-name">${club.name}</span>
          <span class="pin-price">$${formattedPrice}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: pinHtml,
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      const marker = L.marker([lat, lng], {
        icon: markerIcon,
        zIndexOffset: isActive ? 2000 : 100,
      });

      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        setSelectedClub(club);
        map.flyTo([lat, lng], 15, { animate: true, duration: 0.6 });
      });

      group.addLayer(marker);
    });
  }, [clubs, selectedClub, mapLoaded]);

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn(1, { animate: true });
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut(1, { animate: true });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 220px)',
        minHeight: 560,
        backgroundColor: '#070707',
        border: '1px solid rgba(76, 76, 76, 0.4)',
        overflow: 'hidden',
      }}
    >
      {/* ── Leaflet Canvas Mount ── */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* ── Floating Map Controls (Right Top) ── */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Acercar mapa"
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(76, 76, 76, 0.5)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(252, 28, 70, 0.2)';
            e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0a0a0a';
            e.currentTarget.style.borderColor = 'rgba(76, 76, 76, 0.5)';
          }}
        >
          <Icons.Plus size={16} />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Alejar mapa"
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(76, 76, 76, 0.5)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(252, 28, 70, 0.2)';
            e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0a0a0a';
            e.currentTarget.style.borderColor = 'rgba(76, 76, 76, 0.5)';
          }}
        >
          <Icons.Minus size={16} />
        </button>

        <button
          type="button"
          onClick={() => handleLocateUser(true)}
          title="Mi ubicación actual"
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: isLocating ? 'rgba(252, 28, 70, 0.25)' : '#0a0a0a',
            border: `1px solid ${isLocating ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.5)'}`,
            color: 'var(--color-crimson-signal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(252, 28, 70, 0.2)';
            e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isLocating ? 'rgba(252, 28, 70, 0.25)' : '#0a0a0a';
            e.currentTarget.style.borderColor = isLocating ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.5)';
          }}
        >
          <Icons.Locate size={18} />
        </button>
      </div>

      {/* ── Club Counter Badge (Left Top) ── */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: '6px 14px',
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(76, 76, 76, 0.5)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--color-crimson-signal)',
            display: 'inline-block',
            boxShadow: '0 0 8px var(--color-crimson-signal)',
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color: 'var(--color-frost)',
          }}
        >
          {clubs.length} {clubs.length === 1 ? 'complejo en el mapa' : 'complejos en el mapa'}
        </span>
      </div>

      {/* ── Floating Club Preview Card (Bottom Center) ── */}
      {selectedClub && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: 640,
            zIndex: 1000,
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(76, 76, 76, 0.5)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(252, 28, 70, 0.15)',
            padding: 16,
            animation: 'cardSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Close Card Button */}
          <button
            type="button"
            onClick={() => setSelectedClub(null)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-ash)',
              zIndex: 2,
            }}
          >
            <Icons.Close size={14} />
          </button>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* Club Thumbnail Photo */}
            <div
              style={{
                width: 110,
                height: 96,
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#161616',
              }}
            >
              <img
                src={
                  selectedClub.images?.[0] ||
                  selectedClub.coverImage ||
                  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&auto=format&fit=crop&q=80'
                }
                alt={selectedClub.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Club Meta & Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <SportBadge sports={selectedClub.sports} size="sm" />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icons.Star size={11} fill="#FACC15" color="#FACC15" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-frost)' }}>
                    {selectedClub.rating || 4.8}
                  </span>
                </div>
                {userLocation && selectedClub.latitude && selectedClub.longitude && (
                  <span style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                    • a {calculateDistanceKm(userLocation.lat, userLocation.lng, selectedClub.latitude, selectedClub.longitude).toFixed(1)} km
                  </span>
                )}
              </div>

              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-frost)',
                  margin: '0 0 4px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selectedClub.name}
              </h4>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--color-ash)',
                  marginBottom: 10,
                }}
              >
                <Icons.MapPin size={12} color="var(--color-graphite)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedClub.address}, {selectedClub.city}
                </span>
              </div>

              {/* Price & Action Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
                    Turno desde
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-frost)' }}>
                    ${Number(selectedClub.minPrice || (selectedClub.minPricePerPlayer ? selectedClub.minPricePerPlayer * 4 : 28000)).toLocaleString('es-AR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectClub(selectedClub)}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 18px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 16px rgba(252, 28, 70, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Ver Canchas</span>
                  <Icons.ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Styles for Leaflet & Custom Pins ── */}
      <style jsx global>{`
        .custom-pin-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .custom-pin {
          background: #0a0a0a;
          border: 1.5px solid var(--color-crimson-signal);
          border-radius: 9999px;
          color: #ffffff;
          padding: 5px 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.8), 0 0 10px rgba(252, 28, 70, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-pin:hover {
          transform: scale(1.06);
          border-color: #ffffff;
          box-shadow: 0 6px 18px rgba(252, 28, 70, 0.5);
        }
        .custom-pin.active {
          background: var(--color-crimson-signal) !important;
          border: 2px solid #ffffff !important;
          transform: scale(1.14) !important;
          color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(252, 28, 70, 0.65) !important;
          z-index: 9999 !important;
        }
        .custom-pin .pin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-crimson-signal);
        }
        .custom-pin.active .pin-icon {
          color: #ffffff !important;
        }
        .custom-pin .pin-price {
          background: rgba(255, 255, 255, 0.12);
          padding: 2px 6px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          color: #ffffff;
          margin-left: 2px;
        }
        .custom-pin.active .pin-price {
          background: rgba(0, 0, 0, 0.35) !important;
        }

        /* User Location Pulsing Dot */
        .user-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .user-pulse-container {
          position: relative;
          width: 26px;
          height: 26px;
        }
        .user-pulse-ring {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(252, 28, 70, 0.35);
          animation: userPulseAnim 1.8s infinite;
        }
        .user-pulse-dot {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-crimson-signal);
          border: 3px solid #ffffff;
          box-shadow: 0 0 12px var(--color-crimson-signal);
        }
        @keyframes userPulseAnim {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.3);
            opacity: 0;
          }
        }
        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* Leaflet Dark Map Adjustments */
        .leaflet-container {
          background-color: #070707 !important;
          font-family: 'Space Grotesk', sans-serif !important;
        }
        .leaflet-tile {
          filter: brightness(0.85) contrast(1.15) saturate(0.9);
        }
      `}</style>
    </div>
  );
};
