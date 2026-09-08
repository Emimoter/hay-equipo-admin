import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Desktop sliding indicator
  const {
    containerRef: desktopContainerRef,
    setItemRef: setDesktopItemRef,
    indicatorStyle: desktopIndicatorStyle,
  } = useSlidingIndicator(activeTab);

  // Mobile dock sliding indicator
  const {
    containerRef: mobileContainerRef,
    setItemRef: setMobileItemRef,
    indicatorStyle: mobileIndicatorStyle,
  } = useSlidingIndicator(activeTab);

  const mobileDock = (
    <aside aria-label="Navegación móvil" className="reservar-mobile-dock">
      <div
        ref={mobileContainerRef as any}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '9999px',
          padding: '4px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(252, 28, 70, 0.15)',
          maxWidth: '460px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Mobile Sliding Indicator Pill (hay-equipo-system) */}
        <div
          style={{
            ...mobileIndicatorStyle,
            backgroundColor: 'var(--color-crimson-signal)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 0 18px rgba(252, 28, 70, 0.45)',
          }}
        />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={setMobileItemRef(tab.id)}
              onClick={() => onChangeTab(tab.id)}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '7px 2px',
                minHeight: '46px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-ash)',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.2px',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                flex: 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ position: 'relative' }}>
                {tab.icon(isActive ? '#ffffff' : 'var(--color-ash)', 17)}
                {tab.id === 'RESERVAS' && bookingCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: isActive ? '#ffffff' : 'var(--color-crimson-signal)',
                      color: isActive ? 'var(--color-crimson-signal)' : '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: '9999px',
                      lineHeight: '1.2',
                    }}
                  >
                    {bookingCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                {tab.id === 'RESERVAS' ? 'Reservas' : tab.id === 'FIJOS' ? 'Fijos' : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      {/* ────────────────────────────────────────────────────────────
          DESKTOP TABS (Barra superior elegante estilo Swiss Brutalist)
          ──────────────────────────────────────────────────────────── */}
      <nav
        ref={desktopContainerRef as any}
        aria-label="Navegación principal de reservas"
        className="reservar-desktop-nav"
        style={{
          position: 'relative',
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
        <div style={desktopIndicatorStyle} />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={setDesktopItemRef(tab.id)}
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
          MOBILE FLOATING DOCK (Teleportado al body para escapar el header)
          ──────────────────────────────────────────────────────────── */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(mobileDock, document.body)
        : null}

      <style jsx global>{`
        .reservar-desktop-nav {
          display: flex !important;
        }
        .reservar-mobile-dock {
          display: none !important;
        }
        @media (max-width: 960px) {
          .reservar-desktop-nav {
            display: none !important;
          }
          .reservar-mobile-dock {
            display: block !important;
            position: fixed !important;
            bottom: max(16px, env(safe-area-inset-bottom, 16px)) !important;
            left: 16px !important;
            right: 16px !important;
            margin: 0 auto !important;
            max-width: 460px !important;
            width: calc(100% - 32px) !important;
            z-index: 900 !important;
            pointer-events: auto !important;
          }
        }
      `}</style>
    </>
  );
};
