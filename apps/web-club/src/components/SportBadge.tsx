import React from 'react';

export type ClubSportCategory = 'PADEL' | 'FUTBOL' | 'BOTH';

export interface SportBadgeProps {
  sports?: string[];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Helper para determinar la categoría deportiva de un club
 */
export function getClubSportCategory(sports?: string[]): ClubSportCategory {
  if (!sports || sports.length === 0) return 'BOTH';
  const upper = sports.map((s) => s.toUpperCase());
  const hasPadel = upper.some((s) => s.includes('PADEL'));
  const hasFutbol = upper.some((s) => s.includes('FUTBOL'));

  if (hasPadel && hasFutbol) return 'BOTH';
  if (hasPadel) return 'PADEL';
  if (hasFutbol) return 'FUTBOL';
  return 'BOTH';
}

/**
 * Clean SVG Vector Icons — Strict Zero Unicode Emoji Law (hay-equipo-system)
 */
export const SportBadgeIcons = {
  Padel: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M15 15l6 6" />
      <path d="M8 10h4" />
      <path d="M10 8v4" />
      <circle cx="18" cy="6" r="2" />
    </svg>
  ),
  Futbol: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m6.7 15 2.8-2.2 3 1.2 1.8 3.5" />
      <path d="m17.3 15-2.8-2.2-3 1.2-1.8 3.5" />
      <path d="m12 6.5 2.5 3-1 3.5h-3l-1-3.5z" />
    </svg>
  ),
};

/**
 * SportBadge Component
 * Renderiza la distinción deportiva oficial con tokens de color y píldoras al 100%
 */
export const SportBadge: React.FC<SportBadgeProps> = ({
  sports,
  size = 'md',
  showIcon = true,
  style = {},
  className = '',
}) => {
  const category = getClubSportCategory(sports);

  // Dimensiones según tamaño (Pills)
  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '9.5px',
      iconSize: 10,
      gap: '4px',
    },
    md: {
      padding: '4px 10px',
      fontSize: '11px',
      iconSize: 12,
      gap: '6px',
    },
    lg: {
      padding: '6px 14px',
      fontSize: '12px',
      iconSize: 14,
      gap: '7px',
    },
  }[size];

  // Paleta semántica estricta (hay-equipo-system)
  let badgeConfig = {
    label: 'SOLO PÁDEL',
    color: 'var(--color-crimson-signal, #fc1c46)',
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    border: '1px solid rgba(252, 28, 70, 0.35)',
    boxShadow: '0 0 10px rgba(252, 28, 70, 0.15)',
    icons: [<SportBadgeIcons.Padel key="padel" size={sizeStyles.iconSize} color="#fc1c46" />],
  };

  if (category === 'FUTBOL') {
    badgeConfig = {
      label: 'SOLO FÚTBOL',
      color: 'var(--color-emerald, #10b981)',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)',
      icons: [<SportBadgeIcons.Futbol key="futbol" size={sizeStyles.iconSize} color="#10b981" />],
    };
  } else if (category === 'BOTH') {
    badgeConfig = {
      label: 'PÁDEL & FÚTBOL',
      color: 'var(--color-amber, #f59e0b)',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)',
      icons: [
        <SportBadgeIcons.Padel key="padel-both" size={sizeStyles.iconSize} color="#f59e0b" />,
        <SportBadgeIcons.Futbol key="futbol-both" size={sizeStyles.iconSize} color="#f59e0b" />,
      ],
    };
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: badgeConfig.color,
        backgroundColor: badgeConfig.backgroundColor,
        border: badgeConfig.border,
        borderRadius: 'var(--radius-full, 9999px)',
        boxShadow: badgeConfig.boxShadow,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        verticalAlign: 'middle',
        backdropFilter: 'blur(6px)',
        ...style,
      }}
    >
      {showIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          {badgeConfig.icons}
        </span>
      )}
      <span>{badgeConfig.label}</span>
    </span>
  );
};
