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
      className="clubs-map-container"
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(520px, 72vh, 820px)',
        backgroundColor: '#070707',
        border: '1px solid rgba(76, 76, 76, 0.4)',
        overflow: 'hidden',
        isolation: 'isolate',
        zIndex: 1,
      }}
    >
      {/* ── Leaflet Canvas Mount ── */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* ── Floating Map Controls (Right Top — Contained & Protected) ── */}
      <div className="clubs-map-controls">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Acercar mapa"
          className="map-control-btn"
        >
          <Icons.Plus size={16} />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Alejar mapa"
          className="map-control-btn"
        >
          <Icons.Minus size={16} />
        </button>

        <button
          type="button"
          onClick={() => handleLocateUser(true)}
          title="Mi ubicación actual"
          className={`map-control-btn ${isLocating ? 'locating' : ''}`}
        >
          <Icons.Locate size={17} />
        </button>
      </div>

      {/* ── Club Counter Badge (Left Top) ── */}
      <div className="clubs-map-counter">
        <span className="pulse-dot" />
        <span className="counter-text">
          {clubs.length} {clubs.length === 1 ? 'complejo' : 'complejos'}
        </span>
      </div>

      {/* ── Floating Club Preview Card (Bottom Center) ── */}
      {selectedClub && (
        <div className="clubs-map-card">
          {/* Close Card Button */}
          <button
            type="button"
            onClick={() => setSelectedClub(null)}
            className="map-card-close"
            title="Cerrar vista previa"
          >
            <Icons.Close size={13} />
          </button>

          <div className="map-card-inner">
            {/* Club Thumbnail Photo */}
            <div className="map-card-thumb">
              <img
                src={
                  selectedClub.images?.[0] ||
                  selectedClub.coverImage ||
                  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&auto=format&fit=crop&q=80'
                }
                alt={selectedClub.name}
              />
            </div>

            {/* Club Meta & Info */}
            <div className="map-card-info">
              <div className="map-card-meta-row">
                <SportBadge sports={selectedClub.sports} size="sm" />
                <div className="map-card-rating">
                  <Icons.Star size={11} fill="#FACC15" color="#FACC15" />
                  <span>{selectedClub.rating || 4.8}</span>
                </div>
                {userLocation && selectedClub.latitude && selectedClub.longitude && (
                  <span className="map-card-distance">
                    • a {calculateDistanceKm(userLocation.lat, userLocation.lng, selectedClub.latitude, selectedClub.longitude).toFixed(1)} km
                  </span>
                )}
              </div>

              <h4 className="map-card-name">
                {selectedClub.name}
              </h4>

              <div className="map-card-address">
                <Icons.MapPin size={12} color="var(--color-graphite)" />
                <span>{selectedClub.address}, {selectedClub.city}</span>
              </div>

              {/* Price & Action Row */}
              <div className="map-card-footer">
                <div>
                  <span className="map-card-price-label">Turno desde</span>
                  <span className="map-card-price-val">
                    ${Number(selectedClub.minPrice || (selectedClub.minPricePerPlayer ? selectedClub.minPricePerPlayer * 4 : 28000)).toLocaleString('es-AR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectClub(selectedClub)}
                  className="map-card-cta"
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
            transform: translate(-50%, 16px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* Contained Map Controls */
        .clubs-map-controls {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: auto;
        }
        .map-control-btn {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .map-control-btn:hover {
          background-color: rgba(252, 28, 70, 0.18);
          border-color: var(--color-crimson-signal);
          transform: scale(1.05);
        }
        .map-control-btn.locating {
          background-color: rgba(252, 28, 70, 0.25);
          border-color: var(--color-crimson-signal);
          color: var(--color-crimson-signal);
        }

        /* Contained Counter Badge */
        .clubs-map-counter {
          position: absolute;
          top: 18px;
          left: 18px;
          z-index: 20;
          padding: 6px 14px;
          background-color: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }
        .clubs-map-counter .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-crimson-signal);
          display: inline-block;
          box-shadow: 0 0 8px var(--color-crimson-signal);
        }
        .clubs-map-counter .counter-text {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--color-frost);
        }

        /* Contained Preview Card */
        .clubs-map-card {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 36px);
          max-width: 580px;
          z-index: 25;
          background-color: #0a0a0a;
          border: 1px solid rgba(252, 28, 70, 0.35);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(252, 28, 70, 0.12);
          padding: 14px;
          border-radius: 0px;
          animation: cardSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: auto;
        }
        .map-card-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.08);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-ash);
          z-index: 2;
          transition: background-color 0.2s;
        }
        .map-card-close:hover {
          background-color: rgba(252, 28, 70, 0.3);
          color: #ffffff;
        }
        .map-card-inner {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .map-card-thumb {
          width: 104px;
          height: 94px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          background-color: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .map-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .map-card-info {
          flex: 1;
          min-width: 0;
        }
        .map-card-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .map-card-rating {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-frost);
        }
        .map-card-distance {
          font-size: 11px;
          color: var(--color-ash);
        }
        .map-card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-frost);
          margin: 0 0 3px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .map-card-address {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--color-ash);
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .map-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .map-card-price-label {
          font-size: 9.5px;
          color: var(--color-graphite);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          display: block;
        }
        .map-card-price-val {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--color-frost);
        }
        .map-card-cta {
          background-color: var(--color-crimson-signal);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 7px 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(252, 28, 70, 0.4);
          transition: all 0.2s ease;
        }
        .map-card-cta:hover {
          filter: brightness(1.15);
          transform: scale(1.02);
        }

        /* Leaflet Dark Map Adjustments */
        .leaflet-container {
          background-color: #070707 !important;
          font-family: 'Space Grotesk', sans-serif !important;
        }
        .leaflet-tile {
          filter: brightness(0.85) contrast(1.15) saturate(0.9);
        }

        /* Responsive Mobile Adjustments */
        @media (max-width: 768px) {
          .clubs-map-container {
            height: clamp(460px, calc(100dvh - 240px), 640px) !important;
          }
          .clubs-map-controls {
            top: 12px !important;
            right: 12px !important;
            gap: 6px !important;
          }
          .map-control-btn {
            width: 36px !important;
            height: 36px !important;
          }
          .clubs-map-counter {
            top: 12px !important;
            left: 12px !important;
            padding: 4px 10px !important;
          }
          .clubs-map-counter .counter-text {
            font-size: 10px !important;
            letter-spacing: 0.4px !important;
          }
          .clubs-map-card {
            bottom: 10px !important;
            left: 8px !important;
            right: 8px !important;
            width: auto !important;
            max-width: none !important;
            transform: none !important;
            padding: 10px !important;
          }
          @keyframes cardSlideUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .map-card-thumb {
            width: 76px !important;
            height: 76px !important;
          }
          .map-card-name {
            font-size: 13.5px !important;
          }
          .map-card-address {
            font-size: 11px !important;
            margin-bottom: 6px !important;
          }
          .map-card-price-val {
            font-size: 12.5px !important;
          }
          .map-card-cta {
            padding: 6px 12px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
