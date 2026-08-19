import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface ClubInfo {
  id: string;
  name: string;
  city: string;
  rating: number;
  phone: string;
  whatsapp: string;
  courtsCount: number;
}

const CLUBS_MOCK: ClubInfo[] = [
  { id: 'club-arena-palermo', name: 'Arena Pádel Palermo', city: 'Palermo, CABA', rating: 4.9, phone: '+54 11 4772-5500', whatsapp: '+54 9 11 3344-8899', courtsCount: 3 },
  { id: 'club-la-cantera-palermo', name: 'La Cantera Fútbol Club', city: 'Palermo, CABA', rating: 4.8, phone: '+54 11 4778-9000', whatsapp: '+54 9 11 2233-4455', courtsCount: 2 },
  { id: 'club-belgrano-r-padel', name: 'Belgrano R Pádel & Tennis Lounge', city: 'Belgrano R, CABA', rating: 4.9, phone: '+54 11 4554-1122', whatsapp: '+54 9 11 8899-7766', courtsCount: 2 },
  { id: 'club-central-park-urquiza', name: 'Central Park Complejo Deportivo', city: 'Villa Urquiza, CABA', rating: 4.8, phone: '+54 11 4522-7788', whatsapp: '+54 9 11 6655-4433', courtsCount: 4 },
  { id: 'club-san-isidro-padel', name: 'San Isidro Pádel & Golf Club', city: 'San Isidro, GBA', rating: 4.9, phone: '+54 11 4743-9988', whatsapp: '+54 9 11 9988-1122', courtsCount: 2 }
];

export default function AdminWebHayEquipo() {
  const [selectedClubId, setSelectedClubId] = useState<string>('club-arena-palermo');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'AGENDA' | 'FIXED_SLOTS' | 'COURTS' | 'CLIENTS' | 'PAYMENTS' | 'PROMOS'>('DASHBOARD');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modals
  const [showManualBookingModal, setShowManualBookingModal] = useState<boolean>(false);
  const [showNewCourtModal, setShowNewCourtModal] = useState<boolean>(false);
  const [showNewPromoModal, setShowNewPromoModal] = useState<boolean>(false);

  // Manual booking form state
  const [manualCourtName, setManualCourtName] = useState<string>('Cancha 1 (Central Panorámica WPT)');
  const [manualTime, setManualTime] = useState<string>('19:30');
  const [manualClientName, setManualClientName] = useState<string>('');
  const [manualClientPhone, setManualClientPhone] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(48000);
  const [manualSource, setManualSource] = useState<'WHATSAPP' | 'PHONE' | 'COUNTER'>('WHATSAPP');

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<any[]>([
    { id: 'bk-1', court: 'Cancha 1 — Central Panorámica WPT', client: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', time: '19:30 – 21:00 hs', type: 'SPLIT', price: 48000, status: 'CONFIRMED', source: 'APP' },
    { id: 'bk-2', court: 'Cancha 2 — Indoor Vidrio Pro', client: 'Lucas Gómez', phone: '+54 9 11 4433-2211', time: '21:00 – 22:30 hs', type: 'FULL', price: 45000, status: 'CONFIRMED', source: 'APP' },
    { id: 'bk-3', court: 'Cancha 3 — Indoor Climatizada', client: 'Rodrigo De Paul', phone: '+54 9 11 9988-7766', time: '18:00 – 19:30 hs', type: 'FULL', price: 42000, status: 'MANUAL_ENTRY', source: 'WHATSAPP' }
  ]);

  // Turnos Fijos
  const [fixedSlots, setFixedSlots] = useState<any[]>([
    { id: 'sub-1', client: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', court: 'Cancha 1 — Central Panorámica WPT', schedule: 'Todos los Jueves · 21:00 hs', frequency: 'Mensual (Débito automático)', pricePerMatch: 42240, monthlyTotal: 168960, savingsMonthly: 23040, status: 'ACTIVE' },
    { id: 'sub-2', client: 'Gonzalo Montiel', phone: '+54 9 11 7788-9900', court: 'Cancha 2 — Indoor Vidrio Pro', schedule: 'Todos los Martes · 20:00 hs', frequency: 'Mensual', pricePerMatch: 40500, monthlyTotal: 162000, savingsMonthly: 18000, status: 'ACTIVE' },
    { id: 'sub-3', client: 'Nicolás Tagliafico', phone: '+54 9 11 3322-1144', court: 'Cancha 3 — Indoor Climatizada', schedule: 'Todos los Miércoles · 21:30 hs', frequency: 'Temporada (6 meses)', pricePerMatch: 37800, monthlyTotal: 151200, savingsMonthly: 25200, status: 'ACTIVE' }
  ]);

  // Canchas list
  const [courtsList, setCourtsList] = useState<any[]>([
    { id: 'c-1', name: 'Cancha 1 — Central Panorámica WPT', sport: 'Pádel', surface: 'Césped Sintético Monofilamento Azul WPT', covered: true, lighting: true, duration: 90, priceRegular: 48000, priceFixed: 42240, status: 'ACTIVA' },
    { id: 'c-2', name: 'Cancha 2 — Indoor Vidrio Pro', sport: 'Pádel', surface: 'Césped Texturado 12mm', covered: true, lighting: true, duration: 90, priceRegular: 45000, priceFixed: 40500, status: 'ACTIVA' },
    { id: 'c-3', name: 'Cancha 3 — Indoor Climatizada', sport: 'Pádel', surface: 'Césped Sintético Verde Clásico', covered: true, lighting: true, duration: 90, priceRegular: 42000, priceFixed: 37800, status: 'ACTIVA' }
  ]);

  // Clients CRM
  const [crmClients, setCrmClients] = useState<any[]>([
    { id: 'cli-1', name: 'Emiliano Martínez', phone: '+54 9 11 5555-0001', email: 'emiliano@hayequipo.com.ar', matches: 28, totalSpent: 345000, fixedSlots: 1, lastVisit: 'Hoy 19:30 hs', rating: 5.0 },
    { id: 'cli-2', name: 'Lucas Gómez', phone: '+54 9 11 4433-2211', email: 'lucas.gomez@gmail.com', matches: 14, totalSpent: 168000, fixedSlots: 0, lastVisit: 'Ayer 21:00 hs', rating: 4.8 },
    { id: 'cli-3', name: 'Rodrigo De Paul', phone: '+54 9 11 9988-7766', email: 'rdepaul@gmail.com', matches: 22, totalSpent: 280000, fixedSlots: 0, lastVisit: 'Hace 3 días', rating: 4.9 },
    { id: 'cli-4', name: 'Gonzalo Montiel', phone: '+54 9 11 7788-9900', email: 'gmontiel@gmail.com', matches: 19, totalSpent: 245000, fixedSlots: 1, lastVisit: 'Hace 5 días', rating: 5.0 }
  ]);

  // Promociones
  const [promosList, setPromosList] = useState<any[]>([
    { id: 'pro-1', title: 'Happy Hour Pádel (14:00 a 17:00 hs)', discount: '25% OFF', sport: 'Pádel', days: 'Lunes a Jueves', code: 'HAPPYPADEL', active: true },
    { id: 'pro-2', title: 'Fútbol 5 Primer Turno', discount: '$10.000 OFF', sport: 'Fútbol 5', days: 'Todos los días', code: 'PRIMERTURNO', active: true },
    { id: 'pro-3', title: 'Fin de Semana Tercer Tiempo 2x1', discount: 'Cerveza gratis en Buffet', sport: 'Todos', days: 'Sábados y Domingos', code: 'TERCERTIEMPO', active: true }
  ]);

  const currentClub = CLUBS_MOCK.find(c => c.id === selectedClubId) || CLUBS_MOCK[0];

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBk = {
      id: `bk-${Date.now()}`,
      court: manualCourtName,
      client: manualClientName,
      phone: manualClientPhone,
      time: `${manualTime} – 21:00 hs`,
      type: 'FULL',
      price: manualPrice,
      status: 'MANUAL_ENTRY',
      source: manualSource
    };
    setBookingsList([newBk, ...bookingsList]);
    setShowManualBookingModal(false);
    setManualClientName('');
    setManualClientPhone('');
    alert('¡Reserva manual cargada con éxito! Se sincronizó en vivo con la app.');
  };

  const handleLiberateFixedSlot = (id: string) => {
    if (confirm('¿Liberar la fecha de esta semana al marketplace? Los usuarios recibirán notificación push de cancha disponible.')) {
      alert('¡Fecha liberada al marketplace! Notificación enviada a la lista de espera.');
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0F17', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Head>
        <title>Hay equipo? — Panel de Administración & Backoffice</title>
        <meta name="description" content="Sistema Operativo de Gestión de Clubes y Reservas Deportivas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid #1E293B', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#22C55E', color: '#0B0F17', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', boxShadow: '0 0 16px rgba(34, 197, 94, 0.4)' }}>
            HE
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>HAY EQUIPO?</h1>
              <span style={{ backgroundColor: '#1E1B4B', color: '#CCFF00', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>PRO CLUBS</span>
            </div>
            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Sistema Operativo para Complejos Deportivos</span>
          </div>
        </div>

        {/* Club Switcher & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E293B', padding: '6px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '14px' }}>🏟️</span>
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              style={{ backgroundColor: 'transparent', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              {CLUBS_MOCK.map(club => (
                <option key={club.id} value={club.id} style={{ backgroundColor: '#1E293B', color: '#FFF' }}>
                  {club.name} ({club.city})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowManualBookingModal(true)}
            style={{ backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)' }}
          >
            <span>+</span> Nueva Reserva Manual (WhatsApp)
          </button>

          <div style={{ width: '38px', height: '38px', borderRadius: '19px', backgroundColor: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#22C55E' }}>
            EM
          </div>
        </div>
      </header>

      {/* Sub-Header Navigation Tabs */}
      <nav style={{ padding: '0 28px', borderBottom: '1px solid #1E293B', display: 'flex', gap: '8px', backgroundColor: '#0F172A', overflowX: 'auto' }}>
        {[
          { key: 'DASHBOARD', label: '📊 Dashboard Global' },
          { key: 'AGENDA', label: '📅 Agenda Hoy en Vivo' },
          { key: 'FIXED_SLOTS', label: '⚡ Turnos Fijos (Suscripciones)' },
          { key: 'COURTS', label: '🏟️ Canchas & Precios' },
          { key: 'CLIENTS', label: '👥 Clientes & CRM' },
          { key: 'PAYMENTS', label: '💳 Liquidaciones & Mercado Pago' },
          { key: 'PROMOS', label: '🎁 Promociones & Cupones' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #22C55E' : '3px solid transparent',
              color: activeTab === tab.key ? '#22C55E' : '#94A3B8',
              fontWeight: activeTab === tab.key ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* 1. TAB: DASHBOARD GLOBAL */}
        {activeTab === 'DASHBOARD' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>{currentClub.name}</h2>
                <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Métricas de ocupación, reservas activas e ingresos en tiempo real.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                  ● Sistema en Vivo Conectado
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>Ocupación Promedio Hoy</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#22C55E', margin: 0 }}>84%</h3>
                  <span style={{ color: '#4ADE80', fontSize: '12px', fontWeight: 700 }}>+12% vs sem. pasada</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>Ingresos del Mes (GMV)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#FFF', margin: 0 }}>$4.850.000</h3>
                </div>
              </div>

              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>Turnos Fijos Activos</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#A855F7', margin: 0 }}>18</h3>
                  <span style={{ color: '#C084FC', fontSize: '12px' }}>$1.820.000/mes aseg.</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>Reservas Hoy</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#38BDF8', margin: 0 }}>24</h3>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>8 por App · 16 Mostrador</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings Feed */}
            <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Últimas Reservas en Vivo</h3>
                <button onClick={() => setActiveTab('AGENDA')} style={{ background: 'none', border: 'none', color: '#22C55E', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  Ver Agenda Completa →
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #23324A', color: '#94A3B8', fontSize: '12px' }}>
                    <th style={{ padding: '12px 14px' }}>CANCHA</th>
                    <th style={{ padding: '12px 14px' }}>JUGADOR / CLIENTE</th>
                    <th style={{ padding: '12px 14px' }}>HORARIO</th>
                    <th style={{ padding: '12px 14px' }}>TIPO</th>
                    <th style={{ padding: '12px 14px' }}>MONTO</th>
                    <th style={{ padding: '12px 14px' }}>ORIGEN</th>
                    <th style={{ padding: '12px 14px' }}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #1E293B', fontSize: '14px' }}>
                      <td style={{ padding: '14px', fontWeight: 700 }}>{b.court}</td>
                      <td style={{ padding: '14px' }}>
                        <div>{b.client}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>{b.phone}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#CCFF00', fontWeight: 700 }}>{b.time}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ backgroundColor: b.type === 'SPLIT' ? '#1E1B4B' : '#1E293B', color: b.type === 'SPLIT' ? '#A5B4FC' : '#94A3B8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          {b.type === 'SPLIT' ? '👥 Split Payment' : '💳 Pago Total'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800 }}>${b.price.toLocaleString('es-AR')}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ color: b.source === 'APP' ? '#22C55E' : '#38BDF8', fontSize: '12px', fontWeight: 700 }}>
                          {b.source === 'APP' ? '📲 App Móvil' : '💬 WhatsApp'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                          CONFIRMADA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TAB: AGENDA EN VIVO */}
        {activeTab === 'AGENDA' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>Grilla de Ocupación en Tiempo Real</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Canchas en filas vs Horarios. Las reservas manuales bloquean inmediatamente la disponibilidad pública.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', color: '#94A3B8' }}>Fecha:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Matrix Timeline */}
            <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', overflow: 'hidden' }}>
              {courtsList.map(court => (
                <div key={court.id} style={{ borderBottom: '1px solid #23324A', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>{court.name}</span>
                      <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '12px' }}>{court.surface} · {court.covered ? 'Techada' : 'Outdoor'}</span>
                    </div>
                    <span style={{ color: '#22C55E', fontSize: '13px', fontWeight: 700 }}>${court.priceRegular.toLocaleString('es-AR')} / turno</span>
                  </div>

                  {/* Horizontal Slots */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {['08:00', '09:30', '11:00', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'].map((time, idx) => {
                      let isBooked = (time === '19:30' && court.id === 'c-1') || (time === '21:00' && court.id === 'c-2');
                      let isManual = (time === '18:00' && court.id === 'c-3');
                      let isFixed = (time === '21:00' && court.id === 'c-1');

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: isFixed ? '#1E1B4B' : isBooked ? '#0F172A' : isManual ? '#1E3A8A' : '#1E293B',
                            border: `1px solid ${isFixed ? '#6366F1' : isBooked ? '#22C55E' : isManual ? '#60A5FA' : '#334155'}`,
                            borderRadius: '10px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>{time} hs</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: isFixed ? '#C7D2FE' : isBooked ? '#4ADE80' : isManual ? '#93C5FD' : '#94A3B8' }}>
                            {isFixed ? '⚡ Turno Fijo' : isBooked ? '✓ Reserva App' : isManual ? '💬 WhatsApp' : 'Libre'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TAB: TURNOS FIJOS */}
        {activeTab === 'FIXED_SLOTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>Suscripciones de Turnos Fijos Semanales</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Garantizan la recurrencia del 60% de los ingresos de tu complejo.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #23324A', color: '#94A3B8', fontSize: '12px' }}>
                    <th style={{ padding: '14px 16px' }}>CLIENTE TITULAR</th>
                    <th style={{ padding: '14px 16px' }}>CANCHA</th>
                    <th style={{ padding: '14px 16px' }}>DÍA Y HORARIO</th>
                    <th style={{ padding: '14px 16px' }}>MODALIDAD DE COBRO</th>
                    <th style={{ padding: '14px 16px' }}>PRECIO / PARTIDO</th>
                    <th style={{ padding: '14px 16px' }}>AHORRO MENSUAL</th>
                    <th style={{ padding: '14px 16px' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedSlots.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1E293B', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700 }}>{s.client}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>{s.phone}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>{s.court}</td>
                      <td style={{ padding: '14px 16px', color: '#CCFF00', fontWeight: 700 }}>{s.schedule}</td>
                      <td style={{ padding: '14px 16px' }}>{s.frequency}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800 }}>${s.pricePerMatch.toLocaleString('es-AR')}</td>
                      <td style={{ padding: '14px 16px', color: '#4ADE80', fontWeight: 700 }}>Ahorra ${s.savingsMonthly.toLocaleString('es-AR')}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleLiberateFixedSlot(s.id)}
                          style={{ backgroundColor: '#1E293B', border: '1px solid #F59E0B', color: '#F59E0B', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Liberar fecha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TAB: CANCHAS & PRECIOS DINÁMICOS */}
        {activeTab === 'COURTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>Administrador de Canchas e Instalaciones</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Configurá superficies, duración de turnos y reglas de precios por franja horaria.</p>
              </div>
              <button
                onClick={() => setShowNewCourtModal(true)}
                style={{ backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
              >
                + Crear Nueva Cancha
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {courtsList.map(c => (
                <div key={c.id} style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ backgroundColor: '#1E1B4B', color: '#A5B4FC', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>{c.sport}</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '8px 0 2px 0' }}>{c.name}</h3>
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>{c.surface}</span>
                    </div>
                    <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>{c.status}</span>
                  </div>

                  <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#94A3B8' }}>Precio Ocasional ({c.duration} min):</span>
                      <span style={{ fontWeight: 800 }}>${c.priceRegular.toLocaleString('es-AR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#94A3B8' }}>Precio Turno Fijo (-12%):</span>
                      <span style={{ fontWeight: 800, color: '#CCFF00' }}>${c.priceFixed.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      ⚙️ Editar Horarios & Tarifas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TAB: CLIENTES CRM */}
        {activeTab === 'CLIENTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>CRM de Jugadores y Clientes</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Historial de juego, volumen de gasto y botón directo para contactar por WhatsApp.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #23324A', color: '#94A3B8', fontSize: '12px' }}>
                    <th style={{ padding: '14px 16px' }}>JUGADOR</th>
                    <th style={{ padding: '14px 16px' }}>TELÉFONO</th>
                    <th style={{ padding: '14px 16px' }}>PARTIDOS JUGADOS</th>
                    <th style={{ padding: '14px 16px' }}>TOTAL GASTADO</th>
                    <th style={{ padding: '14px 16px' }}>ÚLTIMA VISITA</th>
                    <th style={{ padding: '14px 16px' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {crmClients.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1E293B', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{c.phone}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{c.matches} partidos</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#22C55E' }}>${c.totalSpent.toLocaleString('es-AR')}</td>
                      <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{c.lastVisit}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ backgroundColor: '#1E293B', color: '#25D366', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #334155' }}
                        >
                          💬 WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TAB: LIQUIDACIONES & MERCADO PAGO */}
        {activeTab === 'PAYMENTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>Liquidaciones & Mercado Pago</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Historial de transferencias bancarias automáticas y conciliación de comisiones.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Total Cobrado por Mercado Pago</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '6px 0 0 0' }}>$4.850.000</h3>
              </div>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Comisión Plataforma (5%)</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#F59E0B', margin: '6px 0 0 0' }}>$242.500</h3>
              </div>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Transferido al Club (Neto)</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#22C55E', margin: '6px 0 0 0' }}>$4.607.500</h3>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB: PROMOCIONES & CUPONES */}
        {activeTab === 'PROMOS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0' }}>Promociones & Ocupación Inteligente</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Creá descuentos automáticos para incentivar la reserva en horarios valle (14:00 a 17:00 hs).</p>
              </div>
              <button
                onClick={() => setShowNewPromoModal(true)}
                style={{ backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
              >
                + Nueva Promoción
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {promosList.map(p => (
                <div key={p.id} style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{p.title}</h3>
                    <span style={{ backgroundColor: '#1E1B4B', color: '#CCFF00', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>{p.discount}</span>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '14px' }}>Días activos: {p.days}</p>
                  <div style={{ backgroundColor: '#0F172A', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>Código cupón:</span>
                    <span style={{ fontWeight: 800, color: '#FFF' }}>{p.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Manual Booking Modal */}
      {showManualBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '28px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>Nueva Reserva de Mostrador / WhatsApp</h3>
              <button onClick={() => setShowManualBookingModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateManualBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Cancha:</label>
                <select
                  value={manualCourtName}
                  onChange={(e) => setManualCourtName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value="Cancha 1 (Central Panorámica WPT)">Cancha 1 (Central Panorámica WPT)</option>
                  <option value="Cancha 2 (Indoor Vidrio Pro)">Cancha 2 (Indoor Vidrio Pro)</option>
                  <option value="Cancha 3 (Indoor Climatizada)">Cancha 3 (Indoor Climatizada)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Horario Inicio:</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Precio ($ ARS):</label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Nombre del Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Lautaro Martínez"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Teléfono / WhatsApp:</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 ..."
                  value={manualClientPhone}
                  onChange={(e) => setManualClientPhone(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Canal de reserva:</label>
                <select
                  value={manualSource}
                  onChange={(e) => setManualSource(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Llamada Telefónica</option>
                  <option value="COUNTER">Mostrador / Presencial</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowManualBookingModal(false)}
                  style={{ flex: 1, backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
