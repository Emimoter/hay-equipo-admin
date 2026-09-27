import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';

/* ────────────────────────────────────────────────────────────
   Vector Icons (Strict Zero-Emoji Policy)
   ──────────────────────────────────────────────────────────── */
const Icons = {
  Play: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  FastForward: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  ),
  RotateCcw: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Close: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Clock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Bell: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Users: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  CreditCard: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Copy: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Terminal: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Audio Synthesis (Chime sonoro para aviso al club)
   ──────────────────────────────────────────────────────────── */
function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('AudioContext not allowed or supported:', e);
  }
}

/* ────────────────────────────────────────────────────────────
   Types & Models de Simulación
   ──────────────────────────────────────────────────────────── */
interface SimParticipant {
  id: string;
  name: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  isHost?: boolean;
}

interface SimBooking {
  id: string;
  clubName: string;
  courtName: string;
  sport: 'PADEL' | 'FUTBOL';
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentType: 'FULL' | 'SPLIT';
  splitPlayers: number;
  participants: SimParticipant[];
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
  rejectReason?: string;
  paymentStatus: 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'CANCELLED';
  expiresInSec: number; // 900 max (15 min)
}

interface LogEntry {
  id: string;
  time: string;
  actor: 'JUGADOR' | 'CLUB' | 'MERCADOPAGO' | 'SPLIT' | 'SISTEMA';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function SimuladorPage() {
  // Configuración de la simulación
  const [viewMode, setViewMode] = useState<'TRIPLE' | 'JUGADOR' | 'CLUB' | 'SPLIT'>('TRIPLE');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [customRejectReason, setCustomRejectReason] = useState('Cancha ocupada presencialmente en el club');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Logs en tiempo real
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'l-0',
      time: '00:00',
      actor: 'SISTEMA',
      message: 'Entorno de simulación listo. Ningún dato se almacena en Firebase real.',
      type: 'info',
    },
  ]);

  const addLog = (actor: LogEntry['actor'], message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [
      {
        id: `l-${Date.now()}-${Math.random()}`,
        time: timeStr,
        actor,
        message,
        type,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // Estado de la reserva simulada
  const [booking, setBooking] = useState<SimBooking>({
    id: 'HE-72910',
    clubName: 'Club La Verde · Complejo Deportivo',
    courtName: 'Cancha 1 (Vidrio Panorámico 12mm)',
    sport: 'PADEL',
    date: 'Hoy',
    startTime: '19:30',
    endTime: '21:00',
    totalPrice: 28000,
    paymentType: 'SPLIT',
    splitPlayers: 4,
    status: 'PENDING',
    paymentStatus: 'AUTHORIZED',
    expiresInSec: 900, // 15 minutos
    participants: [
      { id: 'p1', name: 'Emiliano (Organizador)', amount: 7000, status: 'PAID', isHost: true },
      { id: 'p2', name: 'Facundo (Amigo 1)', amount: 7000, status: 'PENDING' },
      { id: 'p3', name: 'Matías (Amigo 2)', amount: 7000, status: 'PENDING' },
      { id: 'p4', name: 'Lucas (Amigo 3)', amount: 7000, status: 'PENDING' },
    ],
  });

  // Temporizador de 15 minutos (corre en tiempo real a menos que esté pausado o el turno no esté PENDING)
  useEffect(() => {
    if (booking.status !== 'PENDING' || isTimerPaused) return;

    const interval = setInterval(() => {
      setBooking((prev) => {
        if (prev.status !== 'PENDING') return prev;
        if (prev.expiresInSec <= 1) {
          addLog('SISTEMA', 'El temporizador de 15 minutos llegó a 00:00. Solicitud EXPIRADA automáticamente.', 'warning');
          addLog('MERCADOPAGO', 'Preautorización anulada automáticamente (status: "cancelled"). Fondos liberados al jugador sin costo.', 'info');
          return {
            ...prev,
            expiresInSec: 0,
            status: 'EXPIRED',
            paymentStatus: 'CANCELLED',
            rejectReason: 'Tiempo límite de espera superado (15 min)',
          };
        }
        return {
          ...prev,
          expiresInSec: prev.expiresInSec - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.status, isTimerPaused]);

  // Formato mm:ss
  const formatTime = (totalSec: number) => {
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Acciones de Simulación del Club
  const handleClubAccept = () => {
    if (booking.status !== 'PENDING') return;
    addLog('CLUB', 'El operador del club hizo clic en "ACEPTAR SOLICITUD".', 'success');
    addLog('MERCADOPAGO', 'Captura diferida ejecutada (POST /v1/payments/{id}/capture con capture: true). Fondos cobrados.', 'success');
    addLog('SISTEMA', 'Turno confirmado con éxito. Notificación enviada al jugador.', 'success');

    setBooking((prev) => ({
      ...prev,
      status: 'CONFIRMED',
      paymentStatus: 'CAPTURED',
    }));
  };

  const handleClubReject = (reason: string) => {
    if (booking.status !== 'PENDING') return;
    setRejectModalOpen(false);
    addLog('CLUB', `El operador del club RECHAZÓ la solicitud. Motivo: "${reason}".`, 'error');
    addLog('MERCADOPAGO', 'Retención cancelada / Reembolso inmediato emitido (status: "cancelled"). Dinero protegido.', 'warning');
    addLog('SISTEMA', 'Notificación de rechazo enviada al jugador con el motivo y constancia de no débito.', 'info');

    setBooking((prev) => ({
      ...prev,
      status: 'REJECTED',
      rejectReason: reason,
      paymentStatus: 'CANCELLED',
    }));
  };

  // Time Machine / Acelerador de tiempo
  const advanceTime = (seconds: number) => {
    setBooking((prev) => {
      if (prev.status !== 'PENDING') return prev;
      const nextSec = Math.max(0, prev.expiresInSec - seconds);
      addLog('SISTEMA', `Tiempo avanzado en ${Math.round(seconds / 60)} min. Restan: ${formatTime(nextSec)} min.`, 'info');

      if (nextSec === 0) {
        addLog('SISTEMA', 'Tiempo límite de 15 minutos superado. Solicitud EXPIRADA.', 'warning');
        addLog('MERCADOPAGO', 'Preautorización anulada automáticamente (status: "cancelled"). Fondos liberados.', 'info');
        return {
          ...prev,
          expiresInSec: 0,
          status: 'EXPIRED',
          paymentStatus: 'CANCELLED',
          rejectReason: 'Tiempo límite de espera superado (15 min)',
        };
      }
      return {
        ...prev,
        expiresInSec: nextSec,
      };
    });
  };

  // Reiniciar Simulación
  const resetSimulation = () => {
    if (soundEnabled) playChimeSound();
    addLog('SISTEMA', 'Simulación reiniciada. Nueva solicitud creada con 15 minutos en el reloj.', 'info');
    addLog('MERCADOPAGO', 'Preautorización inicial generada en estado "authorized". Fondos retenidos en garantía.', 'info');

    setBooking({
      id: `HE-${Math.floor(10000 + Math.random() * 90000)}`,
      clubName: 'Club La Verde · Complejo Deportivo',
      courtName: 'Cancha 1 (Vidrio Panorámico 12mm)',
      sport: 'PADEL',
      date: 'Hoy',
      startTime: '19:30',
      endTime: '21:00',
      totalPrice: 28000,
      paymentType: 'SPLIT',
      splitPlayers: 4,
      status: 'PENDING',
      paymentStatus: 'AUTHORIZED',
      expiresInSec: 900,
      participants: [
        { id: 'p1', name: 'Emiliano (Organizador)', amount: 7000, status: 'PAID', isHost: true },
        { id: 'p2', name: 'Facundo (Amigo 1)', amount: 7000, status: 'PENDING' },
        { id: 'p3', name: 'Matías (Amigo 2)', amount: 7000, status: 'PENDING' },
        { id: 'p4', name: 'Lucas (Amigo 3)', amount: 7000, status: 'PENDING' },
      ],
    });
  };

  // Simulación de Pagos de Amigos en el Split
  const handlePayFriend = (participantId: string) => {
    setBooking((prev) => {
      const updatedParts = prev.participants.map((p) => (p.id === participantId ? { ...p, status: 'PAID' as const } : p));
      const target = prev.participants.find((p) => p.id === participantId);
      addLog('SPLIT', `${target?.name || 'Amigo'} abonó su cuota de $7.000 vía Mercado Pago.`, 'success');

      const paidCount = updatedParts.filter((p) => p.status === 'PAID').length;
      if (paidCount === prev.splitPlayers) {
        addLog('SPLIT', '¡Todos los integrantes completaron su pago! El split está 100% abonado.', 'success');
      }

      return {
        ...prev,
        participants: updatedParts,
      };
    });
  };

  const paidCount = booking.participants.filter((p) => p.status === 'PAID').length;
  const splitProgressPct = Math.round((paidCount / booking.splitPlayers) * 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
      <Head>
        <title>Simulador de Reserva, Retención 15 min y Split — Hay Equipo</title>
        <meta name="description" content="Entorno interactivo para simular el circuito completo de jugador, terminal del club y pago dividido sin guardar datos." />
      </Head>

      {/* ── HEADER Y CONTROL MASTER ── */}
      <header
        style={{
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/reservar" style={{ color: '#fc1c46', textDecoration: 'none', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ← Volver a Reservar
            </Link>
            <span style={{ color: '#4c4c4c' }}>|</span>
            <span style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.3px', color: '#ffffff' }}>
              SIMULADOR DE RETENCIÓN 15 MIN & SPLIT
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              100% En Memoria (Sin Base de Datos)
            </span>
          </div>

          {/* Selector de Vistas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#141414', padding: '3px', borderRadius: 9999, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setViewMode('TRIPLE')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                backgroundColor: viewMode === 'TRIPLE' ? '#fc1c46' : 'transparent',
                color: viewMode === 'TRIPLE' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Vista Triple (Side-by-Side)
            </button>
            <button
              onClick={() => setViewMode('JUGADOR')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                backgroundColor: viewMode === 'JUGADOR' ? '#fc1c46' : 'transparent',
                color: viewMode === 'JUGADOR' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Jugador
            </button>
            <button
              onClick={() => setViewMode('CLUB')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                backgroundColor: viewMode === 'CLUB' ? '#fc1c46' : 'transparent',
                color: viewMode === 'CLUB' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Terminal Club
            </button>
            <button
              onClick={() => setViewMode('SPLIT')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                backgroundColor: viewMode === 'SPLIT' ? '#fc1c46' : 'transparent',
                color: viewMode === 'SPLIT' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Lobby Split
            </button>
          </div>
        </div>

        {/* ── BARRA DE CONTROL DEL TIEMPO (TIME MACHINE) ── */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Control de Tiempo:
            </span>
            <div
              style={{
                backgroundColor: booking.expiresInSec < 180 ? 'rgba(252, 28, 70, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${booking.expiresInSec < 180 ? '#fc1c46' : '#f59e0b'}`,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 800,
                color: booking.expiresInSec < 180 ? '#fc1c46' : '#f59e0b',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icons.Clock size={13} color="currentColor" />
              <span>{booking.status === 'PENDING' ? `${formatTime(booking.expiresInSec)} min` : booking.status}</span>
            </div>

            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isTimerPaused ? 'Reanudar Reloj' : 'Pausar Reloj'}
            </button>
          </div>

          {/* Botones de Aceleración Temporal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => advanceTime(60)}
              disabled={booking.status !== 'PENDING'}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: booking.status === 'PENDING' ? 'pointer' : 'not-allowed',
                opacity: booking.status === 'PENDING' ? 1 : 0.5,
              }}
            >
              +1 min
            </button>

            <button
              onClick={() => advanceTime(300)}
              disabled={booking.status !== 'PENDING'}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: booking.status === 'PENDING' ? 'pointer' : 'not-allowed',
                opacity: booking.status === 'PENDING' ? 1 : 0.5,
              }}
            >
              +5 min
            </button>

            <button
              onClick={() => advanceTime(840)}
              disabled={booking.status !== 'PENDING'}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 800,
                cursor: booking.status === 'PENDING' ? 'pointer' : 'not-allowed',
                opacity: booking.status === 'PENDING' ? 1 : 0.5,
              }}
              title="Avanza a los 14 minutos para ver el estado de urgencia en rojo"
            >
              Avanzar a 14 min (Zona Crítica)
            </button>

            <button
              onClick={() => advanceTime(900)}
              disabled={booking.status !== 'PENDING'}
              style={{
                backgroundColor: 'rgba(252, 28, 70, 0.15)',
                color: '#fc1c46',
                border: '1px solid rgba(252, 28, 70, 0.4)',
                borderRadius: 9999,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 800,
                cursor: booking.status === 'PENDING' ? 'pointer' : 'not-allowed',
                opacity: booking.status === 'PENDING' ? 1 : 0.5,
              }}
              title="Simula qué ocurre cuando el club no responde en los 15 minutos reglamentarios"
            >
              Simular Expiración (15 min)
            </button>

            <button
              onClick={resetSimulation}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: 9999,
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icons.RotateCcw size={12} color="#000000" />
              <span>Reiniciar Simulación</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL (ARENA DE PRUEBAS) ── */}
      <main style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              viewMode === 'TRIPLE'
                ? 'repeat(auto-fit, minmax(360px, 1fr))'
                : '1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* ═══════════════════════════════════════════════════════
              PANEL 1: VISTA DEL JUGADOR
              ═══════════════════════════════════════════════════════ */}
          {(viewMode === 'TRIPLE' || viewMode === 'JUGADOR') && (
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    PANEL DE PRUEBA 01
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0', color: '#fff', textTransform: 'uppercase' }}>
                    Vista del Jugador (Mis Reservas)
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                  }}
                >
                  App Jugador
                </span>
              </div>

              {/* Tarjeta de la Reserva tal como la ve el Jugador */}
              <div
                style={{
                  backgroundColor: '#050505',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '20px',
                }}
              >
                {/* Header Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      backgroundColor:
                        booking.status === 'CONFIRMED'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : booking.status === 'REJECTED'
                          ? 'rgba(252, 28, 70, 0.15)'
                          : booking.status === 'EXPIRED'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        booking.status === 'CONFIRMED'
                          ? '#10b981'
                          : booking.status === 'REJECTED'
                          ? '#fc1c46'
                          : '#f59e0b',
                      border: `1px solid ${
                        booking.status === 'CONFIRMED'
                          ? 'rgba(16, 185, 129, 0.3)'
                          : booking.status === 'REJECTED'
                          ? 'rgba(252, 28, 70, 0.4)'
                          : 'rgba(245, 158, 11, 0.3)'
                      }`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {booking.status === 'CONFIRMED'
                      ? 'CONFIRMADA'
                      : booking.status === 'REJECTED'
                      ? 'SOLICITUD RECHAZADA'
                      : booking.status === 'EXPIRED'
                      ? 'TIEMPO EXPIRADO'
                      : 'ESPERANDO AL CLUB'}
                  </span>

                  {booking.status === 'PENDING' && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 9999,
                        backgroundColor: booking.expiresInSec < 180 ? 'rgba(252, 28, 70, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                        color: booking.expiresInSec < 180 ? '#fc1c46' : '#f59e0b',
                        border: `1px solid ${booking.expiresInSec < 180 ? '#fc1c46' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontFamily: 'monospace',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Icons.Clock size={11} color="currentColor" />
                      <span>{formatTime(booking.expiresInSec)} min</span>
                    </span>
                  )}

                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>ID: {booking.id}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>·</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{booking.sport}</span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
                  {booking.courtName}
                </h3>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
                  {booking.clubName}
                </div>

                <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#ffffff', flexWrap: 'wrap', marginBottom: 14 }}>
                  <span>{booking.date}</span>
                  <span>·</span>
                  <span>{booking.startTime} a {booking.endTime} hs</span>
                  <span>·</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>${booking.totalPrice.toLocaleString('es-AR')}</span>
                </div>

                {/* BANNER 1: SI ESTÁ PENDIENTE */}
                {booking.status === 'PENDING' && (
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icons.Clock size={13} color="#f59e0b" />
                      <span>Solicitud en revisión en el club (Hasta 15 min)</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                      Tus fondos de <strong style={{ color: '#ffffff' }}>$7.000</strong> se encuentran <strong style={{ color: '#10b981' }}>retenidos en garantía</strong> en Mercado Pago. Sólo se debitarán si el club acepta tu turno.
                    </div>
                  </div>
                )}

                {/* BANNER 2: SI ESTÁ CONFIRMADA */}
                {booking.status === 'CONFIRMED' && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icons.Check size={14} color="#10b981" />
                      <span>¡Turno confirmado por el club!</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                      Captura diferida ejecutada en Mercado Pago. Tu cancha está 100% asegurada.
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => alert('Simulación: Abriría Google Maps con la ubicación exacta del club.')}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 9999,
                          padding: '6px 14px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        Cómo llegar (Maps)
                      </button>
                      <button
                        onClick={() => alert('Simulación: Abriría chat directo de WhatsApp con la recepción del club.')}
                        style={{
                          backgroundColor: 'rgba(37, 211, 102, 0.15)',
                          color: '#25D366',
                          border: '1px solid rgba(37, 211, 102, 0.3)',
                          borderRadius: 9999,
                          padding: '6px 14px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        WhatsApp Club
                      </button>
                    </div>
                  </div>
                )}

                {/* BANNER 3: SI FUE RECHAZADA */}
                {booking.status === 'REJECTED' && (
                  <div style={{ backgroundColor: 'rgba(252, 28, 70, 0.08)', border: '1px solid rgba(252, 28, 70, 0.35)', padding: '12px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fc1c46', textTransform: 'uppercase', marginBottom: 4 }}>
                      Solicitud no aceptada por el complejo
                    </div>
                    <div style={{ fontSize: 12, color: '#ffffff', marginBottom: 6 }}>
                      Motivo informado: <strong style={{ color: '#fc1c46' }}>{booking.rejectReason}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                      Tu dinero está protegido: La retención se anuló al instante y no se debitó nada de tu medio de pago.
                    </div>
                  </div>
                )}

                {/* BANNER 4: SI EXPIRÓ POR TIEMPO */}
                {booking.status === 'EXPIRED' && (
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '12px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>
                      Tiempo límite de espera superado (15 min)
                    </div>
                    <div style={{ fontSize: 12, color: '#ffffff', marginBottom: 6 }}>
                      El club no respondió dentro del plazo reglamentario. El turno fue liberado.
                    </div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                      Fondos liberados: La preautorización en Mercado Pago fue dada de baja sin ningún cargo.
                    </div>
                  </div>
                )}

                {/* Resumen de Pago Dividido */}
                {booking.paymentType === 'SPLIT' && (
                  <div style={{ backgroundColor: 'rgba(252, 28, 70, 0.05)', border: '1px solid rgba(252, 28, 70, 0.25)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#fc1c46' }}>
                        Pago Dividido (Split)
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                        {paidCount} de {booking.splitPlayers} pagados ({splitProgressPct}%)
                      </span>
                    </div>

                    <div style={{ width: '100%', height: 6, backgroundColor: '#222', borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ width: `${splitProgressPct}%`, height: '100%', backgroundColor: splitProgressPct === 100 ? '#10b981' : '#fc1c46', transition: 'width 0.3s ease' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        $7.000 por jugador
                      </span>
                      <button
                        onClick={() => {
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        style={{
                          backgroundColor: '#fc1c46',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 9999,
                          padding: '5px 12px',
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {copiedLink ? '¡Link Copiado!' : 'Copiar Link de Split'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PANEL 2: VISTA DE LA TERMINAL DEL CLUB
              ═══════════════════════════════════════════════════════ */}
          {(viewMode === 'TRIPLE' || viewMode === 'CLUB') && (
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    PANEL DE PRUEBA 02
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0', color: '#fff', textTransform: 'uppercase' }}>
                    Terminal del Club (/club)
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playChimeSound();
                    }}
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      backgroundColor: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      color: soundEnabled ? '#10b981' : '#94a3b8',
                      border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    Audio: {soundEnabled ? 'ACTIVO' : 'MUTE'}
                  </button>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                    }}
                  >
                    Recepción ONLINE
                  </span>
                </div>
              </div>

              {/* Contenido de Solicitud en la Terminal del Club */}
              <div
                style={{
                  backgroundColor: '#050505',
                  border: booking.status === 'PENDING' ? '1px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderLeft:
                    booking.status === 'PENDING'
                      ? '4px solid #fc1c46'
                      : booking.status === 'CONFIRMED'
                      ? '4px solid #10b981'
                      : '4px solid #64748b',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 9999,
                        backgroundColor:
                          booking.status === 'PENDING'
                            ? 'rgba(252, 28, 70, 0.2)'
                            : booking.status === 'CONFIRMED'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(100, 116, 139, 0.2)',
                        color:
                          booking.status === 'PENDING'
                            ? '#fc1c46'
                            : booking.status === 'CONFIRMED'
                            ? '#10b981'
                            : '#94a3b8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {booking.status === 'PENDING'
                        ? 'SOLICITUD ENTRANTE'
                        : booking.status === 'CONFIRMED'
                        ? 'TURNO CONFIRMADO'
                        : booking.status === 'EXPIRED'
                        ? 'EXPIRADA'
                        : 'RECHAZADA'}
                    </span>

                    {booking.status === 'PENDING' && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          backgroundColor: booking.expiresInSec < 180 ? 'rgba(252, 28, 70, 0.25)' : 'rgba(245, 158, 11, 0.15)',
                          color: booking.expiresInSec < 180 ? '#fc1c46' : '#f59e0b',
                          border: `1px solid ${booking.expiresInSec < 180 ? '#fc1c46' : 'rgba(245, 158, 11, 0.3)'}`,
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatTime(booking.expiresInSec)} min restantes
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>#{booking.id}</span>
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                  {booking.courtName}
                </div>

                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                  {booking.date} · {booking.startTime} a {booking.endTime} hs · <strong style={{ color: '#10b981' }}>${booking.totalPrice.toLocaleString('es-AR')}</strong>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Emiliano Giménez (Organizador)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Tel: 2235948332 · Modalidad: {booking.paymentType === 'SPLIT' ? 'Pago Dividido (Split)' : 'Total'}</div>
                </div>

                {/* BOTONES DE DECISIÓN DEL CLUB */}
                {booking.status === 'PENDING' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={handleClubAccept}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#000000',
                        border: 'none',
                        borderRadius: 9999,
                        padding: '12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Icons.Check size={14} color="#000000" />
                      <span>Confirmar Turno</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#fc1c46',
                        border: '1px solid #fc1c46',
                        borderRadius: 9999,
                        padding: '12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Icons.Close size={14} color="#fc1c46" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', fontSize: 12, color: '#94a3b8' }}>
                    Esta solicitud ya fue procesada: <strong style={{ color: '#ffffff' }}>{booking.status}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              PANEL 3: VISTA DEL LOBBY DE SPLIT (AMIGOS)
              ═══════════════════════════════════════════════════════ */}
          {(viewMode === 'TRIPLE' || viewMode === 'SPLIT') && (
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    PANEL DE PRUEBA 03
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0', color: '#fff', textTransform: 'uppercase' }}>
                    Lobby de Split (/split/...)
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    backgroundColor: 'rgba(252, 28, 70, 0.15)',
                    color: '#fc1c46',
                  }}
                >
                  Link Compartible
                </span>
              </div>

              {/* Lista interactiva de Jugadores del Split */}
              <div style={{ backgroundColor: '#050505', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '20px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Progreso del Partido</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: splitProgressPct === 100 ? '#10b981' : '#fc1c46' }}>
                      {paidCount} de {booking.splitPlayers} pagaron (${(paidCount * 7000).toLocaleString('es-AR')} de $28.000)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#222', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${splitProgressPct}%`, height: '100%', backgroundColor: splitProgressPct === 100 ? '#10b981' : '#fc1c46', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {booking.participants.map((p, index) => {
                    const isPaid = p.status === 'PAID';
                    return (
                      <div
                        key={p.id}
                        style={{
                          backgroundColor: '#0a0a0a',
                          border: isPaid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                            {p.name} {p.isHost && <span style={{ fontSize: 10, color: '#fc1c46' }}>(Host)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            Cuota: ${p.amount.toLocaleString('es-AR')}
                          </div>
                        </div>

                        {isPaid ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 9999,
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Icons.Check size={11} color="#10b981" />
                            <span>PAGADO</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayFriend(p.id)}
                            style={{
                              backgroundColor: '#fc1c46',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 9999,
                              padding: '6px 14px',
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                            }}
                          >
                            Simular Pago Amigo
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {splitProgressPct === 100 && (
                  <div style={{ marginTop: 16, backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                      ¡Todos los cupos fueron abonados!
                    </div>
                    <div style={{ fontSize: 11, color: '#a7f3d0' }}>
                      El costo del partido quedó completamente saldado entre los 4 jugadores.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            CONSOLA DE EVENTOS EN TIEMPO REAL (EVENT STREAM INSPECTOR)
            ═══════════════════════════════════════════════════════ */}
        <section style={{ marginTop: 32 }}>
          <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Terminal size={16} color="#fc1c46" />
                <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px', color: '#fff' }}>
                  Auditoría y Registro de Eventos en Tiempo Real (Log Stream)
                </h3>
              </div>
              <button
                onClick={() => setLogs([])}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 9999,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Limpiar Consola
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#040404',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px',
                height: 200,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {logs.map((log) => {
                const colorMap = {
                  info: '#94a3b8',
                  success: '#10b981',
                  warning: '#f59e0b',
                  error: '#fc1c46',
                };
                return (
                  <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span style={{ color: '#4c4c4c' }}>[{log.time}]</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: log.actor === 'CLUB' ? '#10b981' : log.actor === 'JUGADOR' ? '#fc1c46' : log.actor === 'MERCADOPAGO' ? '#38bdf8' : '#f59e0b',
                      }}
                    >
                      {log.actor}
                    </span>
                    <span style={{ color: colorMap[log.type] }}>{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── MODAL RECHAZO CON MOTIVOS ── */}
      {rejectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #fc1c46',
              padding: '28px',
              maxWidth: 480,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 11, color: '#fc1c46', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
              Terminal del Club · Acción Operativa
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 14px', textTransform: 'uppercase' }}>
              Rechazar Solicitud de Reserva
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
              Seleccioná el motivo del rechazo. Este motivo aparecerá de inmediato en la pantalla del jugador y disparará la anulación de la retención sin costo.
            </p>

            <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
              {[
                'Cancha ocupada presencialmente en el club',
                'Torneo o evento interno programado',
                'Cancha en mantenimiento técnico',
                'Condiciones climáticas (lluvia / humedad)',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCustomRejectReason(reason)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: customRejectReason === reason ? 700 : 500,
                    backgroundColor: customRejectReason === reason ? 'rgba(252, 28, 70, 0.15)' : '#141414',
                    color: customRejectReason === reason ? '#fff' : '#94a3b8',
                    border: customRejectReason === reason ? '1px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 9999,
                  padding: '10px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleClubReject(customRejectReason)}
                style={{
                  flex: 1,
                  backgroundColor: '#fc1c46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '10px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                }}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
