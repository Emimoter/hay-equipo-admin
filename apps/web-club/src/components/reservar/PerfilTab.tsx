import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserMatchHistory, PlayerMatchRecord } from '../../services/firebase';

interface PerfilTabProps {
  onNavigateReservas: () => void;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
}

/* ────────────────────────────────────────────────────────────
   SVG Vector Icons — Zero Emojis
   ──────────────────────────────────────────────────────────── */
const Icons = {
  User: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Padel: ({ size = 15, color = '#fc1c46' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6" />
      <path d="M10 21h4" />
      <circle cx="10" cy="8" r="0.5" fill={color} />
      <circle cx="12" cy="10" r="0.5" fill={color} />
      <circle cx="14" cy="8" r="0.5" fill={color} />
    </svg>
  ),
  Football: ({ size = 15, color = '#3b82f6' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m6.3 15 3.7-2.7 4 0 3.7 2.7" />
      <path d="m8.5 7.5 3.5-2.5 3.5 2.5-1.3 4.2h-4.4z" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Star: ({ size = 14, color = '#facc15' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Lock: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
  Edit: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
  LogOut: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Shared input / select styles
   ──────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(76,76,76,0.5)',
  color: '#ffffff',
  padding: '11px 14px',
  fontSize: 13,
  fontFamily: 'Space Grotesk, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10.5,
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontWeight: 800,
  letterSpacing: '0.8px',
  marginBottom: 6,
};

/* ────────────────────────────────────────────────────────────
   PillButton — toggle button following dual-geometry rule
   ──────────────────────────────────────────────────────────── */
const PillButton = ({
  active,
  onClick,
  children,
  activeColor = '#fc1c46',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeColor?: string;
}) => {
  const isRed = activeColor === '#fc1c46';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '9px 14px',
        borderRadius: '9999px',
        border: active
          ? `1.5px solid ${activeColor}`
          : '1px solid rgba(255,255,255,0.12)',
        backgroundColor: active
          ? isRed ? 'rgba(252,28,70,0.18)' : 'rgba(59,130,246,0.18)'
          : '#141414',
        color: active ? '#ffffff' : '#94a3b8',
        fontSize: 11.5,
        fontWeight: 800,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.4px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'center' as const,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const PerfilTab: React.FC<PerfilTabProps> = ({
  onNavigateReservas,
  buyerName = 'Emiliano',
  buyerPhone = '+54 9 11 5555-0001',
}) => {
  const { user, userProfile, logout, openAuthModal, updateUserProfileData } = useAuth();

  /* ── Internal tab ── */
  const [activeTab, setActiveTab] = useState<'CUENTA' | 'DEPORTE'>('CUENTA');

  /* ── Form state ── */
  const [name, setName] = useState(userProfile?.name || user?.displayName || buyerName);
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [phone, setPhone] = useState(userProfile?.phone || user?.phoneNumber || buyerPhone);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [zone, setZone] = useState(userProfile?.zone || 'Mar del Plata');

  /* ── Sport selection ── */
  const initialSports = (userProfile?.sports && userProfile.sports.length > 0)
    ? userProfile.sports
    : (['PADEL', 'FUTBOL'] as ('PADEL' | 'FUTBOL')[]);
  const [selectedSports, setSelectedSports] = useState<('PADEL' | 'FUTBOL')[]>(initialSports);

  const toggleSport = (sport: 'PADEL' | 'FUTBOL') => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };
  const playsPadel = selectedSports.includes('PADEL');
  const playsFutbol = selectedSports.includes('FUTBOL');

  /* ── Pádel ── */
  const [padelCategory, setPadelCategory] = useState(userProfile?.padelCategory || '5ta');
  const [padelPosition, setPadelPosition] = useState<'DRIVE' | 'REVES' | 'INDISTINTO'>(userProfile?.padelPosition || 'REVES');
  const [padelHand, setPadelHand] = useState<'DIESTRO' | 'ZURDO'>(userProfile?.padelHand || 'DIESTRO');
  const [padelRacket, setPadelRacket] = useState(userProfile?.padelRacket || '');

  /* ── Fútbol ── */
  const [futbolPosition, setFutbolPosition] = useState<'ARQUERO' | 'DEFENSOR' | 'MEDIOCAMPISTA' | 'DELANTERO'>(userProfile?.futbolPosition || 'MEDIOCAMPISTA');
  const [futbolFormat, setFutbolFormat] = useState(userProfile?.futbolFormat || 'Fútbol 7');
  const [futbolFoot, setFutbolFoot] = useState<'DIESTRA' | 'ZURDA' | 'AMBOS'>(userProfile?.futbolFoot || 'DIESTRA');

  /* ── Match history ── */
  const [matchHistory, setMatchHistory] = useState<PlayerMatchRecord[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL'>('ALL');

  /* ── Save state ── */
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /* ── Sync from firebase ── */
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.nickname) setNickname(userProfile.nickname);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.bio) setBio(userProfile.bio);
      if (userProfile.zone) setZone(userProfile.zone);
      if (userProfile.padelCategory) setPadelCategory(userProfile.padelCategory);
      if (userProfile.padelPosition) setPadelPosition(userProfile.padelPosition);
      if (userProfile.padelHand) setPadelHand(userProfile.padelHand);
      if (userProfile.padelRacket) setPadelRacket(userProfile.padelRacket);
      if (userProfile.futbolPosition) setFutbolPosition(userProfile.futbolPosition);
      if (userProfile.futbolFormat) setFutbolFormat(userProfile.futbolFormat);
      if (userProfile.futbolFoot) setFutbolFoot(userProfile.futbolFoot);
      if (userProfile.sports && userProfile.sports.length > 0) setSelectedSports(userProfile.sports);
    } else if (user) {
      if (user.displayName) setName(user.displayName);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [userProfile, user]);

  useEffect(() => {
    async function loadHistory() {
      const uid = user?.uid || userProfile?.uid || 'usr-emi';
      const history = await getUserMatchHistory(uid, user?.email || undefined);
      setMatchHistory(history);
    }
    loadHistory();
  }, [user, userProfile]);

  const handleCopyPublicLink = () => {
    const uid = user?.uid || userProfile?.uid || 'mi-perfil';
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://hayequipo.com.ar'}/jugador/${uid}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const dataToSave = {
      name: name.trim(),
      nickname: nickname.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      zone: zone.trim(),
      sports: selectedSports,
      padelCategory,
      padelPosition,
      padelHand,
      padelRacket: padelRacket.trim(),
      futbolPosition,
      futbolFormat,
      futbolFoot,
      matchesPlayed: userProfile?.matchesPlayed ?? 24,
      fairPlayRating: userProfile?.fairPlayRating ?? 4.9,
      punctualityRate: userProfile?.punctualityRate ?? 98,
      verified: true,
    };
    try {
      if (user) {
        await updateUserProfileData(dataToSave);
      } else {
        localStorage.setItem('hay_equipo_user_profile', JSON.stringify({ ...dataToSave, uid: 'local' }));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredHistory = matchHistory.filter((m) => {
    if (historyFilter === 'PADEL') return m.sport === 'PADEL';
    if (historyFilter === 'FUTBOL') return m.sport === 'FUTBOL';
    return true;
  });

  /* ─────────────────────────────────────────────────────────── */

  if (!user) {
    return (
      <div style={{ maxWidth: 560, margin: '120px auto', padding: '0 24px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(252,28,70,0.3)',
            padding: '48px 36px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--color-crimson-signal)', marginBottom: 20 }}>
            <Icons.Lock size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', marginBottom: 10, margin: '0 0 10px' }}>
            Iniciá sesión para ver tu perfil
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: '0 auto 28px', maxWidth: 420 }}>
            Accedé con tu cuenta para configurar tu ficha deportiva, ver tu historial de partidos y gestionar tus reservas.
          </p>
          <button
            onClick={() => openAuthModal('Iniciá sesión para personalizar tu perfil deportivo')}
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px 32px',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(252,28,70,0.45)',
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════════
     AUTHENTICATED LAYOUT
     ═════════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px', fontFamily: 'Space Grotesk, sans-serif' }}>

      {/* ── IDENTITY CARD (always visible) ── */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(76,76,76,0.4)',
          padding: '24px 28px',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={name}
              referrerPolicy="no-referrer"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-crimson-signal)',
                boxShadow: '0 0 20px rgba(252,28,70,0.35)',
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                backgroundColor: 'var(--color-crimson-signal)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(252,28,70,0.4)',
                flexShrink: 0,
              }}
            >
              {name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>{name}</h2>
              <Icons.ShieldCheck size={16} color="#10b981" />
            </div>
            {user.email && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{user.email}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {playsPadel && (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: '9999px',
                    backgroundColor: 'rgba(252,28,70,0.1)', border: '1px solid rgba(252,28,70,0.3)',
                    fontSize: 10, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase',
                  }}
                >
                  <Icons.Padel size={10} color="#fc1c46" /> Pádel
                </span>
              )}
              {playsFutbol && (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: '9999px',
                    backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                    fontSize: 10, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase',
                  }}
                >
                  <Icons.Football size={10} color="#60a5fa" /> Fútbol
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>{userProfile?.matchesPlayed ?? 24}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Partidos</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{userProfile?.punctualityRate ?? 98}%</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Puntualidad</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-crimson-signal)' }}>{userProfile?.fairPlayRating ?? 4.9}</span>
              <Icons.Star size={12} color="#facc15" />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Fair Play</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
          <button
            onClick={onNavigateReservas}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '9999px',
              padding: '10px 18px',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icons.Calendar size={13} color="var(--color-crimson-signal)" />
            Mis Reservas
          </button>
          <button
            onClick={handleCopyPublicLink}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              padding: '10px 18px',
              color: '#94a3b8',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {copiedLink ? <Icons.Check size={13} color="#10b981" /> : <Icons.Share size={13} color="#94a3b8" />}
            {copiedLink ? 'Enlace copiado' : 'Compartir perfil'}
          </button>
          <button
            onClick={logout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '9999px',
              padding: '9px 18px',
              color: '#f87171',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icons.LogOut size={13} color="#f87171" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ── INTERNAL TABS ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(76,76,76,0.4)',
          marginBottom: 0,
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(76,76,76,0.4)',
          borderTop: 'none',
        }}
      >
        {([
          { id: 'CUENTA', label: 'Mi Cuenta' },
          { id: 'DEPORTE', label: 'Mi Deporte' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '14px 20px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-crimson-signal)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(76,76,76,0.4)',
          borderTop: 'none',
          padding: '28px',
          marginBottom: 2,
        }}
      >
        <form onSubmit={handleSave}>

          {/* ══ MI CUENTA ══ */}
          {activeTab === 'CUENTA' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Name + Nickname */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Apodo deportivo <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ej: Dibu, El Rayo" style={inputStyle} />
                </div>
              </div>

              {/* Phone + Zone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Zona habitual</label>
                  <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Ej: Centro, Mar del Plata" style={inputStyle} />
                </div>
              </div>

              {/* Bio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={labelStyle}>Sobre vos</label>
                  <span style={{ fontSize: 11, color: bio.length > 280 ? '#fc1c46' : '#94a3b8' }}>{bio.length}/300</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Contale a otros jugadores tu estilo, disponibilidad o cómo te gusta jugar..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '13px 32px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: isSaving ? 'wait' : 'pointer',
                    boxShadow: '0 0 18px rgba(252,28,70,0.4)',
                  }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {savedSuccess && (
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icons.Check size={14} color="#10b981" /> Guardado exitosamente
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ══ MI DEPORTE ══ */}
          {activeTab === 'DEPORTE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Sport selector */}
              <div>
                <label style={labelStyle}>Deportes que practicás</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleSport('PADEL')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 20px', borderRadius: '9999px',
                      backgroundColor: playsPadel ? 'rgba(252,28,70,0.16)' : '#121212',
                      border: playsPadel ? '1.5px solid #fc1c46' : '1px solid rgba(255,255,255,0.12)',
                      color: playsPadel ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer', fontWeight: 800, fontSize: 13, transition: 'all 0.15s ease',
                    }}
                  >
                    <Icons.Padel size={16} color={playsPadel ? '#fc1c46' : '#94a3b8'} />
                    Pádel
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: playsPadel ? '2px solid #fc1c46' : '2px solid rgba(255,255,255,0.25)',
                        backgroundColor: playsPadel ? '#fc1c46' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {playsPadel && <Icons.Check size={11} color="#ffffff" />}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSport('FUTBOL')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 20px', borderRadius: '9999px',
                      backgroundColor: playsFutbol ? 'rgba(59,130,246,0.16)' : '#121212',
                      border: playsFutbol ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.12)',
                      color: playsFutbol ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer', fontWeight: 800, fontSize: 13, transition: 'all 0.15s ease',
                    }}
                  >
                    <Icons.Football size={16} color={playsFutbol ? '#3b82f6' : '#94a3b8'} />
                    Fútbol
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: playsFutbol ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.25)',
                        backgroundColor: playsFutbol ? '#3b82f6' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {playsFutbol && <Icons.Check size={11} color="#ffffff" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* ─── PÁDEL block ─── */}
              {playsPadel && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4, borderTop: '1px solid rgba(252,28,70,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4, fontSize: 11, color: '#fc1c46', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                    <Icons.Padel size={14} color="#fc1c46" /> Ficha de Pádel
                  </div>

                  {/* Categoría */}
                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { id: '8va', label: '8va' },
                        { id: '7ma', label: '7ma' },
                        { id: '6ta', label: '6ta' },
                        { id: '5ta', label: '5ta' },
                        { id: '4ta', label: '4ta' },
                        { id: '3ra', label: '3ra' },
                        { id: '2da', label: '2da' },
                        { id: '1ra', label: '1ra' },
                      ].map((cat) => (
                        <PillButton key={cat.id} active={padelCategory.startsWith(cat.id)} onClick={() => setPadelCategory(cat.id)}>
                          {cat.label}
                        </PillButton>
                      ))}
                    </div>
                  </div>

                  {/* Posición */}
                  <div>
                    <label style={labelStyle}>Posición en cancha</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { id: 'DRIVE', label: 'Drive' },
                        { id: 'REVES', label: 'Revés' },
                        { id: 'INDISTINTO', label: 'Indistinto' },
                      ].map((pos) => (
                        <PillButton key={pos.id} active={padelPosition === pos.id} onClick={() => setPadelPosition(pos.id as any)}>
                          {pos.label}
                        </PillButton>
                      ))}
                    </div>
                  </div>

                  {/* Mano + Paleta */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
                    <div>
                      <label style={labelStyle}>Mano hábil</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <PillButton active={padelHand === 'DIESTRO'} onClick={() => setPadelHand('DIESTRO')}>Diestro</PillButton>
                        <PillButton active={padelHand === 'ZURDO'} onClick={() => setPadelHand('ZURDO')}>Zurdo</PillButton>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Paleta habitual <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                      <input type="text" value={padelRacket} onChange={(e) => setPadelRacket(e.target.value)} placeholder="Ej: Babolat Counter Viper" style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── FÚTBOL block ─── */}
              {playsFutbol && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4, borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4, fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                    <Icons.Football size={14} color="#60a5fa" /> Ficha de Fútbol
                  </div>

                  {/* Posición */}
                  <div>
                    <label style={labelStyle}>Posición en cancha</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['ARQUERO', 'DEFENSOR', 'MEDIOCAMPISTA', 'DELANTERO'].map((pos) => (
                        <PillButton key={pos} active={futbolPosition === pos} onClick={() => setFutbolPosition(pos as any)} activeColor="#3b82f6">
                          {pos.charAt(0) + pos.slice(1).toLowerCase()}
                        </PillButton>
                      ))}
                    </div>
                  </div>

                  {/* Formato + Pierna */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div>
                      <label style={labelStyle}>Formato preferido</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'].map((fmt) => (
                          <PillButton key={fmt} active={futbolFormat === fmt} onClick={() => setFutbolFormat(fmt)} activeColor="#3b82f6">
                            {fmt.replace('Fútbol ', 'F')}
                          </PillButton>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Pierna hábil</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[
                          { id: 'DIESTRA', label: 'Diestra' },
                          { id: 'ZURDA', label: 'Zurda' },
                          { id: 'AMBOS', label: 'Ambos' },
                        ].map((foot) => (
                          <PillButton key={foot.id} active={futbolFoot === foot.id} onClick={() => setFutbolFoot(foot.id as any)} activeColor="#3b82f6">
                            {foot.label}
                          </PillButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8, borderTop: '1px solid rgba(76,76,76,0.3)' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '13px 32px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: isSaving ? 'wait' : 'pointer',
                    boxShadow: '0 0 18px rgba(252,28,70,0.4)',
                  }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar ficha deportiva'}
                </button>
                {savedSuccess && (
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icons.Check size={14} color="#10b981" /> Guardado exitosamente
                  </span>
                )}
              </div>
            </div>
          )}

        </form>
      </div>

      {/* ══ HISTORIAL DE PARTIDOS ══ */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(76,76,76,0.4)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Partidos jugados <span style={{ color: '#94a3b8', fontWeight: 500 }}>({filteredHistory.length})</span>
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'PADEL', 'FUTBOL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                style={{
                  backgroundColor: historyFilter === f ? 'var(--color-crimson-signal)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid ' + (historyFilter === f ? 'var(--color-crimson-signal)' : 'rgba(255,255,255,0.1)'),
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {f === 'ALL' ? 'Todos' : f === 'PADEL' ? 'Pádel' : 'Fútbol'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: 13 }}>
              No hay partidos registrados en esta categoría.
            </div>
          ) : (
            filteredHistory.map((m) => (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#050505',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '9999px',
                      backgroundColor: m.sport === 'PADEL' ? 'rgba(252,28,70,0.1)' : 'rgba(59,130,246,0.1)',
                      border: '1px solid ' + (m.sport === 'PADEL' ? 'rgba(252,28,70,0.3)' : 'rgba(59,130,246,0.3)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {m.sport === 'PADEL' ? <Icons.Padel size={16} color="#fc1c46" /> : <Icons.Football size={16} color="#60a5fa" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                      {m.clubName} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {m.courtName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
                      <Icons.Calendar size={11} color="var(--color-crimson-signal)" />
                      <span>{m.date} {m.startTime} hs</span>
                      <span>·</span>
                      <span>{m.badgeLabel}</span>
                      {m.partnerInfo && <><span>·</span><span style={{ color: '#64748b' }}>{m.partnerInfo}</span></>}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 12px', borderRadius: '9999px',
                    backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}
                >
                  Completado
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
