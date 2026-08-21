import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* ────────────────────────────────────────────────────────────
   Types & Interfaces
   ──────────────────────────────────────────────────────────── */

type NavTab = 'DASHBOARD' | 'CALENDAR' | 'COURTS' | 'PLAYERS' | 'ANALYTICS' | 'SETTINGS';
type SlotStatus = 'RESERVED' | 'AVAILABLE' | 'FIXED' | 'MAINTENANCE';
type PaymentMethod = 'APP_MERCADOPAGO' | 'MOSTRADOR_EFECTIVO' | 'MOSTRADOR_TRANSFERENCIA';

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
  paymentMethod?: PaymentMethod;
  isPaid100: boolean;
}

interface CourtInfo {
  id: string;
  name: string;
  sport: string;
  surface: string;
  active: boolean;
  pausedForWeather?: boolean;
  priceValley: number;
  pricePeak: number;
  indoor: boolean;
  lighting: boolean;
  openTime: string;  // ej: "08:00"
  closeTime: string; // ej: "23:30"
}

interface PlayerRecord {
  id: string;
  name: string;
  phone: string;
  category: string;
  sport: string;
  matchesPlayed: number;
  reliability: number; // 1-5
  playerTag: 'JUGADOR FRECUENTE' | 'ABONADO FIJO' | 'JUGADOR VIP';
  lastPaymentMethod: 'MP (APP 100%)' | 'MOSTRADOR (100%)' | 'PREPAGO MES';
}

/* ────────────────────────────────────────────────────────────
   Initial Data (Strict 100% Upfront Payment + Custom Court Schedule)
   ──────────────────────────────────────────────────────────── */

const INITIAL_SLOTS: CourtSlot[] = [
  { id: 's-1', courtId: 'c-1', courtName: 'Cancha 1 — Panorámica WPT', sport: 'Pádel', time: '18:00', status: 'RESERVED', player: 'Juan R.', price: 48000, phone: '+54 9 11 4433-2211', paymentMethod: 'APP_MERCADOPAGO', isPaid100: true },
  { id: 's-2', courtId: 'c-2', courtName: 'Cancha 2 — Cristal Pro', sport: 'Pádel', time: '18:00', status: 'AVAILABLE', player: '—', price: 45000, isPaid100: false },
  { id: 's-3', courtId: 'c-3', courtName: 'Cancha 3 — Master Climatizada', sport: 'Pádel', time: '19:30', status: 'FIXED', player: 'Escuela Padel', price: 42000, phone: '+54 9 11 9988-7766', paymentMethod: 'MOSTRADOR_TRANSFERENCIA', isPaid100: true },
  { id: 's-4', courtId: 'c-4', courtName: 'Cancha 4 — Fútbol 5 Forbex', sport: 'Fútbol 5', time: '20:00', status: 'AVAILABLE', player: '—', price: 36000, isPaid100: false },
  { id: 's-5', courtId: 'c-1', courtName: 'Cancha 1 — Panorámica WPT', sport: 'Pádel', time: '19:30', status: 'RESERVED', player: 'Rodrigo De Paul', price: 48000, phone: '+54 9 11 5566-7788', paymentMethod: 'APP_MERCADOPAGO', isPaid100: true },
  { id: 's-6', courtId: 'c-2', courtName: 'Cancha 2 — Cristal Pro', sport: 'Pádel', time: '21:00', status: 'RESERVED', player: 'Emiliano M.', price: 45000, phone: '+54 9 11 2233-4455', paymentMethod: 'APP_MERCADOPAGO', isPaid100: true },
  { id: 's-7', courtId: 'c-3', courtName: 'Cancha 3 — Master Climatizada', sport: 'Pádel', time: '21:00', status: 'AVAILABLE', player: '—', price: 42000, isPaid100: false },
  { id: 's-8', courtId: 'c-4', courtName: 'Cancha 4 — Fútbol 5 Forbex', sport: 'Fútbol 5', time: '21:30', status: 'RESERVED', player: 'Torneo Nocturno', price: 36000, phone: '+54 9 11 1122-3344', paymentMethod: 'MOSTRADOR_EFECTIVO', isPaid100: true },
];

const INITIAL_COURTS: CourtInfo[] = [
  { id: 'c-1', name: 'Cancha 1 — Panorámica WPT', sport: 'Pádel', surface: 'Vidrio Panorámico 12mm · Césped Texturado', active: true, pausedForWeather: false, priceValley: 42000, pricePeak: 48000, indoor: true, lighting: true, openTime: '08:00', closeTime: '23:30' },
  { id: 'c-2', name: 'Cancha 2 — Cristal Pro', sport: 'Pádel', surface: 'Vidrio Templado 10mm · Césped Monofilamento', active: true, pausedForWeather: false, priceValley: 38000, pricePeak: 45000, indoor: true, lighting: true, openTime: '08:00', closeTime: '23:30' },
  { id: 'c-3', name: 'Cancha 3 — Master Climatizada', sport: 'Pádel', surface: 'Muros Perimetrales · Cubierta Climatizada', active: true, pausedForWeather: false, priceValley: 36000, pricePeak: 42000, indoor: true, lighting: true, openTime: '09:00', closeTime: '23:00' },
  { id: 'c-4', name: 'Cancha 4 — Fútbol 5 Forbex', sport: 'Fútbol 5', surface: 'Césped Sintético Forbex 50mm con Caucho', active: true, pausedForWeather: false, priceValley: 30000, pricePeak: 36000, indoor: false, lighting: true, openTime: '10:00', closeTime: '24:00' },
];

const INITIAL_PLAYERS: PlayerRecord[] = [
  { id: 'p-1', name: 'Juan Román Riquelme', phone: '+54 9 11 4433-2211', category: '4ta División', sport: 'Pádel', matchesPlayed: 28, reliability: 5, playerTag: 'JUGADOR FRECUENTE', lastPaymentMethod: 'MP (APP 100%)' },
  { id: 'p-2', name: 'Rodrigo De Paul', phone: '+54 9 11 5566-7788', category: '3ra Libre', sport: 'Pádel', matchesPlayed: 19, reliability: 5, playerTag: 'JUGADOR VIP', lastPaymentMethod: 'MP (APP 100%)' },
  { id: 'p-3', name: 'Emiliano Martínez', phone: '+54 9 11 2233-4455', category: 'Arquero / 5ta', sport: 'Fútbol 5', matchesPlayed: 34, reliability: 5, playerTag: 'JUGADOR VIP', lastPaymentMethod: 'MP (APP 100%)' },
  { id: 'p-4', name: 'Lautaro Martínez', phone: '+54 9 11 3322-1144', category: 'Delantero / Pro', sport: 'Fútbol 5', matchesPlayed: 15, reliability: 4, playerTag: 'JUGADOR FRECUENTE', lastPaymentMethod: 'MOSTRADOR (100%)' },
  { id: 'p-5', name: 'Escuela Padel Menores', phone: '+54 9 11 9988-7766', category: 'Formativo / Fijo', sport: 'Pádel', matchesPlayed: 52, reliability: 5, playerTag: 'ABONADO FIJO', lastPaymentMethod: 'PREPAGO MES' },
  { id: 'p-6', name: 'Marcos Acuña', phone: '+54 9 11 7788-9900', category: '5ta División', sport: 'Pádel', matchesPlayed: 11, reliability: 4, playerTag: 'JUGADOR FRECUENTE', lastPaymentMethod: 'MP (APP 100%)' },
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
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('TODOS');
  const [showToast, setShowToast] = useState(true);

  // Core Data state
  const [slots, setSlots] = useState<CourtSlot[]>(INITIAL_SLOTS);
  const [courts, setCourts] = useState<CourtInfo[]>(INITIAL_COURTS);
  const [players, setPlayers] = useState<PlayerRecord[]>(INITIAL_PLAYERS);
  const [searchPlayer, setSearchPlayer] = useState('');

  // Settings State
  const [mercadoPagoConnected, setMercadoPagoConnected] = useState(true);
  const [whatsappBotEnabled, setWhatsappBotEnabled] = useState(true);
  const [cancellationWindowHours, setCancellationWindowHours] = useState(6);
  const [clubAddress, setClubAddress] = useState('Av. Del Libertador 4400, Palermo, CABA');

  // Modal "+ Nueva reserva"
  const [showModal, setShowModal] = useState(false);
  const [modalCourt, setModalCourt] = useState('c-1');
  const [modalTime, setModalTime] = useState('21:00');
  const [modalSelectedPlayerId, setModalSelectedPlayerId] = useState<string>('CUSTOM');
  const [modalPlayer, setModalPlayer] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalType, setModalType] = useState<SlotStatus>('RESERVED');
  const [modalPaymentMethod, setModalPaymentMethod] = useState<PaymentMethod>('MOSTRADOR_EFECTIVO');

  // Modal "+ Configurar / Editar Cancha"
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [courtNameInput, setCourtNameInput] = useState('');
  const [courtSportInput, setCourtSportInput] = useState('Pádel');
  const [courtSurfaceInput, setCourtSurfaceInput] = useState('Vidrio Templado 10mm');
  const [courtOpenTimeInput, setCourtOpenTimeInput] = useState('08:00');
  const [courtCloseTimeInput, setCourtCloseTimeInput] = useState('23:30');
  const [courtPriceValleyInput, setCourtPriceValleyInput] = useState(38000);
  const [courtPricePeakInput, setCourtPricePeakInput] = useState(45000);
  const [courtIndoorInput, setCourtIndoorInput] = useState(true);
  const [courtLightingInput, setCourtLightingInput] = useState(true);

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

  // Open Court Modal for Add or Edit
  const handleOpenCourtModal = (court?: CourtInfo) => {
    if (court) {
      setEditingCourtId(court.id);
      setCourtNameInput(court.name);
      setCourtSportInput(court.sport);
      setCourtSurfaceInput(court.surface);
      setCourtOpenTimeInput(court.openTime || '08:00');
      setCourtCloseTimeInput(court.closeTime || '23:30');
      setCourtPriceValleyInput(court.priceValley);
      setCourtPricePeakInput(court.pricePeak);
      setCourtIndoorInput(court.indoor);
      setCourtLightingInput(court.lighting);
    } else {
      setEditingCourtId(null);
      setCourtNameInput(`Cancha ${courts.length + 1}`);
      setCourtSportInput('Pádel');
      setCourtSurfaceInput('Sintético & Cristal Pro');
      setCourtOpenTimeInput('08:00');
      setCourtCloseTimeInput('23:30');
      setCourtPriceValleyInput(38000);
      setCourtPricePeakInput(45000);
      setCourtIndoorInput(true);
      setCourtLightingInput(true);
    }
    setShowCourtModal(true);
  };

  // Save Court (Add or Edit)
  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtNameInput.trim()) return;

    if (editingCourtId) {
      setCourts(prev => prev.map(c => c.id === editingCourtId ? {
        ...c,
        name: courtNameInput.trim(),
        sport: courtSportInput,
        surface: courtSurfaceInput,
        openTime: courtOpenTimeInput,
        closeTime: courtCloseTimeInput,
        priceValley: courtPriceValleyInput,
        pricePeak: courtPricePeakInput,
        indoor: courtIndoorInput,
        lighting: courtLightingInput,
      } : c));
    } else {
      const newCourt: CourtInfo = {
        id: `c-${Date.now()}`,
        name: courtNameInput.trim(),
        sport: courtSportInput,
        surface: courtSurfaceInput,
        active: true,
        pausedForWeather: false,
        openTime: courtOpenTimeInput,
        closeTime: courtCloseTimeInput,
        priceValley: courtPriceValleyInput,
        pricePeak: courtPricePeakInput,
        indoor: courtIndoorInput,
        lighting: courtLightingInput,
      };
      setCourts(prev => [...prev, newCourt]);
    }
    setShowCourtModal(false);
  };

  // Cycle status on row click
  const handleToggleStatus = (id: string) => {
    setSlots(prev =>
      prev.map(slot => {
        if (slot.id !== id) return slot;
        if (slot.status === 'AVAILABLE') {
          return { ...slot, status: 'RESERVED', player: 'Mostrador 100%', paymentMethod: 'MOSTRADOR_EFECTIVO', isPaid100: true };
        }
        if (slot.status === 'RESERVED') {
          return { ...slot, status: 'FIXED', player: 'Turno Fijo Prepago', paymentMethod: 'MOSTRADOR_TRANSFERENCIA', isPaid100: true };
        }
        if (slot.status === 'FIXED') {
          return { ...slot, status: 'AVAILABLE', player: '—', isPaid100: false };
        }
        return { ...slot, status: 'AVAILABLE', player: '—', isPaid100: false };
      })
    );
  };

  // Toggle Court Active / Weather Pause
  const handleToggleCourtActive = (id: string) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleToggleWeatherPause = (id: string) => {
    setCourts(prev => prev.map(c => c.id === id ? { ...c, pausedForWeather: !c.pausedForWeather } : c));
  };

  // Select player in Modal
  const handleSelectPlayerInModal = (id: string) => {
    setModalSelectedPlayerId(id);
    if (id === 'CUSTOM') {
      setModalPlayer('');
      setModalPhone('');
    } else {
      const p = players.find(x => x.id === id);
      if (p) {
        setModalPlayer(p.name);
        setModalPhone(p.phone);
      }
    }
  };

  // Add new reservation (Strict 100% Paid)
  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === modalCourt) || courts[0];
    const newSlot: CourtSlot = {
      id: `slot-${Date.now()}`,
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      time: modalTime,
      status: modalType,
      player: modalPlayer.trim() || 'Reserva Directa',
      phone: modalPhone.trim() || undefined,
      price: court.pricePeak,
      paymentMethod: modalPaymentMethod,
      isPaid100: true,
    };
    setSlots(prev => [newSlot, ...prev]);
    setShowModal(false);
    setModalPlayer('');
    setModalPhone('');
    setModalSelectedPlayerId('CUSTOM');
  };

  // Print Daily Roster
  const handlePrintDailyRoster = () => {
    window.print();
  };

  // Filtered Courts & Slots by Sport Filter
  const filteredCourts = useMemo(() => {
    if (selectedSportFilter === 'TODOS') return courts;
    return courts.filter(c => c.sport.toUpperCase().includes(selectedSportFilter));
  }, [courts, selectedSportFilter]);

  const filteredSlots = useMemo(() => {
    let result = slots;
    if (selectedSportFilter !== 'TODOS') {
      result = result.filter(s => s.sport.toUpperCase().includes(selectedSportFilter));
    }
    return result;
  }, [slots, selectedSportFilter]);

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    let result = players;
    if (selectedSportFilter !== 'TODOS') {
      result = result.filter(p => p.sport.toUpperCase().includes(selectedSportFilter));
    }
    if (searchPlayer.trim()) {
      const q = searchPlayer.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [players, searchPlayer, selectedSportFilter]);

  // Metrics calculation
  const totalReservedToday = useMemo(() => {
    return filteredSlots.filter(s => s.status === 'RESERVED' || s.status === 'FIXED').length + 8;
  }, [filteredSlots]);

  const activeCourtsCount = useMemo(() => {
    return filteredCourts.filter(c => c.active && !c.pausedForWeather).length;
  }, [filteredCourts]);

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
        <title>{clubName} — Panel de Gestión</title>
        <meta name="description" content="Panel de control en tiempo real para gestión de reservas 100% anticipadas" />
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
        boxSizing: 'border-box',
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
                title="Matriz de Horarios & Turnos"
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
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>

              {/* Tab 3: Courts Layout & Config */}
              <button
                onClick={() => setActiveTab('COURTS')}
                title="Configuración de Canchas & Horarios (+)"
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
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="14" height="18" rx="2" />
                  <line x1="2" y1="12" x2="16" y2="12" />
                  <circle cx="9" cy="12" r="2.5" />
                  <circle cx="18.5" cy="5.5" r="4.5" fill="#fc1c46" stroke="#0f1115" strokeWidth="1.5" />
                  <line x1="18.5" y1="3.5" x2="18.5" y2="7.5" stroke="#ffffff" strokeWidth="1.8" />
                  <line x1="16.5" y1="5.5" x2="20.5" y2="5.5" stroke="#ffffff" strokeWidth="1.8" />
                </svg>
              </button>

              {/* Tab 4: Players / Community */}
              <button
                onClick={() => setActiveTab('PLAYERS')}
                title="Base de Jugadores"
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
                title="Métricas & Ocupación"
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
            flexWrap: 'wrap',
            gap: 10,
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
              }}>
                <span>{clubName}</span>
                <span style={{ fontSize: 10, color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                  🔒 Pago 100% Anticipado
                </span>
              </div>
            </div>

            {/* Middle: Sport Filter Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#16181e',
              padding: 3,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['TODOS', 'PÁDEL', 'FÚTBOL 5', 'FÚTBOL 7'].map(sport => (
                <button
                  key={sport}
                  onClick={() => setSelectedSportFilter(sport)}
                  style={{
                    backgroundColor: selectedSportFilter === sport ? '#fc1c46' : 'transparent',
                    color: selectedSportFilter === sport ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sport}
                </button>
              ))}
            </div>

            {/* Right Controls: Notifications + Date Pill + Print */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handlePrintDailyRoster}
                title="Imprimir planilla del día"
                style={{
                  backgroundColor: '#16181e',
                  color: '#d1d5db',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>🖨️ Planilla</span>
              </button>

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
              </div>
            </div>
          </header>


          {/* ═══════════════════════════════════════════════════════
              VIEW 1: DASHBOARD
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
                      reservas confirmadas hoy
                    </div>
                  </div>
                </div>

                {/* KPI 2: Facturación semanal (100% Cobrada) */}
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
                    backgroundColor: 'rgba(74, 222, 128, 0.12)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ade80',
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
                    <div style={{ fontSize: 11, color: '#4ade80', marginTop: 3 }}>
                      100% cobrado esta semana
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
                      {activeCourtsCount} / {filteredCourts.length}
                    </div>
                    <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 3 }}>
                      canchas operativas
                    </div>
                  </div>
                </div>
              </section>

              {/* MAIN SPLIT GRID (HORARIOS + ACTIVIDAD) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.7fr 1fr',
                gap: 14,
                flex: 1,
              }}>
                {/* LEFT: HORARIOS DEL DÍA */}
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
                        Horarios del Día (Pagados 100%)
                      </h2>
                    </div>

                    {/* Matrix Table Header: HORA | Cancha 1 | Cancha 2 | Cancha 3 | ... */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `0.7fr repeat(${Math.max(1, filteredCourts.length)}, 1fr)`,
                      gap: 8,
                      paddingBottom: 10,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      alignItems: 'center',
                    }}>
                      <div>HORA</div>
                      {filteredCourts.map(court => (
                        <div key={court.id} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={court.name}>
                          {court.name.split('—')[0].trim()}
                        </div>
                      ))}
                    </div>

                    {/* Matrix Table Rows: Operating Hours */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                      {['16:30', '18:00', '19:30', '21:00', '22:30'].map((time) => (
                        <div
                          key={time}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `0.7fr repeat(${Math.max(1, filteredCourts.length)}, 1fr)`,
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          {/* Time Column */}
                          <div style={{ color: '#d1d5db', fontSize: 12, fontWeight: 700 }}>
                            {time} hs
                          </div>

                          {/* Court Columns */}
                          {filteredCourts.map((court) => {
                            const slot = filteredSlots.find(s => s.courtId === court.id && s.time === time);
                            const isReserved = slot && (slot.status === 'RESERVED' || slot.status === 'FIXED');

                            if (isReserved) {
                              return (
                                <div
                                  key={court.id}
                                  onClick={() => slot && handleToggleStatus(slot.id)}
                                  title={`Click para alternar estado — ${slot.player}`}
                                  style={{
                                    backgroundColor: slot.status === 'FIXED' ? 'rgba(225, 29, 72, 0.15)' : 'rgba(252, 28, 70, 0.15)',
                                    border: slot.status === 'FIXED' ? '1px solid rgba(225, 29, 72, 0.35)' : '1px solid rgba(252, 28, 70, 0.35)',
                                    borderRadius: 8,
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s ease',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {slot.player}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: slot.status === 'FIXED' ? '#e11d48' : '#fc1c46', fontWeight: 600, marginTop: 1 }}>
                                    {slot.status === 'FIXED' ? '✓ Turno Fijo' : '✓ Pagado 100%'}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={court.id}
                                onClick={() => {
                                  if (slot) {
                                    handleToggleStatus(slot.id);
                                  } else {
                                    setModalCourt(court.id);
                                    setModalTime(time);
                                    setShowModal(true);
                                  }
                                }}
                                title="Click para reservar turno disponible"
                                style={{
                                  backgroundColor: '#181b22',
                                  border: '1px solid rgba(255, 255, 255, 0.04)',
                                  borderRadius: 8,
                                  padding: '6px 8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = 'rgba(252, 28, 70, 0.3)';
                                  e.currentTarget.style.backgroundColor = '#20242f';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                                  e.currentTarget.style.backgroundColor = '#181b22';
                                }}
                              >
                                <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
                                  Disponible
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
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
                      Curva de Ocupación Hoy
                    </h3>

                    <div style={{ position: 'relative', width: '100%', height: 95 }}>
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
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 18, marginTop: 4, fontSize: 9, color: '#6b7280' }}>
                      <span>08h</span>
                      <span>12h</span>
                      <span>16h</span>
                      <span>20h</span>
                      <span>24h</span>
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
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                    <span>Nueva reserva manual (100% Pagada)</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 2: CALENDAR / TURNOS (Full Timeline Matrix View)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'CALENDAR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Grilla Matriz de Turnos y Disponibilidad</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Supervisá la ocupación en tiempo real por cancha e itinerario de horas.</p>
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
                {filteredCourts.map((court) => {
                  const courtSlots = filteredSlots.filter(s => s.courtId === court.id);

                  return (
                    <div
                      key={court.id}
                      style={{
                        backgroundColor: '#14161c',
                        borderRadius: 18,
                        border: court.pausedForWeather ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{court.name}</div>
                          <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 2 }}>
                            <span style={{ color: '#fc1c46', fontWeight: 600 }}>{court.sport}</span> · 🕒 {court.openTime} a {court.closeTime} hs
                          </div>
                        </div>

                        {/* Weather Pause Button */}
                        <button
                          onClick={() => handleToggleWeatherPause(court.id)}
                          title="Pausar venta por lluvia o viento"
                          style={{
                            backgroundColor: court.pausedForWeather ? 'rgba(234, 179, 8, 0.2)' : '#181b22',
                            color: court.pausedForWeather ? '#eab308' : '#6b7280',
                            border: court.pausedForWeather ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            padding: '4px 8px',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {court.pausedForWeather ? '🌧️ Pausada Lluvia' : '☁ Clima OK'}
                        </button>
                      </div>

                      {/* Slots List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {court.pausedForWeather ? (
                          <div style={{ padding: '20px 10px', textAlign: 'center', color: '#eab308', fontSize: 12, backgroundColor: 'rgba(234, 179, 8, 0.08)', borderRadius: 10 }}>
                            🌧️ Cancha descubierta pausada temporariamente por motivos climáticos.
                          </div>
                        ) : (
                          courtSlots.map(s => (
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
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 6,
                                backgroundColor: s.status === 'AVAILABLE' ? '#20232a' : '#fc1c46',
                                color: s.status === 'AVAILABLE' ? '#9ca3af' : '#fff',
                              }}>
                                {s.status === 'AVAILABLE' ? 'LIBRE' : s.status === 'FIXED' ? '✓ FIJO PREPAGO' : '✓ 100% PAGADO'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              VIEW 3: COURTS & TARIFAS (Con Nombres y Horarios Editables)
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'COURTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Configuración de Canchas y Horarios Habilitados</h2>
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Personalizá nombres de canchas, superficies, franjas horarias de apertura/cierre y tarifas.</p>
                </div>
                <button
                  onClick={() => handleOpenCourtModal()}
                  style={{
                    backgroundColor: '#fc1c46',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Agregar Nueva Cancha
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {filteredCourts.map(court => (
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenCourtModal(court)}
                          style={{
                            backgroundColor: '#1e293b',
                            color: '#38bdf8',
                            border: 'none',
                            borderRadius: 9999,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ✏️ Editar
                        </button>
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
                    </div>

                    {/* Horarios Habilitados Tag */}
                    <div style={{ backgroundColor: '#181b22', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Horarios Habilitados para Reserva</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🕒 {court.openTime} hs a {court.closeTime} hs</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                  <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Historial de partidos jugados y hábitos de pago confirmado.</p>
                </div>
                <input
                  type="text"
                  value={searchPlayer}
                  onChange={e => setSearchPlayer(e.target.value)}
                  placeholder="🔍 Buscar jugador..."
                  style={{
                    backgroundColor: '#16181e',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    width: 240,
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
                  gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.2fr',
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
                  <div style={{ textAlign: 'right' }}>MÉTODO HABITUAL (100%)</div>
                </div>

                {filteredPlayers.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.2fr',
                      padding: '14px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center',
                      fontSize: 13.5,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                      <span style={{ fontSize: 9.5, color: '#fc1c46', backgroundColor: 'rgba(252,28,70,0.12)', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginTop: 2, display: 'inline-block' }}>
                        {p.playerTag}
                      </span>
                    </div>
                    <div style={{ color: '#9ca3af' }}>{p.phone}</div>
                    <div style={{ color: '#d1d5db', fontSize: 12 }}>{p.category} · {p.sport}</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{p.matchesPlayed} jugados</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ backgroundColor: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        ✓ {p.lastPaymentMethod}
                      </span>
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
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Análisis de ocupación por horario y cobros 100% anticipados.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Facturación Total del Mes</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginTop: 6 }}>$1.840.000</div>
                  <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>✓ 100% Cobrado por Adelantado</div>
                </div>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Tasa Ocupación Franja Pico</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#fc1c46', marginTop: 6 }}>94.2%</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>18:00 a 24:00 hs</div>
                </div>
                <div style={{ backgroundColor: '#14161c', padding: '20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Cobro por App Mercado Pago</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#38bdf8', marginTop: 6 }}>82%</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>18% restante cobrado en mostrador</div>
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
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Integración de cobros, políticas de cancelación y automatización de WhatsApp.</p>
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
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Cobro 100% Obligatorio Mercado Pago</div>
                    <div style={{ fontSize: 12, color: '#888' }}>La app exige el pago total del turno para confirmar la reserva</div>
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
                    {mercadoPagoConnected ? '✓ Conectado 100%' : 'Desconectado'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Política de Cancelación / Devolución</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Devolución automática si el jugador cancela con más de {cancellationWindowHours} horas de anticipación</div>
                  </div>
                  <select
                    value={cancellationWindowHours}
                    onChange={e => setCancellationWindowHours(Number(e.target.value))}
                    style={{ backgroundColor: '#181b22', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}
                  >
                    <option value={2}>2 horas</option>
                    <option value={4}>4 horas</option>
                    <option value={6}>6 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                  </select>
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
              backgroundColor: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Nueva reserva 100% Pagada</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>· ahora</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                Cancha 2 · 21:00 hs · Mercado Pago ($45.000)
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
            >
              ✕
            </button>
          </div>
        )}

      </div>

      {/* ────────────────────────────────────────────────────────────
          MODAL 1: "+ NUEVA RESERVA MANUAL"
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
            maxWidth: 480,
            backgroundColor: '#12141a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '26px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Nueva Reserva Manual
                </h3>
                <div style={{ fontSize: 11, color: '#4ade80', marginTop: 2 }}>✓ Pago 100% anticipado requerido</div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReservation} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
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
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Seleccionar Jugador de Base de Datos
                </label>
                <select
                  value={modalSelectedPlayerId}
                  onChange={e => handleSelectPlayerInModal(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                  }}
                >
                  <option value="CUSTOM">+ Tipear Nuevo Jugador Manualmente</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
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
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Método de Pago Confirmado (100%)
                </label>
                <select
                  value={modalPaymentMethod}
                  onChange={e => setModalPaymentMethod(e.target.value as PaymentMethod)}
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                  }}
                >
                  <option value="MOSTRADOR_EFECTIVO">💵 Efectivo Mostrador (100% Pagado)</option>
                  <option value="MOSTRADOR_TRANSFERENCIA">💳 Transferencia / Débito (100% Pagado)</option>
                  <option value="APP_MERCADOPAGO">📱 Mercado Pago App (100% Pagado)</option>
                </select>
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
                      padding: '9px',
                      borderRadius: 8,
                      border: modalType === 'RESERVED' ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: modalType === 'RESERVED' ? 'rgba(252,28,70,0.15)' : 'transparent',
                      color: modalType === 'RESERVED' ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Reserva Puntual
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType('FIXED')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 8,
                      border: modalType === 'FIXED' ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: modalType === 'FIXED' ? 'rgba(225,29,72,0.15)' : 'transparent',
                      color: modalType === 'FIXED' ? '#e11d48' : '#9ca3af',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Turno Fijo Mensual
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 8,
                  padding: '13px',
                  backgroundColor: '#fc1c46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Confirmar Reserva (100% Pagado)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 2: "+ CONFIGURAR / EDITAR CANCHA Y HORARIOS"
          ──────────────────────────────────────────────────────────── */}
      {showCourtModal && (
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
            maxWidth: 500,
            backgroundColor: '#12141a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: '26px 28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {editingCourtId ? 'Editar Cancha y Horarios' : 'Configurar Nueva Cancha'}
                </h3>
                <div style={{ fontSize: 11, color: '#fc1c46', marginTop: 2 }}>Establecé el nombre personalizado y la franja de apertura</div>
              </div>
              <button
                onClick={() => setShowCourtModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourt} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Nombre Personalizado de la Cancha
                </label>
                <input
                  type="text"
                  value={courtNameInput}
                  onChange={e => setCourtNameInput(e.target.value)}
                  placeholder="ej. Cancha 1 — Panorámica WPT"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#181b22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                    Deporte
                  </label>
                  <select
                    value={courtSportInput}
                    onChange={e => setCourtSportInput(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#181b22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13.5,
                    }}
                  >
                    <option value="Pádel">Pádel</option>
                    <option value="Fútbol 5">Fútbol 5</option>
                    <option value="Fútbol 7">Fútbol 7</option>
                    <option value="Tenis">Tenis</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                    Tipo de Superficie
                  </label>
                  <input
                    type="text"
                    value={courtSurfaceInput}
                    onChange={e => setCourtSurfaceInput(e.target.value)}
                    placeholder="ej. Césped Sintético"
                    style={{
                      width: '100%',
                      backgroundColor: '#181b22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13.5,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Operating Schedule Configuration */}
              <div style={{ backgroundColor: '#181b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                  🕒 Horarios Habilitados para Reserva en App
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Hora Apertura</label>
                    <input
                      type="text"
                      value={courtOpenTimeInput}
                      onChange={e => setCourtOpenTimeInput(e.target.value)}
                      placeholder="08:00"
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#11131a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#ffffff',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Hora Cierre</label>
                    <input
                      type="text"
                      value={courtCloseTimeInput}
                      onChange={e => setCourtCloseTimeInput(e.target.value)}
                      placeholder="23:30"
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#11131a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#ffffff',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                    Tarifa Valle ($)
                  </label>
                  <input
                    type="number"
                    value={courtPriceValleyInput}
                    onChange={e => setCourtPriceValleyInput(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#181b22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13.5,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#fc1c46', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                    Tarifa Pico ($)
                  </label>
                  <input
                    type="number"
                    value={courtPricePeakInput}
                    onChange={e => setCourtPricePeakInput(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#181b22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: 13.5,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 8,
                  padding: '13px',
                  backgroundColor: '#fc1c46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Guardar Configuración de Cancha
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
