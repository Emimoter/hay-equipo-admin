import React from 'react';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#0B0F17', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#22C55E', color: '#0B0F17', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
            HE
          </div>
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>HAY EQUIPO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/login" style={{ color: '#F8FAFC', textDecoration: 'none', fontWeight: 600, fontSize: '14px', alignSelf: 'center' }}>Ingresar</a>
          <a href="/club" style={{ backgroundColor: '#22C55E', color: '#0B0F17', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>Panel para Clubes</a>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#1E1B4B', color: '#CCFF00', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '20px' }}>
          🇦🇷 LA PLATAFORMA N°1 DE RESERVAS DEPORTIVAS EN ARGENTINA
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px 0', letterSpacing: '-1.5px' }}>
          Encontrá, reservá y dividí tu cancha de <span style={{ color: '#22C55E' }}>Pádel y Fútbol</span> en segundos.
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '680px', margin: '0 auto 40px auto', lineHeight: 1.6 }}>
          Olvidate de preguntar horarios por WhatsApp y hacer cuentas a mano. Disponibilidad real en vivo, Split Payment automático e invitaciones instantáneas.
        </p>

        {/* Quick Sport SEO Category Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '60px' }}>
          {['Pádel en Buenos Aires', 'Fútbol 5 en CABA', 'Fútbol 7 en Palermo', 'Pádel en Córdoba', 'Fútbol 11 en Urquiza'].map((label, i) => (
            <div key={i} style={{ backgroundColor: '#161F30', border: '1px solid #23324A', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
              📍 {label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
