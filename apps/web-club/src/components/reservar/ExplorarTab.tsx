import React, { useState, useMemo } from 'react';
import { useSlidingIndicator } from '../../hooks/useSlidingIndicator';
import { ClubImageCarousel } from './ClubImageCarousel';
import { SportBadge } from '../SportBadge';
import { ClubsMapView } from './ClubsMapView';
import { useUserLocation, calculateHaversineKm } from '../../context/LocationContext';

export interface ExplorarClub {
  id: string;
  name: string;
  address: string;
  city: string;
  zone?: string;
  distanceKm?: number;
  rating: number;
  reviewCount?: number;
  sports: ('PADEL' | 'FUTBOL')[];
  latitude?: number;
  longitude?: number;
  minPrice?: number;
  minPricePerPlayer?: number;
  images?: string[];
  coverImage?: string;
  amenities: {
    parking?: boolean;
    buffet?: boolean;
    showers?: boolean;
    covered?: boolean;
    wifi?: boolean;
    lighting?: boolean;
    lockers?: boolean;
    syntheticWPT?: boolean;
  };
  courts?: any[];
  [key: string]: any;
}

interface ExplorarTabProps {
  clubs: any[];
  onSelectClub: (club: any) => void;
  onNavigateHome: () => void;
}

const Icons = {
  Search: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Map: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  List: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Star: ({ size = 13, color = '#FACC15', fill = '#FACC15' }: { size?: number; color?: string; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Check: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  RotateCcw: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  ArrowRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

export const ExplorarTab: React.FC<ExplorarTabProps> = ({
  clubs,
  onSelectClub,
  onNavigateHome,
}) => {
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL' | 'BOTH'>('ALL');
  const [selectedAmenity, setSelectedAmenity] = useState<'ALL' | 'COVERED' | 'PARKING' | 'BUFFET'>('ALL');

  const {
    containerRef: explorarSportContainerRef,
    setItemRef: setExplorarSportItemRef,
    indicatorStyle: explorarSportIndicatorStyle,
  } = useSlidingIndicator(sportFilter);

  const { userLocation } = useUserLocation();

  const filteredClubs = useMemo(() => {
    const filtered = clubs.filter((club) => {
      const hasPadel = club.sports?.includes('PADEL');
      const hasFutbol = club.sports?.includes('FUTBOL');

      if (sportFilter === 'PADEL' && !hasPadel) return false;
      if (sportFilter === 'FUTBOL' && !hasFutbol) return false;
      if (sportFilter === 'BOTH' && (!hasPadel || !hasFutbol)) return false;

      if (selectedAmenity === 'COVERED' && !club.amenities?.covered) return false;
      if (selectedAmenity === 'PARKING' && !club.amenities?.parking) return false;
      if (selectedAmenity === 'BUFFET' && !club.amenities?.buffet) return false;

      if (searchTerm.trim().length > 0) {
        const clean = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const q = clean(searchTerm);

        if (q.includes('padel') && !hasPadel) return false;
        if (q.includes('futbol') && !hasFutbol) return false;

        const matchName = clean(club.name).includes(q);
        const matchAddress = clean(club.address).includes(q);
        const matchCity = clean(club.city).includes(q);
        const matchSportKeyword = (q.includes('padel') && hasPadel) || (q.includes('futbol') && hasFutbol);

        if (!matchName && !matchAddress && !matchCity && !matchSportKeyword) return false;
      }

      return true;
    });

    const withDist = filtered.map((c) => {
      if (userLocation && typeof c.latitude === 'number' && typeof c.longitude === 'number') {
        return {
          ...c,
          distanceKm: calculateHaversineKm(userLocation.lat, userLocation.lng, c.latitude, c.longitude),
        };
      }
      return c;
    });

    return withDist.sort((a, b) => {
      const distA = typeof a.distanceKm === 'number' ? a.distanceKm : 999;
      const distB = typeof b.distanceKm === 'number' ? b.distanceKm : 999;
      return distA - distB;
    });
  }, [clubs, userLocation, searchTerm, sportFilter, selectedAmenity]);

  return (
    <div className="explorar-root">
      {/* ── Header & View Toggle ── */}
      <div className="explorar-header-wrap">
        <div style={{ fontSize: 10.5, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 4 }}>
          03 / DIRECTORIO NACIONAL DE CLUBES
        </div>
        <div className="explorar-header-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="explorar-title">
              Explorar Complejos
            </h1>
            <span className="explorar-counter-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)', display: 'inline-block' }} />
              <span>{filteredClubs.length} {filteredClubs.length === 1 ? 'complejo' : 'complejos'}</span>
            </span>
          </div>

          {/* Conmutador Vista Mapa / Lista (Idéntico a la App Móvil) */}
          <div className="explorar-view-toggle">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              style={{
                backgroundColor: viewMode === 'MAP' ? 'var(--color-crimson-signal)' : 'transparent',
                color: viewMode === 'MAP' ? '#ffffff' : 'var(--color-ash)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '7px 16px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: viewMode === 'MAP' ? '0 2px 10px rgba(252, 28, 70, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Map size={13} color={viewMode === 'MAP' ? '#ffffff' : 'var(--color-ash)'} />
              <span>Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              style={{
                backgroundColor: viewMode === 'LIST' ? 'var(--color-crimson-signal)' : 'transparent',
                color: viewMode === 'LIST' ? '#ffffff' : 'var(--color-ash)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '7px 16px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: viewMode === 'LIST' ? '0 2px 10px rgba(252, 28, 70, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.List size={13} color={viewMode === 'LIST' ? '#ffffff' : 'var(--color-ash)'} />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Barra de Búsqueda & Filtros ── */}
      <div className="explorar-filter-box">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Input Buscador */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-graphite)' }}>
              <Icons.Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Buscar club, barrio o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                color: 'var(--color-frost)',
                padding: searchTerm ? '10px 36px 10px 38px' : '10px 14px 10px 38px',
                fontSize: 12.5,
                outline: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                borderRadius: '0px',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ash)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Borrar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Deporte (Sliding Pill Switch) */}
          <div className="explorar-sport-scroll">
            <div
              ref={explorarSportContainerRef as any}
              style={{
                position: 'relative',
                display: 'inline-flex',
                padding: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {/* Sliding Pill Indicator */}
              <div style={explorarSportIndicatorStyle} />

              {(['ALL', 'PADEL', 'FUTBOL', 'BOTH'] as const).map((sport) => (
                <button
                  key={sport}
                  ref={setExplorarSportItemRef(sport)}
                  onClick={() => setSportFilter(sport)}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    backgroundColor: 'transparent',
                    color: sportFilter === sport ? '#ffffff' : 'var(--color-ash)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '7px 14px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sport === 'ALL' ? 'Todos' : sport === 'PADEL' ? 'Pádel' : sport === 'FUTBOL' ? 'Fútbol' : 'Ambos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Amenity Filters */}
        <div className="explorar-amenities-row">
          <span style={{ fontSize: 10.5, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 700, marginRight: 4 }}>
            Servicios:
          </span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'COVERED', label: 'Techada' },
            { id: 'PARKING', label: 'Estacionamiento' },
            { id: 'BUFFET', label: 'Buffet & Bar' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAmenity(item.id as any)}
              style={{
                backgroundColor: selectedAmenity === item.id ? 'rgba(252, 28, 70, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedAmenity === item.id ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                border: `1px solid ${selectedAmenity === item.id ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                borderRadius: 'var(--radius-full)',
                padding: '5px 12px',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vista Condicional: MAPA o LISTA ── */}
      {viewMode === 'MAP' ? (
        <ClubsMapView
          clubs={filteredClubs}
          onSelectClub={onSelectClub}
          activeSport={sportFilter}
          userLocation={userLocation}
        />
      ) : filteredClubs.length === 0 ? (
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(76, 76, 76, 0.4)',
            padding: '64px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(252, 28, 70, 0.1)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: 'var(--color-crimson-signal)',
            }}
          >
            <Icons.Search size={24} color="var(--color-crimson-signal)" />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--color-crimson-signal)',
              marginBottom: 8,
            }}
          >
            01 / SIN RESULTADOS
          </span>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 8px', textTransform: 'uppercase' }}>
            No encontramos clubes con esos filtros
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: '0 0 24px', maxWidth: 420, lineHeight: 1.5 }}>
            Probá buscando por otra zona, cambiando el deporte seleccionado o quitando filtros de servicios.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSportFilter('ALL');
              setSelectedAmenity('ALL');
            }}
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '12px 24px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(252, 28, 70, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Icons.RotateCcw size={14} color="#ffffff" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Carrusel de Imágenes del Club */}
              <ClubImageCarousel
                images={club.images || (club.coverImage ? [club.coverImage] : [])}
                clubName={club.name}
                height={200}
                onCardClick={() => onSelectClub(club)}
                topLeftBadge={<SportBadge sports={club.sports} size="sm" />}
                topRightBadge={
                  <div
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    <Icons.Star size={13} color="#FACC15" />
                    <span>{club.rating}</span>
                    <span style={{ color: 'var(--color-ash)', fontSize: 11 }}>
                      ({club.reviewCount || club.reviewsCount || 45})
                    </span>
                  </div>
                }
              />

              {/* Contenido */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ marginBottom: 6 }}>
                  <SportBadge sports={club.sports} size="sm" />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 6px' }}>
                  {club.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ash)', fontSize: 13, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                    <span>{club.address} · {club.city}</span>
                  </span>
                  {typeof club.distanceKm === 'number' && (
                    <>
                      <span style={{ color: 'var(--color-graphite)' }}>·</span>
                      <span style={{ color: 'var(--color-frost)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span>a {club.distanceKm} km</span>
                        {userLocation && (
                          <span style={{ fontSize: 9, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 5px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>
                            GPS
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Amenity Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                  {club.amenities?.covered && (
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-frost)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      Techada
                    </span>
                  )}
                  {club.amenities?.parking && (
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-frost)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      Estacionamiento
                    </span>
                  )}
                  {club.amenities?.buffet && (
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-frost)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      Buffet & Bar
                    </span>
                  )}
                </div>

                {/* Botones de Acción (Pills) */}
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(76, 76, 76, 0.3)', display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => onSelectClub(club)}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--color-frost)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-full)',
                      padding: '10px 16px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    Ficha del Club
                  </button>
                  {club.whatsappPhone ? (
                    <a
                      href={`https://wa.me/${club.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hola! Los vi en Hay Equipo y quería consultar disponibilidad de canchas en ${club.name}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        backgroundColor: '#25D366',
                        color: '#000000',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: '10px 16px',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        textDecoration: 'none',
                        boxShadow: '0 2px 10px rgba(37, 211, 102, 0.25)',
                      }}
                    >
                      <Icons.WhatsApp size={14} color="#000" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => onSelectClub(club)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--color-crimson-signal)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: '10px 16px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      Ver Contacto
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Responsive Global Styles for Explorar Tab ── */}
      <style jsx global>{`
        .explorar-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 92px 24px 60px;
        }
        .explorar-header-wrap {
          margin-bottom: 18px;
        }
        .explorar-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .explorar-title {
          font-size: clamp(22px, 3.5vw, 34px);
          font-weight: 700;
          color: var(--color-frost);
          text-transform: uppercase;
          letter-spacing: -0.8px;
          margin: 0;
        }
        .explorar-counter-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-ash);
        }
        .explorar-view-toggle {
          display: inline-flex;
          padding: 3px;
          background-color: #0a0a0a;
          border: 1px solid rgba(76, 76, 76, 0.5);
          border-radius: 9999px;
          gap: 4px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
        }
        .explorar-filter-box {
          background-color: #0a0a0a;
          border: 1px solid rgba(76, 76, 76, 0.4);
          padding: 12px 16px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .explorar-sport-scroll {
          display: flex;
          align-items: center;
        }
        .explorar-amenities-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        @media (max-width: 768px) {
          .explorar-root {
            padding: 82px 12px 90px !important;
          }
          .explorar-header-wrap {
            margin-bottom: 12px !important;
          }
          .explorar-header-flex {
            align-items: flex-start !important;
          }
          .explorar-title {
            font-size: 20px !important;
          }
          .explorar-filter-box {
            padding: 10px 12px !important;
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          .explorar-sport-scroll {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 2px !important;
          }
          .explorar-amenities-row {
            width: 100% !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 2px !important;
          }
        }
      `}</style>
    </div>
  );
};
