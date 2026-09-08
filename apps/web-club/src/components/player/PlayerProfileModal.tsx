import React, { useState } from 'react';

export interface PlayerPublicData {
  uid?: string;
  name: string;
  nickname?: string;
  photoURL?: string;
  bio?: string;
  zone?: string;
  sports?: ('PADEL' | 'FUTBOL')[];
  padelCategory?: string;
  padelPosition?: string;
  padelHand?: string;
  padelRacket?: string;
  futbolFormat?: string;
  futbolPosition?: string;
  futbolFoot?: string;
  matchesPlayed?: number;
  fairPlayRating?: number;
  punctualityRate?: number;
  verified?: boolean;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerPublicData | null;
}

/* ────────────────────────────────────────────────────────────
   Minimal SVG Vector Icons (Swiss Brutalist — Zero Emojis)
   ──────────────────────────────────────────────────────────── */
const Icons = {
  Close: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ShieldCheck: ({ size = 14, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Padel: ({ size = 14, color = '#fc1c46' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6" />
      <path d="M10 21h4" />
      <circle cx="10" cy="8" r="0.5" fill={color} />
      <circle cx="12" cy="10" r="0.5" fill={color} />
      <circle cx="14" cy="8" r="0.5" fill={color} />
    </svg>
  ),
  Football: ({ size = 14, color = '#3b82f6' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m6.3 15 3.7-2.7 4 0 3.7 2.7" />
      <path d="m8.5 7.5 3.5-2.5 3.5 2.5-1.3 4.2h-4.4z" />
      <path d="M12 5V2" />
      <path d="m15.5 7.5 3.5-1.5" />
      <path d="m17.7 15 3.3 2" />
      <path d="M10 12.3 6.3 15" />
      <path d="m8.5 7.5-3.5-1.5" />
      <path d="m6.3 15-3.3 2" />
    </svg>
  ),
  Star: ({ size = 14, color = '#facc15' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Share: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  MapPin: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ isOpen, onClose, player }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !player) return null;

  const sports = player.sports || ['PADEL'];
  const playsPadel = sports.includes('PADEL');
  const playsFutbol = sports.includes('FUTBOL');

  const handleCopyLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://hayequipo.com.ar'}/jugador/${player.uid || 'perfil'}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(252, 28, 70, 0.12)',
          padding: 0,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar with Close */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#050505',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fc1c46' }} />
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#94a3b8', fontWeight: 700 }}>
              FICHA DEPORTIVA OFICIAL
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icons.Close size={15} />
          </button>
        </div>

        <div style={{ padding: '24px 22px' }}>
          {/* Hero Identity */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
            {player.photoURL ? (
              <img
                src={player.photoURL}
                alt={player.name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #fc1c46',
                  boxShadow: '0 0 20px rgba(252, 28, 70, 0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#fc1c46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(252, 28, 70, 0.35)',
                }}
              >
                {player.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                  {player.name}
                </h3>
                <Icons.ShieldCheck size={16} color="#10b981" />
              </div>

              {player.nickname && (
                <div style={{ fontSize: 12, color: '#fc1c46', fontWeight: 600, marginBottom: 4 }}>
                  "{player.nickname}"
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                <Icons.MapPin size={12} color="#fc1c46" />
                <span>{player.zone || 'CABA / Buenos Aires'}</span>
              </div>
            </div>
          </div>

          {/* Badges de Deportes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {playsPadel && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(252, 28, 70, 0.12)',
                  border: '1px solid rgba(252, 28, 70, 0.35)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                <Icons.Padel size={13} color="#fc1c46" />
                <span>PÁDEL {player.padelCategory || '5TA'} · {player.padelPosition || 'DRIVE'}</span>
              </div>
            )}

            {playsFutbol && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                <Icons.Football size={13} color="#60a5fa" />
                <span>{player.futbolFormat || 'FÚTBOL 7'} · {player.futbolPosition || 'MEDIOCAMPISTA'}</span>
              </div>
            )}
          </div>

          {/* Biografía */}
          {player.bio && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: '#fc1c46', fontWeight: 700, marginBottom: 4 }}>
                ESTILO & BIOGRAFÍA
              </div>
              <p style={{ fontSize: 13, color: '#e2e8f0', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                "{player.bio}"
              </p>
            </div>
          )}

          {/* Bento Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                {player.matchesPlayed ?? 24}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 3 }}>
                Partidos
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fc1c46' }}>
                  {player.fairPlayRating ?? 4.9}
                </span>
                <Icons.Star size={13} color="#facc15" />
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 3 }}>
                Fair Play
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#050505',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>
                {player.punctualityRate ?? 98}%
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 3 }}>
                Puntualidad
              </div>
            </div>
          </div>

          {/* Ficha Táctica Detallada */}
          <div
            style={{
              backgroundColor: '#070707',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px',
              marginBottom: 20,
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {playsPadel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
                <span style={{ color: '#94a3b8' }}>Mano Hábil Pádel:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{player.padelHand === 'ZURDO' ? 'Zurdo' : 'Diestro'}</span>
              </div>
            )}
            {playsFutbol && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
                <span style={{ color: '#94a3b8' }}>Pierna Hábil Fútbol:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{player.futbolFoot || 'Diestra'}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Comunidad:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Miembro Verificado Hay Equipo</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '9999px',
                padding: '12px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {copied ? <Icons.Check size={14} color="#10b981" /> : <Icons.Share size={14} color="#fc1c46" />}
              <span>{copied ? 'Enlace Copiado' : 'Copiar Ficha'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#fc1c46',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(252, 28, 70, 0.35)',
              }}
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
