import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getPublicPlayerProfile, getUserMatchHistory, PlayerMatchRecord } from '../../services/firebase';

const Icons = {
  ArrowLeft: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
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
  Calendar: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  MapPin: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

export default function JugadorPublicPage() {
  const router = useRouter();
  const { id } = router.query;

  const [player, setPlayer] = useState<any | null>(null);
  const [matchHistory, setMatchHistory] = useState<PlayerMatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL'>('ALL');

  useEffect(() => {
    if (!router.isReady) return;
    const uid = typeof id === 'string' ? id : 'default';

    async function loadData() {
      setLoading(true);
      try {
        const profile = await getPublicPlayerProfile(uid);
        if (profile) {
          setPlayer(profile);
        } else {
          // Fallback realistic demo profile if player is accessed directly
          setPlayer({
            uid,
            name: 'Emiliano Martínez',
            nickname: 'Dibu',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: 'Fanático del pádel competitivo de 5ta categoría y de los partidos de fútbol 7 entre semana. Busco partidos intensos con tercer tiempo.',
            zone: 'Palermo / Colegiales, CABA',
            sports: ['PADEL', 'FUTBOL'],
            padelCategory: '5ta Categoría',
            padelPosition: 'REVES',
            padelHand: 'DIESTRO',
            futbolFormat: 'Fútbol 7',
            futbolPosition: 'MEDIOCAMPISTA',
            futbolFoot: 'DIESTRA',
            matchesPlayed: 24,
            fairPlayRating: 4.9,
            punctualityRate: 98,
            verified: true,
          });
        }

        const history = await getUserMatchHistory(uid);
        setMatchHistory(history);
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router.isReady, id]);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fc1c46', fontSize: 13, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
          Cargando Ficha Deportiva...
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', padding: '100px 24px', textAlign: 'center' }}>
        <h2>Jugador no encontrado</h2>
        <Link href="/reservar" style={{ color: '#fc1c46', textTransform: 'uppercase', marginTop: 16, display: 'inline-block' }}>
          Volver a Reservas
        </Link>
      </div>
    );
  }

  const sports = player.sports || ['PADEL'];
  const playsPadel = sports.includes('PADEL');
  const playsFutbol = sports.includes('FUTBOL');

  const filteredHistory = matchHistory.filter((m) => {
    if (historyFilter === 'PADEL') return m.sport === 'PADEL';
    if (historyFilter === 'FUTBOL') return m.sport === 'FUTBOL';
    return true;
  });

  return (
    <>
      <Head>
        <title>{`${player.name} — Ficha Deportiva | Hay Equipo`}</title>
        <meta name="description" content={`Ficha oficial de ${player.name} en Hay Equipo. Categoría, posición, partidos jugados y estadísticas de juego.`} />
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', padding: '40px 20px 100px', fontFamily: 'Space Grotesk, sans-serif' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Top navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Link
              href="/reservar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#94a3b8',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Icons.ArrowLeft size={14} />
              <span>Volver a Hay Equipo</span>
            </Link>

            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                padding: '8px 18px',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
              }}
            >
              {copied ? <Icons.Check size={13} color="#10b981" /> : <Icons.Share size={13} color="#fc1c46" />}
              <span>{copied ? '¡Ficha Copiada!' : 'Compartir Ficha'}</span>
            </button>
          </div>

          {/* Header Label */}
          <div style={{ fontSize: 11, color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: 12 }}>
            PASAPORTE DEPORTIVO OFICIAL · VERIFICADO
          </div>

          {/* Main Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Identity Card */}
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 32,
              }}
            >
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                {player.photoURL ? (
                  <img
                    src={player.photoURL}
                    alt={player.name}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #fc1c46',
                      boxShadow: '0 0 24px rgba(252, 28, 70, 0.35)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      backgroundColor: '#fc1c46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 0 24px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                      {player.name}
                    </h1>
                    <Icons.ShieldCheck size={18} color="#10b981" />
                  </div>

                  {player.nickname && (
                    <div style={{ fontSize: 13, color: '#fc1c46', fontWeight: 700, marginTop: 2 }}>
                      "{player.nickname}"
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    <Icons.MapPin size={13} color="#fc1c46" />
                    <span>{player.zone || 'CABA / Buenos Aires'}</span>
                  </div>
                </div>
              </div>

              {/* Active Sports Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {playsPadel && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 16px',
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
                    <Icons.Padel size={14} color="#fc1c46" />
                    <span>PÁDEL {player.padelCategory || '5TA'} · {player.padelPosition || 'DRIVE'}</span>
                  </div>
                )}

                {playsFutbol && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 16px',
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
                    <Icons.Football size={14} color="#60a5fa" />
                    <span>{player.futbolFormat || 'FÚTBOL 7'} · {player.futbolPosition || 'MEDIOCAMPISTA'}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px 18px',
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#fc1c46', fontWeight: 800, marginBottom: 6 }}>
                  BIOGRAFÍA & ESTILO DE JUEGO
                </div>
                <p style={{ fontSize: 13.5, color: '#e2e8f0', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{player.bio || 'Jugador activo de la comunidad Hay Equipo.'}"
                </p>
              </div>

              {/* Tactical Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                {playsPadel && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Categoría de Pádel:</span>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{player.padelCategory || '5ta Categoría'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Posición de Pádel:</span>
                      <span style={{ color: '#fc1c46', fontWeight: 700 }}>{player.padelPosition || 'Drive (Derecha)'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Mano Hábil:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{player.padelHand === 'ZURDO' ? 'Zurdo' : 'Diestro'}</span>
                    </div>
                  </>
                )}

                {playsFutbol && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Posición en Fútbol:</span>
                      <span style={{ color: '#60a5fa', fontWeight: 700 }}>{player.futbolPosition || 'Mediocampista'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Formato Predilecto:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{player.futbolFormat || 'Fútbol 7'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                      <span style={{ color: '#94a3b8' }}>Pierna Hábil:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{player.futbolFoot || 'Diestra'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats & Actions Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Bento Numbers */}
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', fontWeight: 800, marginBottom: 16 }}>
                  MÉTRICAS DEL JUGADOR
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
                      {player.matchesPlayed ?? 24}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>
                      Partidos
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: '#fc1c46' }}>
                        {player.fairPlayRating ?? 4.9}
                      </span>
                      <Icons.Star size={14} color="#facc15" />
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>
                      Fair Play
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#050505', padding: '16px 8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
                      {player.punctualityRate ?? 98}%
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>
                      Puntualidad
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action card */}
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(252, 28, 70, 0.3)',
                  padding: 24,
                  boxShadow: '0 0 20px rgba(252, 28, 70, 0.1)',
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#fc1c46', fontWeight: 800, marginBottom: 8 }}>
                  ¿ARMAMOS PARTIDO?
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  Sumate o Invitalo a una Cancha
                </h3>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px' }}>
                  Reservá una cancha en Hay Equipo con pago dividido y compartile el enlace directo de la sala de espera.
                </p>
                <Link
                  href="/reservar"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: '#fc1c46',
                    color: '#ffffff',
                    padding: '14px 24px',
                    borderRadius: '9999px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    textDecoration: 'none',
                    boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                  }}
                >
                  Explorar Canchas Disponibles
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Match History */}
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#fc1c46', fontWeight: 800, marginBottom: 4 }}>
                  HISTORIAL OFICIAL
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'uppercase' }}>
                  Partidos Jugados
                </h2>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setHistoryFilter('ALL')}
                  style={{
                    backgroundColor: historyFilter === 'ALL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (historyFilter === 'ALL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.1)'),
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
                    backgroundColor: historyFilter === 'PADEL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (historyFilter === 'PADEL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.1)'),
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
                    backgroundColor: historyFilter === 'FUTBOL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (historyFilter === 'FUTBOL' ? '#fc1c46' : 'rgba(255, 255, 255, 0.1)'),
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

            {/* List of Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredHistory.map((m) => (
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
                        {m.clubName} · <span style={{ color: '#94a3b8', fontWeight: 500 }}>{m.courtName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icons.Calendar size={12} color="#fc1c46" />
                          {m.date} {m.startTime} hs
                        </span>
                        <span>·</span>
                        <span>{m.badgeLabel}</span>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
