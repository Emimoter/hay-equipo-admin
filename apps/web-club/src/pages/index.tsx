import React, { useState } from 'react';
import Head from 'next/head';

interface ClubData {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  phone: string;
  whatsapp: string;
  courtsCount: number;
  badge: string;
}

const CLUBS: ClubData[] = [
  { id: 'club-arena-palermo', name: 'Arena Pádel Palermo', location: 'Palermo Hollywood · CABA', rating: 4.9, reviews: 512, phone: '+54 11 4772-5500', whatsapp: '+54 9 11 3344-8899', courtsCount: 3, badge: 'WPT Master Club' },
  { id: 'club-la-cantera-palermo', name: 'La Cantera Fútbol Club', location: 'Palermo · CABA', rating: 4.8, reviews: 428, phone: '+54 11 4778-9000', whatsapp: '+54 9 11 2233-4455', courtsCount: 2, badge: 'Césped 60mm Pro' },
  { id: 'club-belgrano-r-padel', name: 'Belgrano R Pádel Lounge', location: 'Belgrano R · CABA', rating: 4.9, reviews: 389, phone: '+54 11 4554-1122', whatsapp: '+54 9 11 8899-7766', courtsCount: 2, badge: 'Panorámicas 12mm' },
  { id: 'club-central-park-urquiza', name: 'Central Park Complejo', location: 'Villa Urquiza · CABA', rating: 4.8, reviews: 680, phone: '+54 11 4522-7788', whatsapp: '+54 9 11 6655-4433', courtsCount: 4, badge: 'F5, F7, F8, F11' },
  { id: 'club-san-isidro-padel', name: 'San Isidro Pádel Club', location: 'San Isidro · Zona Norte', rating: 4.9, reviews: 410, phone: '+54 11 4743-9988', whatsapp: '+54 9 11 9988-1122', courtsCount: 2, badge: 'Outdoor & Spa' }
];

export default function HayEquipoProAdmin() {
  const [selectedClubId, setSelectedClubId] = useState<string>('club-arena-palermo');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'AGENDA' | 'FIXED' | 'COURTS' | 'PLAYERS' | 'PAYMENTS' | 'PROMOS'>('DASHBOARD');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  // Quick booking drawer state
  const [drawerCourt, setDrawerCourt] = useState<string>('Cancha 1 — Central Panorámica WPT');
  const [drawerTime, setDrawerTime] = useState<string>('20:00');
  const [drawerClient, setDrawerClient] = useState<string>('');
  const [drawerPhone, setDrawerPhone] = useState<string>('');
  const [drawerPrice, setDrawerPrice] = useState<number>(48000);
  const [drawerSource, setDrawerSource] = useState<'WHATSAPP' | 'COUNTER'>('WHATSAPP');

  // Live Bookings Feed
  const [liveBookings, setLiveBookings] = useState<any[]>([
    { id: 'bk-1', court: 'Cancha 1 — Central Panorámica WPT', sport: 'PÁDEL', client: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', time: '19:30 – 21:00 hs', method: 'SPLIT (4/4)', amount: 48000, status: 'CONFIRMADO', channel: 'App Móvil' },
    { id: 'bk-2', court: 'Cancha 2 — Indoor Vidrio Pro', sport: 'PÁDEL', client: 'Lucas Gómez', phone: '+54 9 11 4433-2211', time: '21:00 – 22:30 hs', method: 'PAGO TOTAL', amount: 45000, status: 'CONFIRMADO', channel: 'App Móvil' },
    { id: 'bk-3', court: 'Cancha 3 — Indoor Climatizada', sport: 'PÁDEL', client: 'Rodrigo De Paul', phone: '+54 9 11 9988-7766', time: '18:00 – 19:30 hs', method: 'MOSTRADOR', amount: 42000, status: 'CONFIRMADO', channel: 'WhatsApp' },
    { id: 'bk-4', court: 'Cancha 1 — Central Panorámica WPT', sport: 'PÁDEL', client: 'Cristian Romero', phone: '+54 9 11 7766-5544', time: '22:30 – 00:00 hs', method: 'SPLIT (2/4)', amount: 48000, status: 'PARCIAL', channel: 'App Móvil' }
  ]);

  // Turnos Fijos
  const [fixedSubscriptions, setFixedSubscriptions] = useState<any[]>([
    { id: 'sub-1', holder: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', court: 'Cancha 1 (Central Panorámica)', schedule: 'Jueves · 21:00 hs', sport: 'Pádel', plan: 'Débito Automático', pricePerMatch: 42240, monthlyTotal: 168960, savings: 23040, status: 'ACTIVO' },
    { id: 'sub-2', holder: 'Gonzalo Montiel', phone: '+54 9 11 7788-9900', court: 'Cancha 2 (Indoor Vidrio)', schedule: 'Martes · 20:00 hs', sport: 'Pádel', plan: 'Mensual Anticipado', pricePerMatch: 40500, monthlyTotal: 162000, savings: 18000, status: 'ACTIVO' },
    { id: 'sub-3', holder: 'Lautaro Martínez', phone: '+54 9 11 3322-1144', court: 'Cancha A (Fútbol 5 Techada)', schedule: 'Miércoles · 21:00 hs', sport: 'Fútbol 5', plan: 'Trimestral (-15%)', pricePerMatch: 30600, monthlyTotal: 122400, savings: 21600, status: 'ACTIVO' }
  ]);

  // CRM Players
  const [playersList, setPlayersList] = useState<any[]>([
    { id: 'pl-1', name: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', rank: '5ta Pádel / F7', matches: 32, spent: 384000, credit: 12000, lastBooking: 'Hoy 19:30 hs', status: 'VIP Gold' },
    { id: 'pl-2', name: 'Rodrigo De Paul', phone: '+54 9 11 9988-7766', rank: '4ta Pádel', matches: 24, spent: 288000, credit: 4000, lastBooking: 'Ayer 18:00 hs', status: 'VIP Silver' },
    { id: 'pl-3', name: 'Lucas Gómez', phone: '+54 9 11 4433-2211', rank: '6ta Pádel', matches: 16, spent: 192000, credit: 0, lastBooking: 'Hace 2 días', status: 'Jugador Frecuente' },
    { id: 'pl-4', name: 'Gonzalo Montiel', phone: '+54 9 11 7788-9900', rank: '5ta Pádel', matches: 19, spent: 228000, credit: 8000, lastBooking: 'Hace 4 días', status: 'VIP Silver' }
  ]);

  const currentClub = CLUBS.find(c => c.id === selectedClubId) || CLUBS[0];

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `bk-${Date.now()}`,
      court: drawerCourt,
      sport: 'PÁDEL',
      client: drawerClient,
      phone: drawerPhone,
      time: `${drawerTime} – 21:30 hs`,
      method: drawerSource === 'WHATSAPP' ? 'WHATSAPP' : 'MOSTRADOR',
      amount: drawerPrice,
      status: 'CONFIRMADO',
      channel: drawerSource === 'WHATSAPP' ? 'WhatsApp' : 'Mostrador'
    };
    setLiveBookings([newEntry, ...liveBookings]);
    setShowDrawer(false);
    setDrawerClient('');
    setDrawerPhone('');
  };

  const handleLiberate = (name: string) => {
    alert(`⚡ El turno fijo de ${name} ha sido liberado al Marketplace de "Hay equipo?". Se enviaron notificaciones push instantáneas a 48 jugadores en lista de espera.`);
  };

  return (
    <div style={{ backgroundColor: '#05070B', color: '#F3F4F6', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Head>
        <title>Hay equipo? — Sports OS & Club Backoffice</title>
        <meta name="description" content="Plataforma de alta precisión para gestión de complejos deportivos" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      {/* Atmospheric Ambient Glows */}
      <div style={{ position: 'fixed', top: '-120px', left: '15%', width: '500px', height: '400px', background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: '600px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top Floating Glass Island Navbar */}
      <header style={{ padding: '16px 32px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5, 7, 11, 0.82)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: '#05070B', boxShadow: '0 0 24px rgba(34,197,94,0.35)' }}>
                ⚡
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.6px', color: '#FFF' }}>HAY EQUIPO?</span>
                  <span style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ADE80', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(34,197,94,0.25)', letterSpacing: '0.5px' }}>
                    PRO OS
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Operating System para Complejos Deportivos</div>
              </div>
            </div>

            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

            {/* Club Selector Double-Bezel */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ backgroundColor: '#0D131F', padding: '6px 14px', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>🏟️</span>
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  style={{ backgroundColor: 'transparent', color: '#F1F5F9', border: 'none', fontWeight: 700, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                >
                  {CLUBS.map(c => (
                    <option key={c.id} value={c.id} style={{ backgroundColor: '#0D131F', color: '#FFF' }}>
                      {c.name} ({c.badge})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Center & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ADE80' }}>RED EN VIVO (SSE / REDIS)</span>
            </div>

            {/* Nested CTA Button-in-Button */}
            <button
              onClick={() => setShowDrawer(true)}
              style={{
                backgroundColor: '#22C55E',
                color: '#05070B',
                border: 'none',
                padding: '8px 8px 8px 18px',
                borderRadius: '999px',
                fontWeight: 900,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 0 20px rgba(34,197,94,0.3)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span>+ Reserva Manual</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '14px', backgroundColor: 'rgba(5,7,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>
                💬
              </div>
            </button>

            {/* Avatar */}
            <div style={{ width: '38px', height: '38px', borderRadius: '19px', backgroundColor: '#111A29', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: '#22C55E' }}>
              EM
            </div>
          </div>

        </div>
      </header>

      {/* High-End Sub-Nav Tabs */}
      <nav style={{ padding: '0 32px', backgroundColor: 'rgba(9, 13, 20, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {[
            { key: 'DASHBOARD', label: 'Dashboard & Telemetría', icon: '📊' },
            { key: 'AGENDA', label: 'Timeline Hoy en Vivo', icon: '📅' },
            { key: 'FIXED', label: 'Turnos Fijos (Suscripciones)', icon: '⚡' },
            { key: 'COURTS', label: 'Canchas & Tarifas Dinámicas', icon: '🏟️' },
            { key: 'PLAYERS', label: 'Jugadores & CRM WhatsApp', icon: '👥' },
            { key: 'PAYMENTS', label: 'Liquidaciones Mercado Pago', icon: '💳' },
            { key: 'PROMOS', label: 'Yield Management & Promos', icon: '🎁' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '16px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #22C55E' : '2px solid transparent',
                color: activeTab === tab.key ? '#FFF' : '#64748B',
                fontWeight: activeTab === tab.key ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Experience Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px', position: 'relative', zIndex: 1 }}>

        {/* 1. TAB: DASHBOARD GLOBAL */}
        {activeTab === 'DASHBOARD' && (
          <div>
            {/* Header Title with Eyebrow */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, color: '#4ADE80', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  CENTRAL DE OPERACIONES · {currentClub.name.toUpperCase()}
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.8px', color: '#FFF' }}>
                  {currentClub.name}
                </h2>
                <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
                  {currentClub.location} · {currentClub.rating} ★ ({currentClub.reviews} reseñas verificadas)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('AGENDA')}
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  📅 Ver Grilla Hoy
                </button>
                <button
                  onClick={() => setShowDrawer(true)}
                  style={{ backgroundColor: '#22C55E', color: '#05070B', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', cursor: 'pointer' }}
                >
                  + Cargar Turno
                </button>
              </div>
            </div>

            {/* Asymmetric Bento Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginBottom: '32px' }}>
              
              {/* Card 1: Ocupación Hoy (Col 4) */}
              <div style={{ gridColumn: 'span 4', backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px', height: '100%', boxSizing: 'border-box', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ocupación Hoy</span>
                    <span style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ADE80', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>+14% vs avg</span>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 900, color: '#22C55E', margin: '14px 0 6px 0', letterSpacing: '-1.5px' }}>
                    86%
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', margin: '12px 0 16px 0' }}>
                    <div style={{ width: '86%', height: '100%', background: 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
                    <span>28 turnos ocupados</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 700 }}>4 libres restantes</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Ingresos del Mes (Col 4) */}
              <div style={{ gridColumn: 'span 4', backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px', height: '100%', boxSizing: 'border-box', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Facturación Bruta (GMV)</span>
                    <span style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>Mercado Pago</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#FFF', margin: '14px 0 6px 0', letterSpacing: '-1.2px' }}>
                    $5.480.000
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '12px' }}>
                    Split Payments procesados: <strong style={{ color: '#A5B4FC' }}>$2.890.000</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4ADE80', marginTop: '4px', fontWeight: 700 }}>
                    ↑ 24% de crecimiento mensual
                  </div>
                </div>
              </div>

              {/* Card 3: Turnos Fijos MRR (Col 4) */}
              <div style={{ gridColumn: 'span 4', backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px', height: '100%', boxSizing: 'border-box', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Turnos Fijos Asegurados</span>
                    <span style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#C084FC', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>MRR 60%</span>
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#C084FC', margin: '14px 0 6px 0', letterSpacing: '-1.2px' }}>
                    $2.150.000<span style={{ fontSize: '16px', color: '#64748B', fontWeight: 600 }}>/mes</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '12px' }}>
                    22 suscripciones activas con débito automático
                  </div>
                  <div style={{ fontSize: '12px', color: '#CCFF00', marginTop: '4px', fontWeight: 800 }}>
                    ⚡ 0 cancelaciones este mes
                  </div>
                </div>
              </div>

            </div>

            {/* Live Feed Table Double-Bezel */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px', color: '#FFF' }}>Feed de Reservas & Partidos en Vivo</h3>
                    <p style={{ color: '#64748B', fontSize: '13px', margin: '3px 0 0 0' }}>Conexión en tiempo real con App Jugadores y Mostrador</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      Todos
                    </button>
                    <button style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ADE80', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      App Split
                    </button>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      WhatsApp
                    </button>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <th style={{ padding: '14px 16px' }}>Cancha</th>
                      <th style={{ padding: '14px 16px' }}>Jugador Titular</th>
                      <th style={{ padding: '14px 16px' }}>Horario</th>
                      <th style={{ padding: '14px 16px' }}>Modalidad Pago</th>
                      <th style={{ padding: '14px 16px' }}>Monto</th>
                      <th style={{ padding: '14px 16px' }}>Canal</th>
                      <th style={{ padding: '14px 16px' }}>Estado</th>
                      <th style={{ padding: '14px 16px' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveBookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                        <td style={{ padding: '16px', fontWeight: 800, color: '#FFF' }}>
                          <div>{b.court}</div>
                          <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 800 }}>{b.sport}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700, color: '#F1F5F9' }}>{b.client}</div>
                          <div style={{ color: '#64748B', fontSize: '11px' }}>{b.phone}</div>
                        </td>
                        <td style={{ padding: '16px', color: '#CCFF00', fontWeight: 800 }}>{b.time}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: b.method.includes('SPLIT') ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: b.method.includes('SPLIT') ? '#A5B4FC' : '#94A3B8', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                            {b.method}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 900, color: '#FFF' }}>${b.amount.toLocaleString('es-AR')}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ color: b.channel === 'App Móvil' ? '#22C55E' : '#38BDF8', fontWeight: 700 }}>
                            {b.channel === 'App Móvil' ? '📲 App' : '💬 WhatsApp'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ADE80', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <a
                            href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#25D366', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            💬 Chat
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. TAB: TIMELINE AGENDA */}
        {activeTab === 'AGENDA' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Timeline & Matriz de Ocupación</h2>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Grilla en vivo de canchas x horarios. Doble click para bloquear o reservar turno.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 700 }}>Fecha:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ backgroundColor: '#0D131F', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Matrix Courts */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px' }}>
                {[
                  { id: 'c-1', name: 'Cancha 1 — Central Panorámica WPT', sport: 'Pádel', surface: 'Sintético Azul WPT', price: 48000 },
                  { id: 'c-2', name: 'Cancha 2 — Indoor Vidrio Pro', sport: 'Pádel', surface: 'Césped Texturado 12mm', price: 45000 },
                  { id: 'c-3', name: 'Cancha 3 — Indoor Climatizada', sport: 'Pádel', surface: 'Sintético Verde', price: 42000 }
                ].map(court => (
                  <div key={court.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>{court.name}</span>
                        <span style={{ color: '#64748B', fontSize: '12px', marginLeft: '12px' }}>{court.surface}</span>
                      </div>
                      <span style={{ color: '#4ADE80', fontWeight: 800, fontSize: '13px' }}>${court.price.toLocaleString('es-AR')} / turno</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                      {['08:00', '09:30', '11:00', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'].map((time, idx) => {
                        let isConfirmed = (time === '19:30' && court.id === 'c-1') || (time === '21:00' && court.id === 'c-2');
                        let isFixed = (time === '21:00' && court.id === 'c-1');
                        let isWhatsApp = (time === '18:00' && court.id === 'c-3');

                        return (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: isFixed ? 'rgba(99,102,241,0.12)' : isConfirmed ? 'rgba(34,197,94,0.1)' : isWhatsApp ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isFixed ? '#818CF8' : isConfirmed ? '#22C55E' : isWhatsApp ? '#38BDF8' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '12px',
                              padding: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFF' }}>{time} hs</div>
                            <div style={{ fontSize: '10px', fontWeight: 800, marginTop: '4px', color: isFixed ? '#C7D2FE' : isConfirmed ? '#4ADE80' : isWhatsApp ? '#7DD3FC' : '#64748B' }}>
                              {isFixed ? '⚡ TURNO FIJO' : isConfirmed ? '✓ RESERVA APP' : isWhatsApp ? '💬 WHATSAPP' : 'LIBRE'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB: TURNOS FIJOS */}
        {activeTab === 'FIXED' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Gestor de Turnos Fijos (MRR Deportivo)</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Suscripciones semanales recurrentes con débito automático y liberación automática de fecha.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <th style={{ padding: '14px 16px' }}>Titular</th>
                      <th style={{ padding: '14px 16px' }}>Cancha & Deporte</th>
                      <th style={{ padding: '14px 16px' }}>Horario Recurrente</th>
                      <th style={{ padding: '14px 16px' }}>Modalidad</th>
                      <th style={{ padding: '14px 16px' }}>Precio / Turno</th>
                      <th style={{ padding: '14px 16px' }}>Ahorro Jugador</th>
                      <th style={{ padding: '14px 16px' }}>Gestión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixedSubscriptions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: '#FFF' }}>{s.holder}</div>
                          <div style={{ color: '#64748B', fontSize: '11px' }}>{s.phone}</div>
                        </td>
                        <td style={{ padding: '16px', color: '#F1F5F9' }}>{s.court}</td>
                        <td style={{ padding: '16px', color: '#CCFF00', fontWeight: 800 }}>{s.schedule}</td>
                        <td style={{ padding: '16px', color: '#A5B4FC', fontWeight: 700 }}>{s.plan}</td>
                        <td style={{ padding: '16px', fontWeight: 900, color: '#FFF' }}>${s.pricePerMatch.toLocaleString('es-AR')}</td>
                        <td style={{ padding: '16px', color: '#4ADE80', fontWeight: 800 }}>-${s.savings.toLocaleString('es-AR')}/mes</td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => handleLiberate(s.holder)}
                            style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            ⚡ Liberar esta semana
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: CRM PLAYERS */}
        {activeTab === 'PLAYERS' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>CRM de Jugadores y Clientes</h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Base unificada de jugadores, categorías, consumo histórico y WhatsApp con 1 click.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ backgroundColor: '#0C121D', borderRadius: '22px', padding: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      <th style={{ padding: '14px 16px' }}>Jugador</th>
                      <th style={{ padding: '14px 16px' }}>Categoría Deportiva</th>
                      <th style={{ padding: '14px 16px' }}>Partidos Jugados</th>
                      <th style={{ padding: '14px 16px' }}>Total Facturado</th>
                      <th style={{ padding: '14px 16px' }}>Última Visita</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px' }}>WhatsApp Directo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersList.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                        <td style={{ padding: '16px', fontWeight: 800, color: '#FFF' }}>{p.name}</td>
                        <td style={{ padding: '16px', color: '#94A3B8', fontWeight: 700 }}>{p.rank}</td>
                        <td style={{ padding: '16px', fontWeight: 800 }}>{p.matches} partidos</td>
                        <td style={{ padding: '16px', fontWeight: 900, color: '#22C55E' }}>${p.spent.toLocaleString('es-AR')}</td>
                        <td style={{ padding: '16px', color: '#64748B' }}>{p.lastBooking}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#CCFF00', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <a
                            href={`https://wa.me/${p.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ backgroundColor: '#25D366', color: '#05070B', padding: '6px 14px', borderRadius: '999px', textDecoration: 'none', fontSize: '12px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>💬 Abrir Chat</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Slide-in Modal Drawer for Manual Booking */}
      {showDrawer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#0C121D', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', width: '100%', maxWidth: '480px', padding: '28px', boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFF', margin: 0 }}>Cargar Reserva WhatsApp / Mostrador</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Bloquea la disponibilidad pública en vivo</span>
              </div>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Cancha</label>
                <select
                  value={drawerCourt}
                  onChange={(e) => setDrawerCourt(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#111827', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '13px', fontWeight: 700 }}
                >
                  <option value="Cancha 1 — Central Panorámica WPT">Cancha 1 — Central Panorámica WPT</option>
                  <option value="Cancha 2 — Indoor Vidrio Pro">Cancha 2 — Indoor Vidrio Pro</option>
                  <option value="Cancha 3 — Indoor Climatizada">Cancha 3 — Indoor Climatizada</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Horario Inicio</label>
                  <input
                    type="text"
                    value={drawerTime}
                    onChange={(e) => setDrawerTime(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#111827', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Precio ($ ARS)</label>
                  <input
                    type="number"
                    value={drawerPrice}
                    onChange={(e) => setDrawerPrice(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#111827', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Nombre Jugador</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Lautaro Martínez"
                  value={drawerClient}
                  onChange={(e) => setDrawerClient(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#111827', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>WhatsApp / Teléfono</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 ..."
                  value={drawerPhone}
                  onChange={(e) => setDrawerPhone(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#111827', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#22C55E', color: '#05070B', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
                >
                  Confirmar y Bloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
