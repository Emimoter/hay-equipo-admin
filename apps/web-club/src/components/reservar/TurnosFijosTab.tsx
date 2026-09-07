import React, { useState } from 'react';

interface TurnosFijosTabProps {
  onNavigateHome: () => void;
}

const Icons = {
  Repeat: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Zap: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
  WhatsApp: ({ size = 14, color = '#25D366' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIMES = ['18:00', '19:30', '21:00', '22:30'];

export const TurnosFijosTab: React.FC<TurnosFijosTabProps> = ({ onNavigateHome }) => {
  const [selectedSport, setSelectedSport] = useState<'PADEL' | 'FUTBOL'>('PADEL');
  const [selectedDay, setSelectedDay] = useState('Jueves');
  const [selectedTime, setSelectedTime] = useState('21:00');
  const [duration, setDuration] = useState('3 Meses');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      alert('Por favor completá tu nombre y WhatsApp de contacto.');
      return;
    }

    const message = encodeURIComponent(
      `Hola Hay Equipo! Quiero contratar un Turno Fijo de ${selectedSport === 'PADEL' ? 'Pádel' : 'Fútbol'}.\n` +
      `Día: ${selectedDay}\nHorario: ${selectedTime} hs\nDuración: ${duration}\nNombre: ${applicantName}\nWhatsApp: ${applicantPhone}`
    );
    window.open(`https://wa.me/5492235550199?text=${message}`, '_blank');
    setFormSent(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
          04 / SISTEMA DE TURNOS PERMANENTES
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
          Turnos Fijos Semanales
        </h1>
        <p style={{ color: 'var(--color-ash)', fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: 650 }}>
          Asegurá tu cancha el mismo día y a la misma hora todas las semanas. Sin pelear por turnos, con precio congelado y garantía de liberación si no podés asistir.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: 32, alignItems: 'start' }}>
        {/* ── Formulario de Cotización / Solicitud ── */}
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(76, 76, 76, 0.4)',
            padding: '30px 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Icons.Repeat size={18} color="var(--color-crimson-signal)" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
              Configurá tu Turno Fijo
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Deporte */}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Deporte
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['PADEL', 'FUTBOL'] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSelectedSport(s)}
                    style={{
                      flex: 1,
                      backgroundColor: selectedSport === s ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.04)',
                      color: '#ffffff',
                      border: `1px solid ${selectedSport === s ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                      padding: '10px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s === 'PADEL' ? 'Pádel' : 'Fútbol'}
                  </button>
                ))}
              </div>
            </div>

            {/* Día de la semana */}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Día Preferido
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                {DAYS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    style={{
                      backgroundColor: selectedDay === d ? 'rgba(252, 28, 70, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedDay === d ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                      border: `1px solid ${selectedDay === d ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                      padding: '8px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Horario Central
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {TIMES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    style={{
                      flex: 1,
                      backgroundColor: selectedTime === t ? 'rgba(252, 28, 70, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedTime === t ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                      border: `1px solid ${selectedTime === t ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                      padding: '8px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t} hs
                  </button>
                ))}
              </div>
            </div>

            {/* Duración */}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                Duración del Contrato
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['3 Meses', '6 Meses', 'Temporada Anual'].map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setDuration(dur)}
                    style={{
                      flex: 1,
                      backgroundColor: duration === dur ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                      color: duration === dur ? '#ffffff' : 'var(--color-ash)',
                      border: `1px solid ${duration === dur ? '#ffffff' : 'rgba(76, 76, 76, 0.4)'}`,
                      padding: '8px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Datos Personales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                  Tu Nombre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Emiliano"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
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
                  WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ej: 11 5555-0001"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
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

            {/* Botón Enviar */}
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-crimson-signal)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 20px',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
                boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
              }}
            >
              <Icons.WhatsApp size={16} color="#ffffff" />
              <span>Solicitar Turno Fijo Vía WhatsApp</span>
            </button>

            {formSent && (
              <div style={{ fontSize: 12, color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
                ¡Solicitud enviada! Nuestro equipo coordinará la disponibilidad con el club seleccionado.
              </div>
            )}
          </form>
        </div>

        {/* ── Ventajas & Liberación al Marketplace ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card: Liberación al Marketplace */}
          <div
            style={{
              backgroundColor: 'rgba(252, 28, 70, 0.04)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Icons.Zap size={18} color="var(--color-crimson-signal)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                Liberación al Marketplace
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, margin: 0 }}>
              ¿Te vas de viaje o una semana no juntan los 4 jugadores? <strong>No perdés tu dinero</strong>. Con 1 clic en la app o web liberás esa fecha específica al marketplace de Hay Equipo. Si otro grupo la reserva, recibís el <strong>100% de reintegro</strong> en tu cuenta.
            </p>
          </div>

          {/* Card: Beneficios incluidos */}
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(76, 76, 76, 0.4)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Icons.ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                Beneficios del Turno Fijo
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Tarifa mensual congelada por todo el período contratado.',
                'Prioridad número 1 en la mejor cancha del complejo.',
                'Opción de Split automático: el cobro se divide entre los 4 titulares.',
                'Acceso preferencial a torneos internos y eventos del club.',
              ].map((benefit, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 13, color: 'var(--color-frost)' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
