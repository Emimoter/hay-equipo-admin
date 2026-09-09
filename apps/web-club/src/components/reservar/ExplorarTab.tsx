import React, { useState, useMemo } from 'react';
import { useSlidingIndicator } from '../../hooks/useSlidingIndicator';
import { ClubImageCarousel } from './ClubImageCarousel';

export interface ExplorarClub {
  id: string;
  name: string;
  address: string;
  city: string;
  zone?: string;
  rating: number;
  reviewCount?: number;
  sports: ('PADEL' | 'FUTBOL')[];
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL'>('ALL');
  const [selectedAmenity, setSelectedAmenity] = useState<'ALL' | 'COVERED' | 'PARKING' | 'BUFFET'>('ALL');

  const {
    containerRef: explorarSportContainerRef,
    setItemRef: setExplorarSportItemRef,
    indicatorStyle: explorarSportIndicatorStyle,
  } = useSlidingIndicator(sportFilter);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      if (sportFilter === 'PADEL' && !club.sports.includes('PADEL')) return false;
      if (sportFilter === 'FUTBOL' && !club.sports.includes('FUTBOL')) return false;

      if (selectedAmenity === 'COVERED' && !club.amenities.covered) return false;
      if (selectedAmenity === 'PARKING' && !club.amenities.parking) return false;
      if (selectedAmenity === 'BUFFET' && !club.amenities.buffet) return false;

      if (searchTerm.trim().length > 0) {
        const q = searchTerm.toLowerCase();
        const matchName = club.name.toLowerCase().includes(q);
        const matchAddress = club.address.toLowerCase().includes(q);
        const matchCity = club.city.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchCity) return false;
      }

      return true;
    });
  }, [clubs, searchTerm, sportFilter, selectedAmenity]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
          03 / DIRECTORIO NACIONAL DE CLUBES
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
              Explorar Complejos
            </h1>
            <p style={{ color: 'var(--color-ash)', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
              Encontrá los mejores clubes deportivos con canchas de cristal techadas, buffet, vestuarios y estacionamiento.
            </p>
          </div>
        </div>
      </div>

      {/* ── Barra de Búsqueda & Filtros ── */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(76, 76, 76, 0.4)',
          padding: '16px 20px',
          marginBottom: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Input Buscador */}
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-graphite)' }}>
              <Icons.Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por club, barrio o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                color: 'var(--color-frost)',
                padding: '12px 14px 12px 42px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            />
          </div>

          {/* Toggle Deporte (Sliding Pill Switch — hay-equipo-system) */}
          <div
            ref={explorarSportContainerRef as any}
            style={{
              position: 'relative',
              display: 'inline-flex',
              padding: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {/* Sliding Pill Indicator */}
            <div style={explorarSportIndicatorStyle} />

            {(['ALL', 'PADEL', 'FUTBOL'] as const).map((sport) => (
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
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  transition: 'color 0.2s ease',
                }}
              >
                {sport === 'ALL' ? 'Todos' : sport === 'PADEL' ? 'Pádel' : 'Fútbol'}
              </button>
            ))}
          </div>
        </div>

        {/* Amenity Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 700, marginRight: 6 }}>
            Servicios:
          </span>
          {[
            { id: 'ALL', label: 'Todos los servicios' },
            { id: 'COVERED', label: 'Techada / Cubierta' },
            { id: 'PARKING', label: 'Estacionamiento' },
            { id: 'BUFFET', label: 'Bar & Buffet' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAmenity(item.id as any)}
              style={{
                backgroundColor: selectedAmenity === item.id ? 'rgba(252, 28, 70, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedAmenity === item.id ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                border: `1px solid ${selectedAmenity === item.id ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de Clubes / Empty State (hay-equipo-ux) ── */}
      {filteredClubs.length === 0 ? (
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
              borderRadius: 'var(--radius-buttons)',
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
            {/* Carrusel de Imágenes del Club (Logo Oficial N°1 + Fotos Reales al scrollear) */}
            <ClubImageCarousel
              images={club.images || (club.coverImage ? [club.coverImage] : [])}
              clubName={club.name}
              height={200}
              onCardClick={() => onSelectClub(club)}
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
              <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 6px' }}>
                {club.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ash)', fontSize: 13, marginBottom: 16 }}>
                <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                <span>{club.address} · {club.city}</span>
              </div>

              {/* Amenity Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {club.amenities.covered && (
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-frost)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    Techada
                  </span>
                )}
                {club.amenities.parking && (
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-frost)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    Estacionamiento
                  </span>
                )}
                {club.amenities.buffet && (
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
    </div>
  );
};
