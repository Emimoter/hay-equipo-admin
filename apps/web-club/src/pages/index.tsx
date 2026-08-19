import React, { useState } from 'react';
import Head from 'next/head';

interface TimeSlotItem {
  id: string;
  courtId: string;
  courtName: string;
  sport: string;
  time: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED_APP' | 'BOOKED_WHATSAPP' | 'FIXED_SLOT' | 'MAINTENANCE';
  clientName?: string;
  clientPhone?: string;
}

interface CourtConfig {
  id: string;
  name: string;
  sport: string;
  duration: number; // 60 or 90
  priceValley: number;
  pricePeak: number;
  fixedDiscount: number;
  active: boolean;
}

export default function ClubManagerThoughtLabDesign() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authEmail, setAuthEmail] = useState<string>('admin@arenapadel.com.ar');
  const [authPassword, setAuthPassword] = useState<string>('••••••••');
  const [clubName, setClubName] = useState<string>('ARENA PÁDEL PALERMO');

  // Active View Tab
  const [activeSection, setActiveSection] = useState<'SLOTS' | 'BATCH_UPLOAD' | 'COURTS' | 'FIXED_MANAGEMENT'>('SLOTS');
  const [selectedDay, setSelectedDay] = useState<string>('HOY');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');

  // Canchas del Club
  const [courts, setCourts] = useState<CourtConfig[]>([
    { id: 'c-1', name: 'CANCHA 1 — CENTRAL PANORÁMICA WPT', sport: 'PÁDEL', duration: 90, priceValley: 42000, pricePeak: 48000, fixedDiscount: 12, active: true },
    { id: 'c-2', name: 'CANCHA 2 — INDOOR VIDRIO PRO', sport: 'PÁDEL', duration: 90, priceValley: 38000, pricePeak: 45000, fixedDiscount: 10, active: true },
    { id: 'c-3', name: 'CANCHA 3 — INDOOR CLIMATIZADA', sport: 'PÁDEL', duration: 90, priceValley: 36000, pricePeak: 42000, fixedDiscount: 10, active: true },
    { id: 'c-4', name: 'CANCHA A — FÚTBOL 5 FORBEX 50MM', sport: 'FÚTBOL 5', duration: 60, priceValley: 30000, pricePeak: 36000, fixedDiscount: 15, active: true }
  ]);

  // Turnos en Vivo
  const [slots, setSlots] = useState<TimeSlotItem[]>([
    { id: 's-1', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '08:00', price: 42000, status: 'AVAILABLE' },
    { id: 's-2', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '09:30', price: 42000, status: 'AVAILABLE' },
    { id: 's-3', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '11:00', price: 42000, status: 'AVAILABLE' },
    { id: 's-4', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '15:00', price: 42000, status: 'AVAILABLE' },
    { id: 's-5', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '16:30', price: 42000, status: 'AVAILABLE' },
    { id: 's-6', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '18:00', price: 48000, status: 'BOOKED_WHATSAPP', clientName: 'Rodrigo De Paul', clientPhone: '+54 9 11 9988-7766' },
    { id: 's-7', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '19:30', price: 48000, status: 'BOOKED_APP', clientName: 'Emiliano Martínez', clientPhone: '+54 9 11 5555-0001' },
    { id: 's-8', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '21:00', price: 48000, status: 'FIXED_SLOT', clientName: 'Lautaro Martínez (Fijo Jueves)', clientPhone: '+54 9 11 3322-1144' },
    { id: 's-9', courtId: 'c-1', courtName: 'CANCHA 1', sport: 'PÁDEL', time: '22:30', price: 48000, status: 'AVAILABLE' },
    
    { id: 's-10', courtId: 'c-2', courtName: 'CANCHA 2', sport: 'PÁDEL', time: '18:00', price: 45000, status: 'AVAILABLE' },
    { id: 's-11', courtId: 'c-2', courtName: 'CANCHA 2', sport: 'PÁDEL', time: '19:30', price: 45000, status: 'AVAILABLE' },
    { id: 's-12', courtId: 'c-2', courtName: 'CANCHA 2', sport: 'PÁDEL', time: '21:00', price: 45000, status: 'BOOKED_APP', clientName: 'Lucas Gómez', clientPhone: '+54 9 11 4433-2211' },
    { id: 's-13', courtId: 'c-2', courtName: 'CANCHA 2', sport: 'PÁDEL', time: '22:30', price: 45000, status: 'AVAILABLE' }
  ]);

  // Bulk generator state
  const [bulkCourtId, setBulkCourtId] = useState<string>('c-1');
  const [bulkStartHour, setBulkStartHour] = useState<string>('08:00');
  const [bulkEndHour, setBulkEndHour] = useState<string>('23:30');
  const [bulkInterval, setBulkInterval] = useState<number>(90);
  const [bulkPriceValle, setBulkPriceValle] = useState<number>(42000);
  const [bulkPricePico, setBulkPricePico] = useState<number>(48000);
  const [bulkDays, setBulkDays] = useState<string[]>(['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']);

  // Add Single Slot Modal
  const [showSingleSlotModal, setShowSingleSlotModal] = useState<boolean>(false);
  const [newSlotCourt, setNewSlotCourt] = useState<string>('c-1');
  const [newSlotTime, setNewSlotTime] = useState<string>('20:00');
  const [newSlotPrice, setNewSlotPrice] = useState<number>(48000);

  // Quick Action on Slot (Toggle status)
  const handleSlotClick = (slot: TimeSlotItem) => {
    let nextStatus: TimeSlotItem['status'] = 'AVAILABLE';
    if (slot.status === 'AVAILABLE') nextStatus = 'BOOKED_WHATSAPP';
    else if (slot.status === 'BOOKED_WHATSAPP') nextStatus = 'MAINTENANCE';
    else if (slot.status === 'MAINTENANCE') nextStatus = 'AVAILABLE';
    else if (slot.status === 'BOOKED_APP' || slot.status === 'FIXED_SLOT') {
      if (confirm(`El turno está asignado a ${slot.clientName || 'App'}. ¿Deseas liberarlo a DISPONIBLE?`)) {
        nextStatus = 'AVAILABLE';
      } else {
        return;
      }
    }

    setSlots(slots.map(s => s.id === slot.id ? { ...s, status: nextStatus, clientName: nextStatus === 'BOOKED_WHATSAPP' ? 'Reserva Mostrador / WA' : undefined } : s));
  };

  // Generate Bulk Slots
  const handleGenerateBulkSlots = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === bulkCourtId) || courts[0];
    const generated: TimeSlotItem[] = [];

    const [startH, startM] = bulkStartHour.split(':').map(Number);
    const [endH, endM] = bulkEndHour.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let index = 1;
    while (currentMinutes <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const isPeak = h >= 18 && h <= 23;
      const price = isPeak ? bulkPricePico : bulkPriceValle;

      generated.push({
        id: `gen-${bulkCourtId}-${Date.now()}-${index}`,
        courtId: court.id,
        courtName: court.name.split('—')[0].trim(),
        sport: court.sport,
        time: timeStr,
        price,
        status: 'AVAILABLE'
      });

      currentMinutes += bulkInterval;
      index++;
    }

    // Replace or append
    const filteredOld = slots.filter(s => s.courtId !== bulkCourtId);
    setSlots([...filteredOld, ...generated]);
    setActiveSection('SLOTS');
    alert(`⚡ ¡Se generaron ${generated.length} turnos para ${court.name}! Publicados en tiempo real a la app de jugadores.`);
  };

  const handleAddSingleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find(c => c.id === newSlotCourt) || courts[0];
    const newSlot: TimeSlotItem = {
      id: `slot-single-${Date.now()}`,
      courtId: court.id,
      courtName: court.name.split('—')[0].trim(),
      sport: court.sport,
      time: newSlotTime,
      price: newSlotPrice,
      status: 'AVAILABLE'
    };
    setSlots([...slots, newSlot]);
    setShowSingleSlotModal(false);
  };

  const filteredSlots = slots.filter(s => {
    if (selectedCourtFilter !== 'ALL' && s.courtId !== selectedCourtFilter) return false;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#000000', color: '#cccccc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}>
      <Head>
        <title>HAY EQUIPO? — Control Central de Canchas & Horarios</title>
        <meta name="description" content="Plataforma de alta precisión para gestión de disponibilidad deportiva" />
      </Head>

      {/* 1. TOP HEROIC BRAND BAR (ThoughtLab Style) */}
      <header style={{ borderBottom: '1px solid #4c4c4c', padding: '22px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '22px' }}>
          <span style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span style={{ fontSize: '14px', color: '#4c4c4c', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            / CLUB PORTAL & SCHEDULE CONTROLLER
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: '#fc1c46' }} />
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              EN LÍNEA · {clubName}
            </span>
          </div>

          <button
            onClick={() => setActiveSection('BATCH_UPLOAD')}
            style={{
              backgroundColor: '#fc1c46',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '9px 29px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.2px'
            }}
          >
            Subir Horarios Masivos
          </button>
        </div>
      </header>

      {/* 2. MONUMENTAL HEADLINE SECTION (ThoughtLab Aesthetic: 72px / 91px) */}
      <section style={{ padding: '65px 36px 43px 36px', borderBottom: '1px solid #4c4c4c' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '10px', color: '#4c4c4c', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '9px' }}>
            SISTEMA OPERATIVO DE DISPONIBILIDAD Y TURNOS
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.0, letterSpacing: '-1.8px' }}>
            ADMINISTRÁ TUS HORARIOS.
          </h1>
          <p style={{ fontSize: '18px', color: '#cccccc', margin: '18px 0 0 0', maxWidth: '700px', lineHeight: 1.3 }}>
            Cargá los turnos disponibles de tus canchas, configurá tarifas diferenciadas valle/pico y controlá en tiempo real las reservas que ingresan desde la aplicación.
          </p>
        </div>
      </section>

      {/* 3. RAZOR-SHARP NAVIGATION TABS (Frost / Ash / Graphite) */}
      <nav style={{ padding: '0 36px', borderBottom: '1px solid #4c4c4c', display: 'flex', gap: '36px' }}>
        {[
          { key: 'SLOTS', label: '01 / TURNOS EN VIVO' },
          { key: 'BATCH_UPLOAD', label: '02 / GENERADOR MASIVO DE HORARIOS' },
          { key: 'COURTS', label: '03 / CONFIGURACIÓN DE CANCHAS' },
          { key: 'FIXED_MANAGEMENT', label: '04 / GESTIÓN DE TURNOS FIJOS' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as any)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeSection === tab.key ? '2px solid #fc1c46' : '2px solid transparent',
              color: activeSection === tab.key ? '#ffffff' : '#4c4c4c',
              fontSize: '14px',
              fontWeight: activeSection === tab.key ? 700 : 400,
              padding: '22px 0',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 4. MAIN WORKSPACE */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '43px 36px' }}>

        {/* SECTION 1: TURNOS EN VIVO */}
        {activeSection === 'SLOTS' && (
          <div>
            {/* Filter and Day Selector Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', borderBottom: '1px solid #4c4c4c', paddingBottom: '22px' }}>
              <div style={{ display: 'flex', gap: '9px' }}>
                {['HOY', 'MAÑANA', 'VIERNES', 'SÁBADO', 'DOMINGO'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      backgroundColor: selectedDay === day ? '#ffffff' : 'transparent',
                      color: selectedDay === day ? '#000000' : '#cccccc',
                      border: selectedDay === day ? 'none' : '1px solid #4c4c4c',
                      borderRadius: '9999px',
                      padding: '7px 22px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '10px', color: '#4c4c4c', textTransform: 'uppercase' }}>Filtrar Cancha:</span>
                <select
                  value={selectedCourtFilter}
                  onChange={(e) => setSelectedCourtFilter(e.target.value)}
                  style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '7px 14px', borderRadius: '0px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="ALL">TODAS LAS CANCHAS</option>
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowSingleSlotModal(true)}
                  style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '9999px', padding: '7px 22px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                >
                  + Agregar Turno Individual
                </button>
              </div>
            </div>

            {/* Matrix of Available vs Booked Slots */}
            <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff' }}>
                PARRILLA DE TURNOS ({filteredSlots.length} HORARIOS)
              </span>
              <div style={{ display: 'flex', gap: '18px', fontSize: '10px', textTransform: 'uppercase', color: '#4c4c4c' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%' }} /> DISPONIBLE APP</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#fc1c46', borderRadius: '50%' }} /> RESERVADO APP</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%' }} /> WHATSAPP / MOSTRADOR</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#a855f7', borderRadius: '50%' }} /> TURNO FIJO</span>
              </div>
            </div>

            {/* Slots Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '65px' }}>
              {filteredSlots.map(slot => {
                const isAvailable = slot.status === 'AVAILABLE';
                const isApp = slot.status === 'BOOKED_APP';
                const isWA = slot.status === 'BOOKED_WHATSAPP';
                const isFixed = slot.status === 'FIXED_SLOT';
                const isMaint = slot.status === 'MAINTENANCE';

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    style={{
                      border: isAvailable ? '1px solid #4c4c4c' : isApp ? '1px solid #fc1c46' : isWA ? '1px solid #38bdf8' : isFixed ? '1px solid #a855f7' : '1px solid #4c4c4c',
                      backgroundColor: isAvailable ? '#000000' : isApp ? '#100204' : isWA ? '#030c14' : isFixed ? '#0d0414' : '#111111',
                      padding: '22px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <span style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
                        {slot.time} hs
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: isAvailable ? '#ffffff' : isApp ? '#fc1c46' : isWA ? '#38bdf8' : isFixed ? '#a855f7' : '#4c4c4c',
                          color: isAvailable ? '#000000' : '#ffffff',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isAvailable ? 'DISPONIBLE' : isApp ? 'APP (PAGADO)' : isWA ? 'WHATSAPP' : isFixed ? 'TURNO FIJO' : 'BLOQUEADO'}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: '#cccccc', fontWeight: 400, marginBottom: '6px' }}>
                      {slot.courtName} · {slot.sport}
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: 700, color: isAvailable ? '#ffffff' : '#cccccc' }}>
                      ${slot.price.toLocaleString('es-AR')}
                    </div>

                    {slot.clientName && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #222222', fontSize: '10px', color: '#4c4c4c' }}>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>{slot.clientName}</div>
                        <div>{slot.clientPhone}</div>
                      </div>
                    )}

                    <div style={{ marginTop: '14px', fontSize: '10px', color: '#4c4c4c', textAlign: 'right' }}>
                      CLICK PARA CAMBIAR ESTADO →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: GENERADOR MASIVO DE HORARIOS */}
        {activeSection === 'BATCH_UPLOAD' && (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '36px' }}>
              <span style={{ fontSize: '10px', color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '1px' }}>
                AUTOMATIZACIÓN DE DISPONIBILIDAD
              </span>
              <h2 style={{ fontSize: '72px', fontWeight: 700, color: '#ffffff', margin: '6px 0 0 0', lineHeight: 1.0, letterSpacing: '-1.5px' }}>
                SUBIR HORARIOS.
              </h2>
              <p style={{ fontSize: '18px', color: '#cccccc', marginTop: '14px' }}>
                Generá los bloques de turnos para toda la semana con tarifas valle y pico automáticas.
              </p>
            </div>

            <form onSubmit={handleGenerateBulkSlots} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Seleccionar Cancha */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                  01 / SELECCIONAR CANCHA
                </label>
                <select
                  value={bulkCourtId}
                  onChange={(e) => setBulkCourtId(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none' }}
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport} · {c.duration} MINUTOS)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango Horario */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                    02 / PRIMER TURNO
                  </label>
                  <input
                    type="text"
                    value={bulkStartHour}
                    onChange={(e) => setBulkStartHour(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                    03 / ÚLTIMO TURNO
                  </label>
                  <input
                    type="text"
                    value={bulkEndHour}
                    onChange={(e) => setBulkEndHour(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                    04 / INTERVALO (MINUTOS)
                  </label>
                  <select
                    value={bulkInterval}
                    onChange={(e) => setBulkInterval(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value={90}>90 Minutos (Pádel estándar)</option>
                    <option value={60}>60 Minutos (Fútbol / Clases)</option>
                    <option value={120}>120 Minutos (Partidos largos)</option>
                  </select>
                </div>
              </div>

              {/* Precios Valle vs Pico */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                    05 / PRECIO TARIFA VALLE (08:00 A 17:00 HS)
                  </label>
                  <input
                    type="number"
                    value={bulkPriceValle}
                    onChange={(e) => setBulkPriceValle(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '9px' }}>
                    06 / PRECIO TARIFA PICO (18:00 A 00:00 HS)
                  </label>
                  <input
                    type="number"
                    value={bulkPricePico}
                    onChange={(e) => setBulkPricePico(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '22px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#fc1c46',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '18px 43px',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.5px'
                  }}
                >
                  PUBLICAR HORARIOS EN TIEMPO REAL →
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SECTION 3: CONFIGURACIÓN DE CANCHAS */}
        {activeSection === 'COURTS' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <span style={{ fontSize: '10px', color: '#4c4c4c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                CATÁLOGO DE INSTALACIONES
              </span>
              <h2 style={{ fontSize: '72px', fontWeight: 700, color: '#ffffff', margin: '6px 0 0 0', lineHeight: 1.0, letterSpacing: '-1.5px' }}>
                CANCHAS ACTIVAS.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {courts.map(c => (
                <div
                  key={c.id}
                  style={{ border: '1px solid #4c4c4c', padding: '29px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {c.sport} · {c.duration} MINUTOS
                    </div>
                    <div style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#cccccc' }}>
                      Valle: ${c.priceValley.toLocaleString('es-AR')} · Pico: ${c.pricePeak.toLocaleString('es-AR')} · Descuento Turno Fijo: {c.fixedDiscount}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px' }}>
                    <button
                      onClick={() => {
                        setBulkCourtId(c.id);
                        setActiveSection('BATCH_UPLOAD');
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Subir Horarios
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: GESTIÓN DE TURNOS FIJOS */}
        {activeSection === 'FIXED_MANAGEMENT' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <span style={{ fontSize: '10px', color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '1px' }}>
                CONTRATOS Y SUSCRIPCIONES SEMANALES
              </span>
              <h2 style={{ fontSize: '72px', fontWeight: 700, color: '#ffffff', margin: '6px 0 0 0', lineHeight: 1.0, letterSpacing: '-1.5px' }}>
                TURNOS FIJOS.
              </h2>
            </div>

            <div style={{ border: '1px solid #4c4c4c' }}>
              <div style={{ padding: '22px 36px', borderBottom: '1px solid #4c4c4c', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4c4c4c', textTransform: 'uppercase' }}>
                <span>TITULAR & TELÉFONO</span>
                <span>CANCHA Y HORARIO</span>
                <span>TARIFA MENSUAL</span>
                <span>ACCIONES</span>
              </div>

              {[
                { name: 'Lautaro Martínez', phone: '+54 9 11 3322-1144', court: 'Cancha 1 (Central Panorámica)', time: 'Jueves · 21:00 hs', monthly: 168960 },
                { name: 'Gonzalo Montiel', phone: '+54 9 11 7788-9900', court: 'Cancha 2 (Indoor Vidrio)', time: 'Martes · 20:00 hs', monthly: 162000 },
                { name: 'Nicolás Tagliafico', phone: '+54 9 11 5544-3322', court: 'Cancha 3 (Indoor Climatizada)', time: 'Miércoles · 21:30 hs', monthly: 151200 }
              ].map((f, i) => (
                <div key={i} style={{ padding: '22px 36px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{f.name}</div>
                    <div style={{ fontSize: '14px', color: '#4c4c4c' }}>{f.phone}</div>
                  </div>

                  <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: 500 }}>
                    {f.court} · <span style={{ color: '#fc1c46' }}>{f.time}</span>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    ${f.monthly.toLocaleString('es-AR')}/mes
                  </div>

                  <div>
                    <button
                      onClick={() => alert(`¡Turno de ${f.name} liberado al marketplace de Hay Equipo para esta semana!`)}
                      style={{ backgroundColor: 'transparent', color: '#fc1c46', border: '1px solid #fc1c46', borderRadius: '9999px', padding: '7px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Liberar Esta Semana
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL AGREGAR TURNO INDIVIDUAL */}
      {showSingleSlotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#000000', border: '1px solid #4c4c4c', padding: '43px', width: '100%', maxWidth: '480px' }}>
            <div style={{ fontSize: '10px', color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              AGREGAR HORARIO
            </div>
            <div style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff', marginBottom: '22px' }}>
              NUEVO TURNO.
            </div>

            <form onSubmit={handleAddSingleSlot} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Cancha
                </label>
                <select
                  value={newSlotCourt}
                  onChange={(e) => setNewSlotCourt(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '14px' }}
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Horario (ej: 20:00)
                </label>
                <input
                  type="text"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Precio ($ ARS)
                </label>
                <input
                  type="number"
                  value={newSlotPrice}
                  onChange={(e) => setNewSlotPrice(Number(e.target.value))}
                  style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', fontSize: '18px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSingleSlotModal(false)}
                  style={{ flex: 1, backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #4c4c4c', padding: '14px', borderRadius: '9999px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#fc1c46', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '9999px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Guardar y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FOOTER (ThoughtLab Pure Minimalist Style) */}
      <footer style={{ borderTop: '1px solid #4c4c4c', padding: '65px 36px', marginTop: '86px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '27px', fontWeight: 700, color: '#ffffff' }}>HAY EQUIPO?</div>
            <div style={{ fontSize: '14px', color: '#4c4c4c', marginTop: '6px' }}>
              Sistema Operativo y Red de Disponibilidad Deportiva en Tiempo Real.
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '10px', color: '#4c4c4c', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <div>CONNECTED TO REDIS & SSE REALTIME GATEWAY</div>
            <div style={{ marginTop: '4px' }}>© 2026 HAY EQUIPO INC. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
