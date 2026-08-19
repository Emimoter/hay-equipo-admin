import React, { useState, useEffect } from 'react';

interface SlotData {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'AVAILABLE' | 'HELD' | 'CONFIRMED' | 'MANUAL_ENTRY';
}

interface CourtTimeline {
  courtId: string;
  courtName: string;
  sportType: string;
  surface: string;
  isCovered: boolean;
  slots: SlotData[];
}

export default function ClubDashboard() {
  const [activeTab, setActiveTab] = useState<'AGENDA' | 'FIXED_SLOTS' | 'CLIENTS' | 'METRICS'>('AGENDA');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeline, setTimeline] = useState<CourtTimeline[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Manual Booking Modal
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualCourtId, setManualCourtId] = useState<string>('court-arena-1');
  const [manualTime, setManualTime] = useState<string>('18:00');
  const [manualClientName, setManualClientName] = useState<string>('');
  const [manualClientPhone, setManualClientPhone] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(45000);
  const [manualSource, setManualSource] = useState<'WHATSAPP' | 'PHONE' | 'COUNTER'>('WHATSAPP');

  const clubId = 'club-arena-palermo';

  useEffect(() => {
    loadClubData();
  }, [selectedDate]);

  const loadClubData = async () => {
    setLoading(true);
    try {
      const [timeRes, metRes, cliRes] = await Promise.all([
        fetch(`http://localhost:4000/api/club-admin/${clubId}/timeline?date=${selectedDate}`),
        fetch(`http://localhost:4000/api/club-admin/${clubId}/metrics`),
        fetch(`http://localhost:4000/api/club-admin/${clubId}/clients`)
      ]);

      const [timeData, metData, cliData] = await Promise.all([
        timeRes.json(),
        metRes.json(),
        cliRes.json()
      ]);

      if (timeData.success) setTimeline(timeData.timeline);
      if (metData.success) setMetrics(metData.metrics);
      if (cliData.success) setClients(cliData.clients);
    } catch (e) {
      console.error('Error loading club dashboard:', e);
    }
    setLoading(false);
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/club-admin/${clubId}/manual-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: manualCourtId,
          date: selectedDate,
          startTime: manualTime,
          endTime: '19:30',
          clientName: manualClientName,
          clientPhone: manualClientPhone,
          price: manualPrice,
          source: manualSource
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Reserva manual cargada con éxito! La disponibilidad pública se actualizó en vivo.');
        setShowManualModal(false);
        setManualClientName('');
        setManualClientPhone('');
        loadClubData();
      }
    } catch (err) {
      alert('Error registrando la reserva manual');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span style={{ background: '#052e16', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Libre</span>;
      case 'CONFIRMED':
        return <span style={{ background: '#1e1b4b', color: '#a5b4fc', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Reserva App</span>;
      case 'MANUAL_ENTRY':
        return <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>WhatsApp/Mostrador</span>;
      case 'HELD':
        return <span style={{ background: '#451a03', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>En Checkout (7m)</span>;
      default:
        return <span style={{ background: '#334155', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>Ocupado</span>;
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0F17', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header style={{ borderBottom: '1px solid #1E293B', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#22C55E', color: '#0B0F17', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
            HE
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Arena Pádel Palermo</h1>
            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Sistema Operativo del Club · Panel de Administración</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowManualModal(true)}
            style={{ backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
          >
            + Nueva Reserva Manual (WhatsApp/Mostrador)
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav style={{ padding: '0 24px', borderBottom: '1px solid #1E293B', display: 'flex', gap: '20px', backgroundColor: '#0F172A' }}>
        {[
          { key: 'AGENDA', label: '📅 Agenda / Hoy en Vivo' },
          { key: 'FIXED_SLOTS', label: '⚡ Turnos Fijos Semanales' },
          { key: 'CLIENTS', label: '👥 Clientes & CRM' },
          { key: 'METRICS', label: '📊 Métricas & Ocupación' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '14px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #22C55E' : '3px solid transparent',
              color: activeTab === tab.key ? '#22C55E' : '#94A3B8',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '24px' }}>
        {activeTab === 'AGENDA' && (
          <div>
            {/* Date Picker Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Grilla de Canchas en Tiempo Real</h2>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0 0' }}>La disponibilidad mostrada es la misma que ven los jugadores en la app.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', color: '#94A3B8' }}>Fecha:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Timeline Matrix */}
            <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '12px', overflow: 'hidden' }}>
              {timeline.map(court => (
                <div key={court.courtId} style={{ borderBottom: '1px solid #23324A', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: 700 }}>{court.courtName}</span>
                      <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '10px' }}>{court.surface} · {court.isCovered ? 'Techada' : 'Outdoor'}</span>
                    </div>
                  </div>

                  {/* Horizontal Time Slots for this court */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {court.slots.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>{s.startTime} – {s.endTime}</span>
                        <div>{getStatusBadge(s.status)}</div>
                        <span style={{ color: '#94A3B8', fontSize: '11px' }}>${s.price.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'FIXED_SLOTS' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Turnos Fijos Activos del Club</h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>Aseguran el 60% de los ingresos mensuales recurrentes de las canchas.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#161F30', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #23324A', textAlign: 'left', color: '#94A3B8', fontSize: '12px' }}>
                  <th style={{ padding: '14px 16px' }}>CLIENTE TITULAR</th>
                  <th style={{ padding: '14px 16px' }}>CANCHA</th>
                  <th style={{ padding: '14px 16px' }}>DÍA Y HORARIO</th>
                  <th style={{ padding: '14px 16px' }}>MODALIDAD</th>
                  <th style={{ padding: '14px 16px' }}>PRECIO / PARTIDO</th>
                  <th style={{ padding: '14px 16px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #23324A', fontSize: '14px' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Emiliano Martínez (+54 9 11 5555-0001)</td>
                  <td style={{ padding: '14px 16px' }}>Cancha 2 (Indoor Azul)</td>
                  <td style={{ padding: '14px 16px', color: '#4ADE80', fontWeight: 700 }}>Todos los Jueves · 21:00 hs</td>
                  <td style={{ padding: '14px 16px' }}>Mensual (Cobro automático)</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>$37.800</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ background: '#052e16', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ACTIVO</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'CLIENTS' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>CRM de Jugadores del Club</h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>Historial de reservas, frecuencia y contacto directo por WhatsApp.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#161F30', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #23324A', textAlign: 'left', color: '#94A3B8', fontSize: '12px' }}>
                  <th style={{ padding: '14px 16px' }}>JUGADOR</th>
                  <th style={{ padding: '14px 16px' }}>TELÉFONO</th>
                  <th style={{ padding: '14px 16px' }}>TOTAL RESERVAS</th>
                  <th style={{ padding: '14px 16px' }}>TOTAL GASTADO</th>
                  <th style={{ padding: '14px 16px' }}>ÚLTIMA VISITA</th>
                  <th style={{ padding: '14px 16px' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(cli => (
                  <tr key={cli.id} style={{ borderBottom: '1px solid #23324A', fontSize: '14px' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{cli.name}</td>
                    <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{cli.phone}</td>
                    <td style={{ padding: '14px 16px' }}>{cli.totalBookings} partidos</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#22C55E' }}>${cli.totalSpent.toLocaleString('es-AR')}</td>
                    <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{cli.lastVisit}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <a
                        href={`https://wa.me/${cli.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#25D366', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}
                      >
                        💬 Escribir WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'METRICS' && metrics && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Métricas & Ocupación Inteligente</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', padding: '20px', borderRadius: '12px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Tasa de Ocupación Promedio</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#22C55E', margin: '8px 0 0 0' }}>{metrics.averageOccupancyRate}</h3>
              </div>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', padding: '20px', borderRadius: '12px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>GMV Total Facturado</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '8px 0 0 0' }}>${metrics.gmvTotalARS.toLocaleString('es-AR')}</h3>
              </div>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', padding: '20px', borderRadius: '12px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Turnos Fijos Activos</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#A855F7', margin: '8px 0 0 0' }}>{metrics.activeFixedSlots}</h3>
              </div>
              <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', padding: '20px', borderRadius: '12px' }}>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>Cancha Más Demandada</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FACC15', margin: '8px 0 0 0' }}>{metrics.topCourt}</h3>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manual Booking Modal */}
      {showManualModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Cargar Reserva Manual</h3>
              <button onClick={() => setShowManualModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateManualBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Cancha:</label>
                <select
                  value={manualCourtId}
                  onChange={(e) => setManualCourtId(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
                >
                  <option value="court-arena-1">Cancha 1 (Central Panorámica)</option>
                  <option value="court-arena-2">Cancha 2 (Indoor Azul)</option>
                  <option value="court-arena-3">Cancha 3 (Indoor)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Horario Inicio:</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Precio ($ ARS):</label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Nombre del Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Juan Pérez"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
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
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Origen de la reserva:</label>
                <select
                  value={manualSource}
                  onChange={(e) => setManualSource(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Llamada Telefónica</option>
                  <option value="COUNTER">Mostrador / Presencial</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{ flex: 1, backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#22C55E', color: '#0B0F17', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Guardar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
