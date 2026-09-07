import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  BookingRecord,
  getBookingBySplitTokenFirestore,
  listenBookingFirestore,
} from '../../services/firebase';

/* ────────────────────────────────────────────────────────────
   Minimal SVG Vector Icons (Swiss Brutalist — Zero Emojis)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  CheckCircle: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Clock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  WhatsApp: ({ size = 16, color = '#25D366' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  Copy: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Lock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  ArrowUpRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SplitInvitationPage() {
  const router = useRouter();
  const { token } = router.query;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Player payment form
  const [playerName, setPlayerName] = useState<string>('');
  const [playerPhone, setPlayerPhone] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [hasPaidSuccessfully, setHasPaidSuccessfully] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady || !token || typeof token !== 'string') return;

    let unsubscribe: (() => void) | undefined;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getBookingBySplitTokenFirestore(token as string);
        if (data) {
          setBooking(data);
          // Subscribe to real-time updates
          unsubscribe = listenBookingFirestore(data.id, (updated) => {
            if (updated) setBooking(updated);
          });
        } else {
          setError('No encontramos un partido activo asociado a este enlace.');
        }
      } catch (err: any) {
        console.error('Error fetching split booking:', err);
        setError('Error al consultar el partido.');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router.isReady, token]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePayShare = async () => {
    if (!booking) return;
    setPayError(null);

    if (!playerName.trim()) {
      setPayError('Por favor ingresá tu nombre para registrar tu cupo.');
      return;
    }

    setIsPaying(true);

    try {
      const res = await fetch('/api/bookings/pay-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          participantName: playerName.trim(),
          phone: playerPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No se pudo registrar el pago.');
      }

      setHasPaidSuccessfully(true);

      // If Mercado Pago preference returned, redirect or show confirmation
      if (data.checkout?.initPoint) {
        window.location.href = data.checkout.initPoint;
      }
    } catch (err: any) {
      console.error('Error paying split:', err);
      setPayError(err.message || 'Error al procesar el pago.');
    } finally {
      setIsPaying(false);
    }
  };

  const perPlayerAmount = booking
    ? Math.round(booking.totalPrice / (booking.splitPlayers || 4))
    : 0;

  const paidCount = booking ? (booking.paidPlayersCount || 1) : 0;
  const totalCount = booking ? (booking.splitPlayers || 4) : 4;
  const progressPercent = Math.min(100, Math.round((paidCount / totalCount) * 100));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070707', color: '#EDEDED', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      <Head>
        <title>{booking ? `Invitación de Partido · ${booking.clubName}` : 'Pago Dividido · HAY EQUIPO?'}</title>
        <meta name="description" content="Aboná tu cuota de cancha para el partido directamente con Mercado Pago." />
      </Head>

      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(76, 76, 76, 0.35)',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a href="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>HAY EQUIPO?</span>
          <span style={{ fontSize: 11, padding: '2px 10px', backgroundColor: 'rgba(252, 28, 70, 0.2)', color: 'var(--color-crimson-signal)', border: '1px solid rgba(252, 28, 70, 0.4)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            SPLIT
          </span>
        </a>

        <a
          href="/reservar"
          style={{
            fontSize: 12,
            color: 'var(--color-ash)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Buscar Turnos</span>
          <Icons.ArrowUpRight size={12} />
        </a>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '3px solid rgba(252, 28, 70, 0.2)',
                borderTopColor: 'var(--color-crimson-signal)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--color-ash)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Buscando partido en vivo...
            </p>
          </div>
        ) : error || !booking ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--color-graphite)', backgroundColor: '#0f0f0f' }}>
            <h2 style={{ fontSize: 20, color: 'var(--color-crimson-signal)', marginBottom: 8, textTransform: 'uppercase' }}>
              Enlace no válido o expirado
            </h2>
            <p style={{ color: 'var(--color-ash)', fontSize: 14, margin: '0 0 24px' }}>
              {error || 'No pudimos encontrar la reserva correspondiente a este enlace.'}
            </p>
            <a
              href="/reservar"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-crimson-signal)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 'var(--radius-buttons)',
                padding: '12px 28px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Explorar Canchas Disponibles
            </a>
          </div>
        ) : (
          <div>
            {/* Banner de Invitación */}
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  backgroundColor: 'rgba(252, 28, 70, 0.12)',
                  border: '1px solid rgba(252, 28, 70, 0.4)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--color-crimson-signal)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                <Icons.CheckCircle size={13} color="var(--color-crimson-signal)" />
                <span>INVITACIÓN DE PARTIDO</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.8px', textTransform: 'uppercase' }}>
                Aboná tu parte del turno
              </h1>
              <p style={{ color: 'var(--color-ash)', fontSize: 14, margin: 0 }}>
                {booking.buyer.name} reservó la cancha y dividió el pago automáticamente con Mercado Pago.
              </p>
            </div>

            {/* Tarjeta de Información del Partido */}
            <div
              style={{
                backgroundColor: '#0c0c0c',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                padding: '24px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {booking.sport === 'PADEL' ? 'Pádel' : 'Fútbol'} · Cancha Confirmada
                  </span>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '4px 0 2px', textTransform: 'uppercase' }}>
                    {booking.clubName}
                  </h2>
                  <div style={{ fontSize: 14, color: 'var(--color-frost)', fontWeight: 600 }}>
                    {booking.courtName}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 14px',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: 9.5, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
                    TU CUOTA
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-crimson-signal)' }}>
                    {formatCurrency(perPlayerAmount)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, fontSize: 13, color: 'var(--color-ash)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{booking.date} · {booking.startTime} a {booking.endTime} hs</span>
                </div>
                {booking.clubAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icons.MapPin size={14} color="var(--color-ash)" />
                    <span>{booking.clubAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Progreso de Pago Dividido */}
            <div
              style={{
                backgroundColor: '#0c0c0c',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                padding: '22px 24px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  ESTADO DE CUPOS
                </span>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>
                  {paidCount} de {totalCount} Pagados ({progressPercent}%)
                </span>
              </div>

              {/* Progress Track */}
              <div style={{ height: 6, backgroundColor: '#181818', borderRadius: 3, overflow: 'hidden', marginBottom: 18 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--color-crimson-signal)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>

              {/* Lista de Jugadores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {booking.participants?.map((participant, idx) => {
                  const isPaid = participant.status === 'PAID';
                  return (
                    <div
                      key={participant.id || idx}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: isPaid ? 'rgba(252, 28, 70, 0.06)' : '#111',
                        border: '1px solid ' + (isPaid ? 'rgba(252, 28, 70, 0.3)' : 'rgba(255, 255, 255, 0.08)'),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: isPaid ? 'var(--color-crimson-signal)' : '#222',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isPaid ? <Icons.Check size={12} color="#fff" /> : idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isPaid ? '#fff' : 'var(--color-ash)' }}>
                            {participant.name} {participant.isHost && <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)' }}>(Organizador)</span>}
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--color-graphite)' }}>
                            {formatCurrency(participant.amount || perPlayerAmount)}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          backgroundColor: isPaid ? 'rgba(252, 28, 70, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isPaid ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                          border: '1px solid ' + (isPaid ? 'rgba(252, 28, 70, 0.4)' : 'rgba(255, 255, 255, 0.1)'),
                        }}
                      >
                        {isPaid ? 'Abonado' : 'Pendiente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formulario para Abonar Mi Parte */}
            {paidCount < totalCount && !hasPaidSuccessfully ? (
              <div
                style={{
                  backgroundColor: '#0c0c0c',
                  border: '1px solid rgba(252, 28, 70, 0.4)',
                  padding: '24px',
                  marginBottom: 20,
                  boxShadow: '0 0 25px rgba(252, 28, 70, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icons.ShieldCheck size={18} color="var(--color-crimson-signal)" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
                    Abonar mi cuota ({formatCurrency(perPlayerAmount)})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Tu Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Lucas González"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#121212',
                        border: '1px solid var(--color-graphite)',
                        color: '#fff',
                        padding: '11px 14px',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      WhatsApp (Opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+54 9 223 555-0100"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#121212',
                        border: '1px solid var(--color-graphite)',
                        color: '#fff',
                        padding: '11px 14px',
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                {payError && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'rgba(252, 28, 70, 0.15)', border: '1px solid var(--color-crimson-signal)', color: '#fff', fontSize: 12, marginBottom: 14 }}>
                    {payError}
                  </div>
                )}

                <button
                  onClick={handlePayShare}
                  disabled={isPaying}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-buttons)',
                    padding: '15px',
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    cursor: isPaying ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.35)',
                    opacity: isPaying ? 0.7 : 1,
                  }}
                >
                  <Icons.Lock size={15} color="#fff" />
                  <span>{isPaying ? 'Procesando cupo...' : `Pagar mi cuota (${formatCurrency(perPlayerAmount)})`}</span>
                  <Icons.ArrowUpRight size={14} color="#fff" />
                </button>

                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-graphite)', marginTop: 10 }}>
                  Abonás de forma segura mediante Mercado Pago Checkout Pro.
                </div>
              </div>
            ) : hasPaidSuccessfully ? (
              <div
                style={{
                  backgroundColor: 'rgba(37, 211, 102, 0.08)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  padding: '24px',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(37, 211, 102, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icons.CheckCircle size={24} color="#25D366" />
                </div>
                <h3 style={{ fontSize: 18, color: '#fff', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  ¡Cupo Abonado con Éxito!
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: 0 }}>
                  Tu parte para el partido en {booking.clubName} ya está asegurada.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                <Icons.CheckCircle size={22} color="var(--color-crimson-signal)" />
                <h3 style={{ fontSize: 16, color: '#fff', margin: '8px 0 4px', textTransform: 'uppercase' }}>
                  ¡Partido 100% Confirmado!
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: 0 }}>
                  Todos los jugadores abonaron su cuota correspondiente.
                </p>
              </div>
            )}

            {/* Compartir por WhatsApp */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  backgroundColor: copiedLink ? '#25D366' : '#141414',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '12px 18px',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icons.Copy size={14} />
                <span>{copiedLink ? 'Link Copiado' : 'Copiar Link'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`¡Muchachos! Quedan cupos para el partido en ${booking.clubName} (${booking.date} ${booking.startTime}hs). Entren acá para pagar su parte con Mercado Pago: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1.5,
                  backgroundColor: '#25D366',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '12px 18px',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icons.WhatsApp size={16} color="#000" />
                <span>Recordar al grupo de WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
