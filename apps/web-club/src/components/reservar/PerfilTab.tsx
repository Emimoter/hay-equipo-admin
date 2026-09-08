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
   Minimal SVG Vector Icons (Swiss Brutalist — Zero Emojis)
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
      <path d="M12 5V2" />
      <path d="m15.5 7.5 3.5-1.5" />
      <path d="m17.7 15 3.3 2" />
      <path d="M10 12.3 6.3 15" />
      <path d="m8.5 7.5-3.5-1.5" />
      <path d="m6.3 15-3.3 2" />
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
  Eye: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
};

export const PerfilTab: React.FC<PerfilTabProps> = ({
  onNavigateReservas,
  buyerName = 'Emiliano',
  buyerPhone = '+54 9 11 5555-0001',
  buyerEmail = 'emiliano@hayequipo.com.ar',
}) => {
  const { user, userProfile, logout, openAuthModal, updateUserProfileData } = useAuth();

  // Mode View State
  const [viewMode, setViewMode] = useState<'EDIT' | 'PUBLIC_PREVIEW'>('EDIT');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [name, setName] = useState(userProfile?.name || user?.displayName || buyerName);
  const [nickname, setNickname] = useState(userProfile?.nickname || 'Dibu');
  const [phone, setPhone] = useState(userProfile?.phone || user?.phoneNumber || buyerPhone);
  const [bio, setBio] = useState(userProfile?.bio || 'Juego pádel y fútbol todas las semanas. Me gusta jugar con intensidad, fair play y tercer tiempo obligatorio.');
  const [zone, setZone] = useState(userProfile?.zone || 'Palermo / Belgrano, CABA');

  // Sport selection state (Pádel, Fútbol o ambos con checkbox/toggle independiente)
  const initialSports = (userProfile?.sports && userProfile.sports.length > 0)
    ? userProfile.sports
    : (['PADEL', 'FUTBOL'] as ('PADEL' | 'FUTBOL')[]);
  const [selectedSports, setSelectedSports] = useState<('PADEL' | 'FUTBOL')[]>(initialSports);

  const toggleSport = (sport: 'PADEL' | 'FUTBOL') => {
    if (selectedSports.includes(sport)) {
      // Garantizar que siempre haya al menos 1 deporte seleccionado
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const playsPadel = selectedSports.includes('PADEL');
  const playsFutbol = selectedSports.includes('FUTBOL');

  // Padel specific
  const [padelCategory, setPadelCategory] = useState(userProfile?.padelCategory || '5ta Categoría (Intermedio)');
  const [padelPosition, setPadelPosition] = useState<'DRIVE' | 'REVES' | 'INDISTINTO'>(userProfile?.padelPosition || 'REVES');
  const [padelHand, setPadelHand] = useState<'DIESTRO' | 'ZURDO'>(userProfile?.padelHand || 'DIESTRO');
  const [padelRacket, setPadelRacket] = useState(userProfile?.padelRacket || 'Babolat Counter Viper');

  // Futbol specific
  const [futbolPosition, setFutbolPosition] = useState<'ARQUERO' | 'DEFENSOR' | 'MEDIOCAMPISTA' | 'DELANTERO'>(userProfile?.futbolPosition || 'MEDIOCAMPISTA');
  const [futbolFormat, setFutbolFormat] = useState(userProfile?.futbolFormat || 'Fútbol 7');
  const [futbolFoot, setFutbolFoot] = useState<'DIESTRA' | 'ZURDA' | 'AMBOS'>(userProfile?.futbolFoot || 'DIESTRA');

  // Match History
  const [matchHistory, setMatchHistory] = useState<PlayerMatchRecord[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL'>('ALL');

  // UI status
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

      if (userProfile.sports && userProfile.sports.length > 0) {
        setSelectedSports(userProfile.sports);
      }
    } else if (user) {
      if (user.displayName) setName(user.displayName);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [userProfile, user]);

  // Load user match history
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
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredHistory = matchHistory.filter((m) => {
    if (historyFilter === 'PADEL') return m.sport === 'PADEL';
    if (historyFilter === 'FUTBOL') return m.sport === 'FUTBOL';
    return true;
  });

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '120px 24px 80px', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* ── Encabezado Principal ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: 8 }}>
            05 / FICHA & PASAPORTE DEPORTIVO
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
            Mi Perfil de Jugador
          </h1>
        </div>

        {/* Switch de Modo: Edición / Previsualización Pública */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: 3,
            }}
          >
            <button
              onClick={() => setViewMode('EDIT')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: '9999px',
                backgroundColor: viewMode === 'EDIT' ? 'var(--color-crimson-signal)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Edit size={13} />
              <span>Editar Ficha</span>
            </button>

            <button
              onClick={() => setViewMode('PUBLIC_PREVIEW')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: '9999px',
                backgroundColor: viewMode === 'PUBLIC_PREVIEW' ? 'var(--color-crimson-signal)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Eye size={13} />
              <span>Cómo me ven otros</span>
            </button>
          </div>

          <button
            onClick={handleCopyPublicLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
            }}
          >
            {copiedLink ? <Icons.Check size={13} color="#10b981" /> : <Icons.Share size={13} color="var(--color-crimson-signal)" />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir Ficha'}</span>
          </button>
        </div>
      </div>

      {!user ? (
        /* ── Si NO está autenticado: Banner de Acceso Directo ── */
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(252, 28, 70, 0.3)',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(252, 28, 70, 0.1)',
          }}
        >
          <div style={{ color: 'var(--color-crimson-signal)', marginBottom: 16 }}>
            <Icons.Lock size={44} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 10 }}>
            Iniciá sesión para personalizar tu ficha deportiva
          </h2>
          <p style={{ color: 'var(--color-ash)', fontSize: 14, maxWidth: 500, margin: '0 auto 26px', lineHeight: 1.6 }}>
            Accedé con tu cuenta para configurar si jugás al pádel, al fútbol o a ambos deportes, tu categoría oficial, tu posición preferida y tu biografía de jugador.
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
              boxShadow: '0 0 20px rgba(252, 28, 70, 0.45)',
            }}
          >
            Iniciar Sesión / Registrarme
          </button>
        </div>
      ) : viewMode === 'PUBLIC_PREVIEW' ? (
        /* ═══════════════════════════════════════════════════════════
           MODO: VISTA PÚBLICA (CÓMO VEN OTROS TU PERFIL)
           ═══════════════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'rgba(252, 28, 70, 0.08)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ffffff' }}>
              <Icons.Eye size={15} color="var(--color-crimson-signal)" />
              <span><strong>Previsualización en vivo:</strong> Así es como otros jugadores de Hay Equipo ven tu tarjeta deportiva en las salas de espera, reservas y búsquedas.</span>
            </div>
            <button
              onClick={() => setViewMode('EDIT')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #fc1c46',
                color: '#fc1c46',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Volver al Editor
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Tarjeta Pasaporte Deportivo */}
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 32,
              }}
            >
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-crimson-signal)',
                      boxShadow: '0 0 24px rgba(252, 28, 70, 0.35)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-crimson-signal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 0 24px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                      {name}
                    </h2>
                    <Icons.ShieldCheck size={18} color="#10b981" />
                  </div>
                  {nickname && (
                    <div style={{ fontSize: 13, color: 'var(--color-crimson-signal)', fontWeight: 700, marginTop: 2 }}>
                      "{nickname}"
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ash)', marginTop: 4 }}>
                    <Icons.MapPin size={12} color="var(--color-crimson-signal)" />
                    <span>{zone}</span>
                  </div>
                </div>
              </div>

              {/* Badges de Deportes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {playsPadel && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(252, 28, 70, 0.12)',
                      border: '1px solid rgba(252, 28, 70, 0.4)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    <Icons.Padel size={13} color="#fc1c46" />
                    <span>PÁDEL {padelCategory} · {padelPosition}</span>
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
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    <Icons.Football size={13} color="#60a5fa" />
                    <span>{futbolFormat} · {futbolPosition}</span>
                  </div>
                )}
              </div>

              {/* Biografía */}
              {bio && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '16px 18px',
                    marginBottom: 24,
                  }}
                >
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-crimson-signal)', fontWeight: 800, marginBottom: 6 }}>
                    ESTILO & BIOGRAFÍA DEPORTIVA
                  </div>
                  <p style={{ fontSize: 13.5, color: '#e2e8f0', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{bio}"
                  </p>
                </div>
              )}

              {/* Bento Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-frost)' }}>
                    {userProfile?.matchesPlayed ?? 24}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>
                    Partidos
                  </div>
                </div>

                <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-crimson-signal)' }}>
                      {userProfile?.fairPlayRating ?? 4.9}
                    </span>
                    <Icons.Star size={13} color="#facc15" />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>
                    Fair Play
                  </div>
                </div>

                <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
                    {userProfile?.punctualityRate ?? 98}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>
                    Puntualidad
                  </div>
                </div>
              </div>

              {/* Ficha Táctica Resumen */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                {playsPadel && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                    <span style={{ color: 'var(--color-ash)' }}>Pádel:</span>
                    <span style={{ color: 'var(--color-frost)', fontWeight: 700 }}>{padelCategory} · {padelPosition} ({padelHand === 'ZURDO' ? 'Zurdo' : 'Diestro'})</span>
                  </div>
                )}
                {playsFutbol && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                    <span style={{ color: 'var(--color-ash)' }}>Fútbol:</span>
                    <span style={{ color: 'var(--color-frost)', fontWeight: 700 }}>{futbolFormat} · {futbolPosition} (Pierna {futbolFoot})</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ash)' }}>Contacto Verificado:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>WhatsApp Confirmado</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Compartir */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(252, 28, 70, 0.3)',
                  padding: 28,
                  boxShadow: '0 0 24px rgba(252, 28, 70, 0.1)',
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-crimson-signal)', fontWeight: 800, marginBottom: 8 }}>
                  ENLACE PÚBLICO
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  Compartí tu Ficha con tus Equipos
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
                  Cualquier compañero o rival con tu enlace puede ver tu historial deportivo, nivel y posición táctica sin necesidad de instalar la app.
                </p>
                <button
                  onClick={handleCopyPublicLink}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '14px 24px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
                  }}
                >
                  {copiedLink ? <Icons.Check size={14} color="#ffffff" /> : <Icons.Share size={14} color="#ffffff" />}
                  <span>{copiedLink ? '¡Enlace Copiado al Portapapeles!' : 'Copiar Enlace de Perfil'}</span>
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 28,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 12px', textTransform: 'uppercase' }}>
                  Gestión Rápida
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={onNavigateReservas}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '9999px',
                      padding: '12px 18px',
                      color: 'var(--color-frost)',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                    <span>Ver Mis Reservas Activas</span>
                  </button>

                  <button
                    onClick={() => setViewMode('EDIT')}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(252, 28, 70, 0.4)',
                      borderRadius: '9999px',
                      padding: '12px 18px',
                      color: 'var(--color-crimson-signal)',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Icons.Edit size={14} color="var(--color-crimson-signal)" />
                    <span>Modificar Mis Datos</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           MODO: EDITOR DE PERFIL (PERSONALIZACIÓN COMPLETA)
           ═══════════════════════════════════════════════════════════ */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Columna Izquierda: Tarjeta de Identidad & Estado Actual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                padding: '28px',
              }}
            >
              {/* Avatar & Nombre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-crimson-signal)',
                      boxShadow: '0 0 20px rgba(252, 28, 70, 0.35)',
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
                      letterSpacing: '1px',
                      boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 4px' }}>
                    {name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--color-ash)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>Jugador Verificado · Platino</span>
                  </div>
                  {user.email && (
                    <div style={{ fontSize: 11, color: 'var(--color-graphite)', marginTop: 2 }}>
                      {user.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Badges de Deportes en Vivo */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {playsPadel && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(252, 28, 70, 0.12)',
                      border: '1px solid rgba(252, 28, 70, 0.35)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Icons.Padel size={12} color="#fc1c46" />
                    PÁDEL {padelCategory} · {padelPosition}
                  </span>
                )}
                {playsFutbol && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Icons.Football size={12} color="#60a5fa" />
                    {futbolFormat} · {futbolPosition}
                  </span>
                )}
              </div>

              {/* Estadísticas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px',
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-frost)' }}>
                    {userProfile?.matchesPlayed ?? 24}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Partidos</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>
                    {userProfile?.punctualityRate ?? 98}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Puntualidad</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-crimson-signal)' }}>
                    {userProfile?.fairPlayRating ?? 4.9}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Fair Play</div>
                </div>
              </div>

              {/* Botón Ver Reservas */}
              <button
                onClick={onNavigateReservas}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-frost)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '9999px',
                  padding: '12px',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                <span>Ver Mis Reservas Activas</span>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '9999px',
                  padding: '11px',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  marginTop: 12,
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Personalización Completa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                padding: '28px',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 18px', textTransform: 'uppercase' }}>
                Personalizar Ficha Deportiva
              </h3>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* 1. SELECCIÓN DE DEPORTES */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.8px' }}>
                      ¿Qué deporte jugás?
                    </label>
                    <span style={{ fontSize: 10.5, color: 'var(--color-ash)', opacity: 0.7 }}>
                      Podés tildar uno o ambos
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-ash)', marginBottom: 12, opacity: 0.85 }}>
                    Seleccioná los deportes que practicás para configurar tu nivel y posición táctica:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {/* Botón Tildar Pádel */}
                    <button
                      type="button"
                      onClick={() => toggleSport('PADEL')}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '9999px',
                        backgroundColor: playsPadel ? 'rgba(252, 28, 70, 0.16)' : '#121212',
                        border: playsPadel ? '1.5px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: playsPadel ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        boxShadow: playsPadel ? '0 0 18px rgba(252, 28, 70, 0.3)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: playsPadel ? '#fc1c46' : 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icons.Padel size={16} color={playsPadel ? '#ffffff' : '#94a3b8'} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Pádel
                          </div>
                          <div style={{ fontSize: 10, color: playsPadel ? '#fca5a5' : '#64748b', fontWeight: 600 }}>
                            {playsPadel ? 'Ficha activa' : 'Tildar para activar'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: playsPadel ? '2px solid #fc1c46' : '2px solid rgba(255, 255, 255, 0.25)',
                          backgroundColor: playsPadel ? '#fc1c46' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {playsPadel && <Icons.Check size={13} color="#ffffff" />}
                      </div>
                    </button>

                    {/* Botón Tildar Fútbol */}
                    <button
                      type="button"
                      onClick={() => toggleSport('FUTBOL')}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '9999px',
                        backgroundColor: playsFutbol ? 'rgba(59, 130, 246, 0.16)' : '#121212',
                        border: playsFutbol ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: playsFutbol ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        boxShadow: playsFutbol ? '0 0 18px rgba(59, 130, 246, 0.3)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: playsFutbol ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icons.Football size={16} color={playsFutbol ? '#ffffff' : '#94a3b8'} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Fútbol
                          </div>
                          <div style={{ fontSize: 10, color: playsFutbol ? '#93c5fd' : '#64748b', fontWeight: 600 }}>
                            {playsFutbol ? 'Ficha activa' : 'Tildar para activar'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: playsFutbol ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.25)',
                          backgroundColor: playsFutbol ? '#3b82f6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {playsFutbol && <Icons.Check size={13} color="#ffffff" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. BLOQUE PÁDEL (CONDICIONAL) */}
                {playsPadel && (
                  <div
                    style={{
                      backgroundColor: 'rgba(252, 28, 70, 0.04)',
                      border: '1px solid rgba(252, 28, 70, 0.25)',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#fc1c46', textTransform: 'uppercase', fontWeight: 800 }}>
                      <Icons.Padel size={15} color="#fc1c46" />
                      <span>Ficha de Pádel</span>
                    </div>

                    {/* Categoría Oficial de Pádel */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <label style={{ fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px' }}>
                          Categoría Oficial
                        </label>
                        <span style={{ fontSize: 11, color: '#fc1c46', fontWeight: 800 }}>
                          {padelCategory}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 8 }}>
                        {[
                          { id: '8va', label: '8va Cat.', desc: 'Iniciación' },
                          { id: '7ma', label: '7ma Cat.', desc: 'Principiante' },
                          { id: '6ta', label: '6ta Cat.', desc: 'Intermedio B' },
                          { id: '5ta', label: '5ta Cat.', desc: 'Intermedio' },
                          { id: '4ta', label: '4ta Cat.', desc: 'Intermedio A' },
                          { id: '3ra', label: '3ra Cat.', desc: 'Avanzado' },
                          { id: '2da', label: '2da Cat.', desc: 'Competitivo' },
                          { id: '1ra', label: '1ra Cat.', desc: 'Profesional' },
                        ].map((cat) => {
                          const isSelected = padelCategory.startsWith(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setPadelCategory(`${cat.id} Categoría (${cat.desc})`)}
                              style={{
                                padding: '9px 8px',
                                borderRadius: '9999px',
                                border: isSelected ? '1.5px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.12)',
                                backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.22)' : '#141414',
                                color: isSelected ? '#ffffff' : '#94a3b8',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 0 12px rgba(252, 28, 70, 0.35)' : 'none',
                              }}
                            >
                              <div style={{ fontSize: 11.5, fontWeight: 800 }}>{cat.label}</div>
                              <div style={{ fontSize: 9.5, opacity: isSelected ? 0.95 : 0.6 }}>{cat.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Posición en Cancha */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                        Posición en Cancha
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                        {[
                          { id: 'DRIVE', label: 'Drive', desc: 'Lado Derecho' },
                          { id: 'REVES', label: 'Revés', desc: 'Lado Izquierdo' },
                          { id: 'INDISTINTO', label: 'Indistinto', desc: 'Ambos Lados' },
                        ].map((pos) => {
                          const isSelected = padelPosition === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setPadelPosition(pos.id as any)}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '9999px',
                                border: isSelected ? '1.5px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.12)',
                                backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.22)' : '#141414',
                                color: isSelected ? '#ffffff' : '#94a3b8',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 0 12px rgba(252, 28, 70, 0.35)' : 'none',
                              }}
                            >
                              <div style={{ fontSize: 12, fontWeight: 800 }}>{pos.label}</div>
                              <div style={{ fontSize: 10, opacity: isSelected ? 0.95 : 0.6 }}>{pos.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mano Hábil y Paleta */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                          Mano Hábil
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            { id: 'DIESTRO', label: 'Diestro' },
                            { id: 'ZURDO', label: 'Zurdo' },
                          ].map((hand) => {
                            const isSelected = padelHand === hand.id;
                            return (
                              <button
                                key={hand.id}
                                type="button"
                                onClick={() => setPadelHand(hand.id as any)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '9999px',
                                  border: isSelected ? '1.5px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.12)',
                                  backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.22)' : '#141414',
                                  color: isSelected ? '#ffffff' : '#94a3b8',
                                  fontSize: 11.5,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isSelected ? '0 0 12px rgba(252, 28, 70, 0.35)' : 'none',
                                }}
                              >
                                {hand.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                          Paleta Habitual (Opcional)
                        </label>
                        <input
                          type="text"
                          value={padelRacket}
                          onChange={(e) => setPadelRacket(e.target.value)}
                          placeholder="Ej: Babolat Counter Viper"
                          style={{
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            padding: '10px 14px',
                            fontSize: 12,
                            fontFamily: 'Space Grotesk, sans-serif',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BLOQUE FÚTBOL (CONDICIONAL) */}
                {playsFutbol && (
                  <div
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.04)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#60a5fa', textTransform: 'uppercase', fontWeight: 800 }}>
                      <Icons.Football size={15} color="#60a5fa" />
                      <span>Ficha de Fútbol</span>
                    </div>

                    {/* Posición Táctica */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                        Posición en Cancha
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        {[
                          { id: 'ARQUERO', label: 'Arquero' },
                          { id: 'DEFENSOR', label: 'Defensor' },
                          { id: 'MEDIOCAMPISTA', label: 'Mediocampista' },
                          { id: 'DELANTERO', label: 'Delantero' },
                        ].map((pos) => {
                          const isSelected = futbolPosition === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setFutbolPosition(pos.id as any)}
                              style={{
                                padding: '10px 8px',
                                borderRadius: '9999px',
                                border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.22)' : '#141414',
                                color: isSelected ? '#ffffff' : '#94a3b8',
                                fontSize: 11.5,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.35)' : 'none',
                              }}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Formato y Pierna Hábil */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                          Formato Predilecto
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                          {['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'].map((fmt) => {
                            const isSelected = futbolFormat === fmt;
                            return (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => setFutbolFormat(fmt)}
                                style={{
                                  padding: '10px 4px',
                                  borderRadius: '9999px',
                                  border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.22)' : '#141414',
                                  color: isSelected ? '#ffffff' : '#94a3b8',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.35)' : 'none',
                                }}
                              >
                                {fmt.replace('Fútbol ', 'F')}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.6px', marginBottom: 8 }}>
                          Pierna Hábil
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                          {[
                            { id: 'DIESTRA', label: 'Diestra' },
                            { id: 'ZURDA', label: 'Zurda' },
                            { id: 'AMBOS', label: 'Ambos' },
                          ].map((foot) => {
                            const isSelected = futbolFoot === foot.id;
                            return (
                              <button
                                key={foot.id}
                                type="button"
                                onClick={() => setFutbolFoot(foot.id as any)}
                                style={{
                                  padding: '10px 6px',
                                  borderRadius: '9999px',
                                  border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.22)' : '#141414',
                                  color: isSelected ? '#ffffff' : '#94a3b8',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.35)' : 'none',
                                }}
                              >
                                {foot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BIOGRAFÍA Y DATOS DE CONTACTO */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Biografía Deportiva
                    </label>
                    <span style={{ fontSize: 11, color: bio.length > 280 ? '#fc1c46' : 'var(--color-ash)' }}>
                      {bio.length} / 300
                    </span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 300))}
                    rows={3}
                    placeholder="Contale a otros jugadores tu estilo, disponibilidad de horarios o con qué ritmo te gusta jugar..."
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(76, 76, 76, 0.4)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'Space Grotesk, sans-serif',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Apodo Deportivo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ej: Dibu, El Rayo"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Zona Habitual
                    </label>
                    <input
                      type="text"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      placeholder="Ej: Palermo / Belgrano"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: '#ffffff',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                      }}
                    />
                  </div>
                </div>

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '14px 28px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: isSaving ? 'wait' : 'pointer',
                    marginTop: 8,
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
                  }}
                >
                  {isSaving ? 'Guardando Cambios...' : 'Guardar Preferencias'}
                </button>

                {savedSuccess && (
                  <div style={{ fontSize: 12, color: '#10b981', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Icons.Check size={14} color="#10b981" />
                    <span>Tu ficha deportiva fue actualizada exitosamente</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN: HISTORIAL DE PARTIDOS JUGADOS
          ═══════════════════════════════════════════════════════════ */}
      {user && (
        <div
          style={{
            marginTop: 36,
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--color-crimson-signal)', fontWeight: 800, marginBottom: 4 }}>
                REGISTRO OFICIAL
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                Mis Partidos Jugados ({filteredHistory.length})
              </h2>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setHistoryFilter('ALL')}
                style={{
                  backgroundColor: historyFilter === 'ALL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (historyFilter === 'ALL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.1)'),
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setHistoryFilter('PADEL')}
                style={{
                  backgroundColor: historyFilter === 'PADEL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (historyFilter === 'PADEL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.1)'),
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Pádel
              </button>
              <button
                onClick={() => setHistoryFilter('FUTBOL')}
                style={{
                  backgroundColor: historyFilter === 'FUTBOL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (historyFilter === 'FUTBOL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.1)'),
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Fútbol
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-ash)', fontSize: 13 }}>
                No tenés partidos registrados en esta categoría aún.
              </div>
            ) : (
              filteredHistory.map((m) => (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: '#050505',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '9999px',
                        backgroundColor: m.sport === 'PADEL' ? 'rgba(252, 28, 70, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid ' + (m.sport === 'PADEL' ? 'rgba(252, 28, 70, 0.3)' : 'rgba(59, 130, 246, 0.3)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {m.sport === 'PADEL' ? <Icons.Padel size={18} color="#fc1c46" /> : <Icons.Football size={18} color="#60a5fa" />}
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                        {m.clubName} · <span style={{ color: 'var(--color-ash)', fontWeight: 500 }}>{m.courtName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--color-ash)', marginTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icons.Calendar size={12} color="var(--color-crimson-signal)" />
                          {m.date} {m.startTime} hs
                        </span>
                        <span>·</span>
                        <span>{m.badgeLabel}</span>
                        {m.partnerInfo && (
                          <>
                            <span>·</span>
                            <span style={{ color: 'var(--color-graphite)' }}>{m.partnerInfo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                      }}
                    >
                      COMPLETADO
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
