import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* ────────────────────────────────────────────────────────────
   Types & Interfaces
   ──────────────────────────────────────────────────────────── */

type NavTab = 'DASHBOARD' | 'CALENDAR' | 'COURTS' | 'PLAYERS' | 'ANALYTICS' | 'SETTINGS';
type SlotStatus = 'RESERVED' | 'AVAILABLE' | 'FIXED' | 'MAINTENANCE';

interface CourtSlot {
  id: string;
  courtId: string;
  courtName: string;
  sport: string;
  time: string;
  status: SlotStatus;
  player: string;
  price: number;
  phone?: string;
}

interface CourtInfo {
  id: string;
  name: string;
  sport: string;
  surface: string;
  active: boolean;
  priceValley: number;
  pricePeak: number;
  indoor: boolean;
  lighting: boolean;
}

interface PlayerRecord {
  id: string;
  name: string;
  phone: string;
  category: string;
  sport: string;
  matchesPlayed: number;
  reliability: number; // 1-5
  balanceStatus: 'AL_DIA' | 'DEUDA' | 'SEÑA_PENDIENTE';
  debtAmount?: number;
}

/* ────────────────────────────────────────────────────────────
   Initial Mock Data
   ──────────────────────────────────────────────────────────── */

const INITIAL_SLOTS: CourtSlot[] = [
  { id: 's-1', courtId: 'c-1', courtName: 'Cancha 1', sport: 'Pádel', time: '18:00', status: 'RESERVED', player: 'Juan R.', price: 48000, phone: '+54 9 11 4433-2211' },
  { id: 's-2', courtId: 'c-2', courtName: 'Cancha 2', sport: 'Pádel', time: '18:00', status: 'AVAILABLE', player: '—', price: 45000 },
  { id: 's-3', courtId: 'c-3', courtName: 'Cancha 3', sport: 'Pádel', time: '19:30', status: 'FIXED', player: 'Escuela Padel', price: 42000, phone: '+54 9 11 9988-7766' },
  { id: 's-4', courtId: 'c-4', courtName: 'Cancha 4', sport: 'Fútbol 5', time: '20:00', status: 'AVAILABLE', player: '—', price: 36000 },
  { id: 's-5', courtId: 'c-1', courtName: 'Cancha 1', sport: 'Pádel', time: '19:30', status: 'RESERVED', player: 'Rodrigo De Paul', price: 48000, phone: '+54 9 11 5566-7788' },
  { id: 's-6', courtId: 'c-2', courtName: 'Cancha 2', sport: 'Pádel', time: '21:00', status: 'RESERVED', player: 'Emiliano M.', price: 45000, phone: '+54 9 11 2233-4455' },
  { id: 's-7', courtId: 'c-3', courtName: 'Cancha 3', sport: 'Pádel', time: '21:00', status: 'AVAILABLE', player: '—', price: 42000 },
  { id: 's-8', courtId: 'c-4', courtName: 'Cancha 4', sport: 'Fútbol 5', time: '21:30', status: 'RESERVED', player: 'Torneo Nocturno', price: 36000, phone: '+54 9 11 1122-3344' },
];

const INITIAL_COURTS: CourtInfo[] = [
  { id: 'c-1', name: 'Cancha 1 — Panorámica WPT', sport: 'Pádel', surface: 'Vidrio Panorámico 12mm · Césped Texturado', active: true, priceValley: 42000, pricePeak: 48000, indoor: true, lighting: true },
  { id: 'c-2', name: 'Cancha 2 — Cristal Pro', sport: 'Pádel', surface: 'Vidrio Templado 10mm · Césped Monofilamento', active: true, priceValley: 38000, pricePeak: 45000, indoor: true, lighting: true },
  { id: 'c-3', name: 'Cancha 3 — Master Climatizada', sport: 'Pádel', surface: 'Muros Perimetrales · Cubierta Climatizada', active: true, priceValley: 36000, pricePeak: 42000, indoor: true, lighting: true },
  { id: 'c-4', name: 'Cancha 4 — Fútbol 5 Forbex', sport: 'Fútbol 5', surface: 'Césped Sintético Forbex 50mm con Caucho', active: true, priceValley: 30000, pricePeak: 36000, indoor: false, lighting: true },
];

const INITIAL_PLAYERS: PlayerRecord[] = [
  { id: 'p-1', name: 'Juan Román Riquelme', phone: '+54 9 11 4433-2211', category: '4ta División', sport: 'Pádel', matchesPlayed: 28, reliability: 5, balanceStatus: 'AL_DIA' },
  { id: 'p-2', name: 'Rodrigo De Paul', phone: '+54 9 11 5566-7788', category: '3ra Libre', sport: 'Pádel', matchesPlayed: 19, reliability: 5, balanceStatus: 'AL_DIA' },
  { id: 'p-3', name: 'Emiliano Martínez', phone: '+54 9 11 2233-4455', category: 'Arquero / 5ta', sport: 'Fútbol 5', matchesPlayed: 34, reliability: 5, balanceStatus: 'AL_DIA' },
  { id: 'p-4', name: 'Lautaro Martínez', phone: '+54 9 11 3322-1144', category: 'Delantero / Pro', sport: 'Fútbol 5', matchesPlayed: 15, reliability: 4, balanceStatus: 'DEUDA', debtAmount: 18000 },
  { id: 'p-5', name: 'Escuela Padel Menores', phone: '+54 9 11 9988-7766', category: 'Formativo / Fijo', sport: 'Pádel', matchesPlayed: 52, reliability: 5, balanceStatus: 'AL_DIA' },
  { id: 'p-6', name: 'Marcos Acuña', phone: '+54 9 11 7788-9900', category: '5ta División', sport: 'Pádel', matchesPlayed: 11, reliability: 4, balanceStatus: 'SEÑA_PENDIENTE', debtAmount: 15000 },
];

/* ────────────────────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────────────────────── */

export default function ClubPanel() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [clubName, setClubName] = useState('Club Padel Center');
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [dateFilter, setDateFilter] = useState('Hoy');
  const [showToast, setShowToast] = useState(true);

  // Core Data state
  const [slots, setSlots] = useState<CourtSlot[]>(INITIAL_SLOTS);
  const [courts, setCourts] = useState<CourtInfo[]>(INITIAL_COURTS);
  const [players, setPlayers] = useState<PlayerRecord[]>(INITIAL_PLAYERS);
  const [searchPlayer, setSearchPlayer] = useState('');

  // Settings State
  const [mercadoPagoConnected, setMercadoPagoConnected] = useState(true);
  const [whatsappBotEnabled, setWhatsappBotEnabled] = useState(true);
  const [autoDepositPercentage, setAutoDepositPercentage] = useState(50);
  const [clubAddress, setClubAddress] = useState('Av. Del Libertador 4400, Palermo, CABA');

  // Modal "+ Nueva reserva"
  const [showModal, setShowModal] = useState(false);
  const [modalCourt, setModalCourt] = useState('c-1');
  const [modalTime, setModalTime] = useState('21:00');
  const [modalPlayer, setModalPlayer] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalType, setModalType] = useState<SlotStatus>('RESERVED');

  /* ── Auth Verification & Auto Demo Fallback ── */
  useEffect(() => {
    const raw = localStorage.getItem('hayequipo_club_session');
    if (!raw) {
      const demoSession = {
        email: 'demo@clubpadelcenter.com',
        clubName: 'Club Padel Center',
        ts: Date.now(),
      };
      localStorage.setItem('hayequipo_club_session', JSON.stringify(demoSession));
      setClubName('Club Padel Center');
      setAuthed(true);
      return;
    }
    try {
      const session = JSON.parse(raw);
      if (session.clubName) {
        setClubName(session.clubName);
      }
      setAuthed(true);
    } catch {
      setClubName('Club Padel Center');
      setAuthed(true);
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('hayequipo_club_session');
    router.push('/login');
  }, [router]);

  // Cycle status on row click
  const handleToggleStatus = (id: string) => {
    setSlots(prev =>
      prev.map(slot => {
        if (slot.id !== id) return slot;
        if (slot.status === 'AVAILABLE') {
          return { ...slot, status: 'RESERVED', player: 'Mostrador / WA' };
        }
        if (slot.status === 'RESERVED') {
          return { ...slot, status: 'FIXED', player: 'Turno Fijo' };
        }
        if (slot.status === 'FIXED') {
          return { ...slot, status: 'AVAILABLE', player: '—' };
        }
        return { ...slot, status: 'AVAILABLE', player: '—' };
      })
    );
  };

  // Toggle Court Active
  const handleToggleCourtActive = (id: string) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  // Add new reservation
  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === modalCourt) || courts[0];
    const newSlot: CourtSlot = {
      id: `slot-${Date.now()}`,
      courtId: court.id,
      courtName: court.name.split('—')[0].trim(),
      sport: court.sport,
      time: modalTime,
      status: modalType,
      player: modalPlayer.trim() || 'Reserva Directa',
      phone: modalPhone.trim() || undefined,
      price: court.pricePeak,
    };
    setSlots(prev => [newSlot, ...prev]);
    setShowModal(false);
    setModalPlayer('');
    setModalPhone('');
  };

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    if (!searchPlayer.trim()) return players;
    return players.filter(p =>
      p.name.toLowerCase().includes(searchPlayer.toLowerCase()) ||
      p.phone.includes(searchPlayer) ||
      p.category.toLowerCase().includes(searchPlayer.toLowerCase())
    );
  }, [players, searchPlayer]);

  // Metrics calculation
  const totalReservedToday = useMemo(() => {
    return slots.filter(s => s.status === 'RESERVED' || s.status === 'FIXED').length + 8;
  }, [slots]);

  const activeCourtsCount = useMemo(() => {
    return courts.filter(c => c.active).length;
  }, [courts]);

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#07080a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#fc1c46', margin: '0 auto 16px', animation: 'pulse 1.4s infinite' }} />
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>CARGANDO PANEL DEL CLUB...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#07080a',
      color: '#f0f2f5',
      fontFamily: 'var(--font-sui)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px, 1.5vh, 16px) clamp(10px, 2vw, 20px)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <Head>
        <title>{clubName} — Panel del Club</title>
        <meta name="description" content="Panel de control y gestión en tiempo real para clubes deportivos" />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          MAIN APP SHELL (Exact 3D Mockup Container — Fit 100vh)
          ═══════════════════════════════════════════════════════ */}
      <div style={{
        width: '100%',
        maxWidth: 1220,
        height: 'calc(100vh - clamp(16px, 3vh, 32px))',
        maxHeight: 740,
        backgroundColor: '#0f1115',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 50px -10px rgba(252, 28, 70, 0.08)',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ────────────────────────────────────────────────────────────
            LEFT SIDEBAR
            ──────────────────────────────────────────────────────────── */}
        <aside style={{
          width: 64,
          backgroundColor: '#0b0c0f',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {/* Top: Club / Brand Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div
              onClick={() => router.push('/')}
              title="Volver a la web pública"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'rgba(252, 28, 70, 0.12)',
                border: '1px solid rgba(252, 28, 70, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fc1c46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
                <path d="M12 2c5 4 5 16 0 20" />
              </svg>
            </div>

            {/* Navigation Icon Stack */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Tab 1: Dashboard */}
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                title="Dashboard — Vista General"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'DASHBOARD' ? '#241217' : 'transparent',
                  color: activeTab === 'DASHBOARD' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'DASHBOARD') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'DASHBOARD') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <rect x="3" y="14" width="7" height="7" rx="2" />
                  <rect x="14" y="14" width="7" height="7" rx="2" />
                </svg>
              </button>

              {/* Tab 2: Calendar / Slots */}
              <button
                onClick={() => setActiveTab('CALENDAR')}
                title="Calendario & Grilla de Turnos"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'CALENDAR' ? '#241217' : 'transparent',
                  color: activeTab === 'CALENDAR' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'CALENDAR') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'CALENDAR') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>

              {/* Tab 3: Courts Layout */}
              <button
                onClick={() => setActiveTab('COURTS')}
                title="Canchas & Tarifas"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'COURTS' ? '#241217' : 'transparent',
                  color: activeTab === 'COURTS' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'COURTS') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'COURTS') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </button>

              {/* Tab 4: Players / Community */}
              <button
                onClick={() => setActiveTab('PLAYERS')}
                title="Jugadores & Clientes"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'PLAYERS' ? '#241217' : 'transparent',
                  color: activeTab === 'PLAYERS' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'PLAYERS') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'PLAYERS') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </button>

              {/* Tab 5: Analytics / Stats */}
              <button
                onClick={() => setActiveTab('ANALYTICS')}
                title="Métricas & Finanzas"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'ANALYTICS' ? '#241217' : 'transparent',
                  color: activeTab === 'ANALYTICS' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'ANALYTICS') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'ANALYTICS') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </button>

              {/* Tab 6: Settings */}
              <button
                onClick={() => setActiveTab('SETTINGS')}
                title="Configuración del Club"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: activeTab === 'SETTINGS' ? '#241217' : 'transparent',
                  color: activeTab === 'SETTINGS' ? '#fc1c46' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== 'SETTINGS') e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== 'SETTINGS') e.currentTarget.style.color = '#6b7280'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </nav>
          </div>

          {/* Bottom: Logout Door */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fc1c46'; e.currentTarget.style.backgroundColor = 'rgba(252,28,70,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </aside>

        {/* ────────────────────────────────────────────────────────────
            MAIN CONTENT AREA
            ──────────────────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          padding: 'clamp(14px, 2vh, 20px) clamp(16px, 2vw, 26px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.4vh, 14px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}>

          {/* ── TOP HEADER BAR ── */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(20px, 2.5vh, 23px)',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}>
                Panel del club
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 2,
                color: '#9ca3af',
                fontSize: 13,
                cursor: 'pointer',
              }}>
                <span>{clubName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Right Controls: Notifications + Date Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Notification Bell */}
              <div
                style={{
                  position: 'relative',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: '#16181e',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#d1d5db',
                }}
                onClick={() => setShowToast(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#fc1c46',
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 700,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0f1115',
                }}>
                  2
                </span>
              </div>

              {/* Date Filter Pill */}
              <div style={{ position: 'relative' }}>
                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  style={{
                    backgroundColor: '#16181e',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 9999,
                    padding: '6px 26px 6px 14px',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                >
                  <option value="Hoy">Hoy</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Esta semana">Esta semana</option>
                </select>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2.5"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </header>

          {/* ═══════════════════════════════════════════════════════
              VIEW 1: DASHBOARD (Exact 3D Mockup)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'DASHBOARD' && (
            <>
              {/* TOP 3 METRIC KPI CARDS */}
              <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
              }}>
                {/* KPI 1: Reservas hoy */}
                <div style={{
                  backgroundColor: '#14161c',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(252, 28, 70, 0.12)',
                    border: '1px solid rgba(252, 28, 70, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fc1c46',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(20px, 2.5vh, 24px)', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                      {totalReservedToday}
                    </div>
                    <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 3 }}>
                      reservas hoy
                    </div>
                  </div>
                </div>

                {/* KPI 2: Facturación semanal */}
                <div style={{
                  backgroundColor: '#14161c',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(252, 28, 70, 0.12)',
                    border: '1px solid rgba(252, 28, 70, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fc1c46',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 6v2m0 8v2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(18px, 2.2vh, 22px)', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                      $348.000
                    </div>
                    <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 3 }}>
                      esta semana
                    </div>
                  </div>
                </div>

                {/* KPI 3: Canchas activas */}
                <div style={{
                  backgroundColor: '#14161c',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(252, 28, 70, 0.12)',
                    border: '1px solid rgba(252, 28, 70, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fc1c46',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="8" y1="2" x2="8" y2="22" />
                      <line x1="16" y1="2" x2="16" y2="22" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(20px, 2.5vh, 24px)', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                      {activeCourtsCount}
                    </div>
                    <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 3 }}>
                      canchas activas
                    </div>
                  </div>
                </div>
              </section>

              {/* MAIN SPLIT GRID (HORARIO PICO + ACTIVIDAD) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.7fr 1fr',
                gap: 14,
                flex: 1,
              }}>
                {/* LEFT: HORARIO PICO */}
                <div style={{
                  backgroundColor: '#14161c',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#fc1c46',
                        boxShadow: '0 0 8px #fc1c46',
                        display: 'inline-block',
                      }} />
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Horario pico
                      </h2>
                    </div>

                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.3fr 0.8fr 1.1fr 1.4fr 0.2fr',
                      paddingBottom: 8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}>
                      <div>CANCHA</div>
                      <div>HORA</div>
                      <div>ESTADO</div>
                      <div>JUGADOR / RESERVA</div>
                      <div style={{ textAlign: 'right' }}></div>
                    </div>

                    {/* Table Rows (Clean 4-5 rows) */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {slots.slice(0, 4).map((slot) => {
                        const isReserved = slot.status === 'RESERVED';
                        const isFixed = slot.status === 'FIXED';
                        const isAvailable = slot.status === 'AVAILABLE';

                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleToggleStatus(slot.id)}
                            title="Click para alternar estado"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1.3fr 0.8fr 1.1fr 1.4fr 0.2fr',
                              alignItems: 'center',
                              padding: '8px 0',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                              fontSize: 12.5,
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#f3f4f6', fontWeight: 500 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="12" y1="3" x2="12" y2="21" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                              </svg>
                              <span>{slot.courtName}</span>
                            </div>

                            <div style={{ color: '#d1d5db', fontWeight: 500 }}>
                              {slot.time}
                            </div>

                            <div>
                              {isReserved && (
                                <span style={{ backgroundColor: '#fc1c46', color: '#ffffff', padding: '3px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 600, display: 'inline-block' }}>
                                  Reservado
                                </span>
                              )}
                              {isFixed && (
                                <span style={{ backgroundColor: '#e11d48', color: '#ffffff', padding: '3px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 600, display: 'inline-block' }}>
                                  Turno fijo
                                </span>
                              )}
                              {isAvailable && (
                                <span style={{ backgroundColor: '#20232a', color: '#9ca3af', padding: '3px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 500, display: 'inline-block' }}>
                                  Disponible
                                </span>
                              )}
                            </div>

                            <div style={{ color: isAvailable ? '#4b5563' : '#d1d5db', fontSize: 12 }}>
                              {slot.player}
                            </div>

                            <div style={{ textAlign: 'right', color: '#6b7280', fontSize: 14 }}>
                              ⋮
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT: ACTIVIDAD + CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
                  {/* CARD: ACTIVIDAD DE HOY */}
                  <div style={{
                    backgroundColor: '#14161c',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    flex: 1,
                  }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff', margin: '0 0 10px' }}>
                      Actividad de hoy
                    </h3>

                    <div style={{ position: 'relative', width: '100%', height: 95 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 9, color: '#6b7280' }}>
                        <span>12</span>
                        <span>8</span>
                        <span>4</span>
                        <span>0</span>
                      </div>

                      <svg viewBox="0 0 320 110" style={{ width: '100%', height: '100%', paddingLeft: 18, overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fc1c46" stopOpacity="0.45" />
                            <stop offset="70%" stopColor="#fc1c46" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#fc1c46" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        <path
                          d="M 10 85 Q 50 80, 80 65 T 140 55 Q 190 15, 220 15 T 270 60 Q 295 75, 310 78 L 310 95 L 10 95 Z"
                          fill="url(#crimsonGradient)"
                        />
                        <path
                          d="M 10 85 Q 50 80, 80 65 T 140 55 Q 190 15, 220 15 T 270 60 Q 295 75, 310 78"
                          fill="none"
                          stroke="#fc1c46"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <line x1="220" y1="15" x2="220" y2="95" stroke="rgba(252, 28, 70, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="220" cy="15" r="4" fill="#ffffff" stroke="#fc1c46" strokeWidth="2" />
                      </svg>

                      <div style={{
                        position: 'absolute',
                        top: -6,
                        left: '68%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#fc1c46',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(252, 28, 70, 0.4)',
                      }}>
                        18:00
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 18, marginTop: 4, fontSize: 9, color: '#6b7280' }}>
                      <span>08</span>
                      <span>12</span>
                      <span>16</span>
                      <span>20</span>
                      <span>24</span>
                    </div>
                  </div>

                  {/* BUTTON NUEVA RESERVA */}
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#fc1c46',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 6px 20px -3px rgba(252, 28, 70, 0.4)',
                      transition: 'transform 0.15s ease, filter 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                    <span>Nueva reserva</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 2: CALENDAR / TURNOS (Full Matrix View)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'CALENDAR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Grilla de Turnos y Disponibilidad</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Gestioná los bloques de horarios por cancha y modificá estados en vivo.</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    backgroundColor: '#fc1c46',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Asignar Turno Manual
                </button>
              </div>

              {/* Court Columns Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {courts.map((court) => {
                  const courtSlots = slots.filter(s => s.courtId === court.id);

                  return (
                    <div
                      key={court.id}
                      style={{
                        backgroundColor: '#14161c',
                        borderRadius: 18,
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{court.name.split('—')[0].trim()}</div>
                        <span style={{ fontSize: 10, color: '#fc1c46', backgroundColor: 'rgba(252,28,70,0.12)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{court.sport}</span>
                      </div>

                      {/* Slots List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {courtSlots.map(s => (
                          <div
                            key={s.id}
                            onClick={() => handleToggleStatus(s.id)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 10,
                              backgroundColor: s.status === 'AVAILABLE' ? '#181b22' : 'rgba(252, 28, 70, 0.12)',
                              border: s.status === 'AVAILABLE' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(252, 28, 70, 0.3)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: s.status === 'AVAILABLE' ? '#fff' : '#fc1c46' }}>
                                {s.time} hs
                              </div>
                              <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 2 }}>
                                {s.player}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 6,
                              backgroundColor: s.status === 'AVAILABLE' ? '#20232a' : '#fc1c46',
                              color: s.status === 'AVAILABLE' ? '#9ca3af' : '#fff',
                            }}>
                              {s.status === 'AVAILABLE' ? 'LIBRE' : s.status === 'FIXED' ? 'FIJO' : 'RESERVADO'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 3: COURTS & TARIFAS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'COURTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Canchas & Tarifas Dinámicas</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Configuración de instalaciones, iluminación y precios valle / pico.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {courts.map(court => (
                  <div
                    key={court.id}
                    style={{
                      backgroundColor: '#14161c',
                      borderRadius: 18,
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{court.name}</div>
                        <div style={{ fontSize: 12, color: '#8b92a0', marginTop: 4 }}>{court.surface}</div>
                      </div>
                      <button
                        onClick={() => handleToggleCourtActive(court.id)}
                        style={{
                          backgroundColor: court.active ? '#1e293b' : '#33151b',
                          color: court.active ? '#4ade80' : '#fc1c46',
                          border: 'none',
                          borderRadius: 9999,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {court.active ? '● Activa' : '○ Pausada'}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                      <div style={{ backgroundColor: '#181b22', padding: '10px', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Tarifa Valle (08-17h)</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 3 }}>${court.priceValley.toLocaleString()}</div>
                      </div>
                      <div style={{ backgroundColor: '#181b22', padding: '10px', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#fc1c46', textTransform: 'uppercase' }}>Tarifa Pico (18-23h)</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fc1c46', marginTop: 3 }}>${court.pricePeak.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#9ca3af' }}>
                      <span>{court.indoor ? '✓ Techada / Indoor' : '☁ Descubierta'}</span>
                      <span>·</span>
                      <span>{court.lighting ? '💡 Iluminación LED Pro' : 'Sin luz'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 4: PLAYERS & CLIENTS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'PLAYERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Base de Jugadores & Clientes</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Historial de partidos, señas pendientes y control de asistencia.</p>
                </div>
                <input
                  type="text"
                  value={searchPlayer}
                  onChange={e => setSearchPlayer(e.target.value)}
                  placeholder="🔍 Buscar por nombre o teléfono..."
                  style={{
                    backgroundColor: '#16181e',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    width: 260,
                  }}
                />
              </div>

              <div style={{
                backgroundColor: '#14161c',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.2fr 1fr 0.8fr 1fr',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}>
                  <div>JUGADOR</div>
                  <div>TELÉFONO</div>
                  <div>CATEGORÍA / DEPORTE</div>
                  <div>PARTIDOS</div>
                  <div style={{ textAlign: 'right' }}>ESTADO DE CUENTA</div>
                </div>

                {filteredPlayers.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1.2fr 1fr 0.8fr 1fr',
                      padding: '14px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center',
                      fontSize: 13.5,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ color: '#9ca3af' }}>{p.phone}</div>
                    <div style={{ color: '#d1d5db', fontSize: 12 }}>{p.category} · {p.sport}</div>
                    <div style={{ color: '#fff' }}>{p.matchesPlayed}</div>
                    <div style={{ textAlign: 'right' }}>
                      {p.balanceStatus === 'AL_DIA' && (
                        <span style={{ backgroundColor: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          Al Día
                        </span>
                      )}
                      {p.balanceStatus === 'DEUDA' && (
                        <span style={{ backgroundColor: 'rgba(252, 28, 70, 0.15)', color: '#fc1c46', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          Deuda ${p.debtAmount?.toLocaleString()}
                        </span>
                      )}
                      {p.balanceStatus === 'SEÑA_PENDIENTE' && (
                        <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          Seña Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 5: ANALYTICS & FINANZAS
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'ANALYTICS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Métricas & Rendimiento Financiero</h2>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Análisis de ocupación, métodos de pago y facturación mensual.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Facturación del Mes</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 6 }}>$1.840.000</div>
                  <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>+18% vs mes anterior</div>
                </div>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Tasa de Ocupación Pico</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#fc1c46', marginTop: 6 }}>94.2%</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Lunes a Viernes 18-23h</div>
                </div>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Cobro por App (Mercado Pago)</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#38bdf8', marginTop: 6 }}>78%</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>22% restante en mostrador</div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 6: SETTINGS & CONFIGURACIÓN
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'SETTINGS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Configuración del Club</h2>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Datos generales, integración de Mercado Pago y automatización de WhatsApp.</p>
              </div>

              <div style={{ backgroundColor: '#14161c', padding: '24px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Nombre del Club</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={e => setClubName(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#181b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Dirección / Ubicación</label>
                  <input
                    type="text"
                    value={clubAddress}
                    onChange={e => setClubAddress(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#181b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Cobros Automáticos con Mercado Pago</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Exigir {autoDepositPercentage}% de seña al reservar desde la app</div>
                  </div>
                  <button
                    onClick={() => setMercadoPagoConnected(!mercadoPagoConnected)}
                    style={{
                      backgroundColor: mercadoPagoConnected ? '#1e293b' : '#241217',
                      color: mercadoPagoConnected ? '#38bdf8' : '#fc1c46',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {mercadoPagoConnected ? '✓ Conectado' : 'Desconectado'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Bot de Respuestas de WhatsApp</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Envío automático de links de reserva a consultas entrantes</div>
                  </div>
                  <button
                    onClick={() => setWhatsappBotEnabled(!whatsappBotEnabled)}
                    style={{
                      backgroundColor: whatsappBotEnabled ? '#1e293b' : '#241217',
                      color: whatsappBotEnabled ? '#4ade80' : '#fc1c46',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {whatsappBotEnabled ? '✓ Activo' : 'Inactivo'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ────────────────────────────────────────────────────────────
            FLOATING REAL-TIME TOAST NOTIFICATION
            ──────────────────────────────────────────────────────────── */}
        {showToast && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 18,
            backgroundColor: '#171920',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: '8px 14px 8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 15px 35px -8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(252, 28, 70, 0.15)',
            zIndex: 100,
            animation: 'fadeInUp 0.3s ease-out',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: '#fc1c46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Nueva reserva</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#fc1c46', display: 'inline-block' }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>· ahora</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                Cancha 2 · 21:00
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: 14,
                cursor: 'pointer',
                padding: '4px',
                marginLeft: 10,
                lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >
              ✕
            </button>
          </div>
        )}

      </div>

      {/* ────────────────────────────────────────────────────────────
          MODAL: "+ NUEVA RESERVA"
          ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 460,
            backgroundColor: '#12141a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '28px 30px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Nueva Reserva
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReservation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Cancha
                </label>
                <select
                  value={modalCourt}
                  onChange={e => setModalCourt(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                  }}
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Horario
                </label>
                <input
                  type="text"
                  value={modalTime}
                  onChange={e => setModalTime(e.target.value)}
                  placeholder="ej. 21:00"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Nombre del Jugador
                </label>
                <input
                  type="text"
                  value={modalPlayer}
                  onChange={e => setModalPlayer(e.target.value)}
                  placeholder="ej. Lautaro Martínez"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={modalPhone}
                  onChange={e => setModalPhone(e.target.value)}
                  placeholder="+54 9 11 0000-0000"
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Tipo de Reserva
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setModalType('RESERVED')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      border: modalType === 'RESERVED' ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: modalType === 'RESERVED' ? 'rgba(252,28,70,0.15)' : 'transparent',
                      color: modalType === 'RESERVED' ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Reserva Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType('FIXED')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      border: modalType === 'FIXED' ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: modalType === 'FIXED' ? 'rgba(225,29,72,0.15)' : 'transparent',
                      color: modalType === 'FIXED' ? '#e11d48' : '#9ca3af',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Turno Fijo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 10,
                  padding: '14px',
                  backgroundColor: '#fc1c46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'filter 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                Guardar Reserva
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Keyframe Animations ── */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
