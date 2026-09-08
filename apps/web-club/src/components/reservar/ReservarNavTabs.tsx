import React from 'react';
import { useSlidingIndicator } from '../../hooks/useSlidingIndicator';

export type NavTabType = 'INICIO' | 'EXPLORAR' | 'RESERVAS' | 'FIJOS' | 'PERFIL';

interface ReservarNavTabsProps {
  activeTab: NavTabType;
  onChangeTab: (tab: NavTabType) => void;
  bookingCount?: number;
}

const TabIcons = {
  Home: ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Compass: ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Calendar: ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Repeat: ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  User: ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const TABS: { id: NavTabType; label: string; icon: (color: string, size: number) => React.ReactNode }[] = [
  { id: 'INICIO', label: 'Inicio', icon: (c, s) => <TabIcons.Home color={c} size={s} /> },
  { id: 'EXPLORAR', label: 'Explorar', icon: (c, s) => <TabIcons.Compass color={c} size={s} /> },
  { id: 'RESERVAS', label: 'Mis Reservas', icon: (c, s) => <TabIcons.Calendar color={c} size={s} /> },
  { id: 'FIJOS', label: 'Turnos Fijos', icon: (c, s) => <TabIcons.Repeat color={c} size={s} /> },
  { id: 'PERFIL', label: 'Mi Perfil', icon: (c, s) => <TabIcons.User color={c} size={s} /> },
];

export const ReservarNavTabs: React.FC<ReservarNavTabsProps> = ({
  activeTab,
  onChangeTab,
  bookingCount = 0,
}) => {
  const { containerRef, setItemRef, indicatorStyle } = useSlidingIndicator(activeTab);

  return (
    <>
      {/* ────────────────────────────────────────────────────────────
          DESKTOP TABS (Barra superior elegante estilo Swiss Brutalist)
          ──────────────────────────────────────────────────────────── */}
      <nav
        ref={containerRef as any}
        aria-label="Navegación principal de reservas"
        className="reservar-desktop-nav"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px',
          backgroundColor: 'rgba(18, 18, 18, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Sliding Pill Indicator (hay-equipo-system) */}
        <div style={indicatorStyle} />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={setItemRef(tab.id)}
              onClick={() => onChangeTab(tab.id)}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-ash)',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 600,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--color-ash)';
                }
              }}
            >
              {tab.icon(isActive ? '#ffffff' : 'var(--color-ash)', 14)}
              <span>{tab.label}</span>
              {tab.id === 'RESERVAS' && bookingCount > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'var(--color-crimson-signal)',
                    color: isActive ? 'var(--color-crimson-signal)' : '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    lineHeight: '1.2',
                  }}
                >
                  {bookingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ────────────────────────────────────────────────────────────
          MOBILE FLOATING DOCK (Idéntico a la app mobile nativa)
          ──────────────────────────────────────────────────────────── */}
      <aside aria-label="Navegación móvil" className="reservar-mobile-dock">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: 'rgba(10, 10, 10, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '9999px',
            padding: '8px 12px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(252, 28, 70, 0.1)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--color-crimson-signal)' : '#888888',
                  fontSize: '10px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: 1,
                }}
              >
                <div style={{ position: 'relative' }}>
                  {tab.icon(isActive ? 'var(--color-crimson-signal)' : '#888888', 18)}
                  {tab.id === 'RESERVAS' && bookingCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -8,
                        backgroundColor: 'var(--color-crimson-signal)',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '10px',
                        minWidth: '14px',
                        textAlign: 'center',
                      }}
                    >
                      {bookingCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                  {tab.id === 'RESERVAS' ? 'Reservas' : tab.id === 'FIJOS' ? 'Fijos' : tab.label}
                </span>
                {isActive && (
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-crimson-signal)',
                      position: 'absolute',
                      bottom: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <style jsx>{`
        .reservar-desktop-nav {
          display: flex;
        }
        .reservar-mobile-dock {
          display: none;
        }
        @media (max-width: 960px) {
          .reservar-desktop-nav {
            display: none;
          }
          .reservar-mobile-dock {
            display: block;
            position: fixed;
            bottom: 16px;
            left: 16px;
            right: 16px;
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
};
