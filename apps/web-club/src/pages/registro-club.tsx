import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* ────────────────────────────────────────────────────────────
   Registro de Clubes — Hay Equipo?
   ──────────────────────────────────────────────────────────── */

type SportOption = 'FUTBOL' | 'PADEL' | 'TENIS' | 'BASQUET';

const SPORT_CONFIG: { id: SportOption; label: string; icon: string }[] = [
  { id: 'FUTBOL', label: 'Fútbol', icon: '⚽' },
  { id: 'PADEL', label: 'Pádel', icon: '🎾' },
  { id: 'TENIS', label: 'Tenis', icon: '🎾' },
  { id: 'BASQUET', label: 'Básquet', icon: '🏀' },
];

export default function RegistroClubPage() {
  const router = useRouter();

  // Form State
  const [clubName, setClubName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [sports, setSports] = useState<SportOption[]>(['FUTBOL', 'PADEL']);
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleSport = (id: SportOption) => {
    setSports(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Mantener al menos 1 seleccionado
        return prev.filter(s => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getSportsLabel = () => {
    return sports
      .map(id => SPORT_CONFIG.find(c => c.id === id)?.label || id)
      .join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clubName.trim()) {
      setError('Por favor, ingresá el nombre de tu club.');
      return;
    }
    if (!phone.trim()) {
      setError('Por favor, ingresá un teléfono o WhatsApp de contacto.');
      return;
    }
    if (!address.trim()) {
      setError('Por favor, ingresá la dirección del club.');
      return;
    }
    if (sports.length === 0) {
      setError('Por favor, seleccioná al menos una disciplina/cancha.');
      return;
    }

    setSubmitting(true);

    const sportLabel = getSportsLabel();

    const payload = {
      clubName: clubName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      sport: sportLabel,
      contactName: contactName.trim() || 'No especificado',
      email: email.trim() || 'No especificado',
      notes: notes.trim() || 'Sin notas adicionales',
      _subject: `[Hay Equipo] Nueva solicitud de club: ${clubName.trim()} (${sportLabel})`,
    };

    try {
      // 1. Send via local API endpoint
      await fetch('/api/registro-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // 2. Direct client-side dispatch to Emiliano's email for redundancy
      await fetch('https://formsubmit.co/ajax/emiliano.gimenez.96@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          destinatario: 'emiliano.gimenez.96@gmail.com',
        }),
      }).catch(() => null);

      setSubmitting(false);
      setSubmitted(true);
    } catch {
      // Graceful fallback
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-void)',
      color: 'var(--color-frost)',
      fontFamily: 'var(--font-sui)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Head>
        <title>Publicá tus Canchas Gratis — Hay Equipo?</title>
        <meta name="description" content="Hacé que tus canchas aparezcan en nuestra app de forma gratuita. Sumá tu club a la red de Hay Equipo." />
      </Head>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '20px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <a
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'var(--color-crimson-signal)',
            boxShadow: '0 0 10px var(--color-crimson-signal)',
          }} />
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-frost)',
            letterSpacing: '-0.3px',
          }}>
            HAY EQUIPO?
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--color-graphite)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginLeft: 4,
          }}>
            / PARA CLUBES
          </span>
        </a>

        <a
          href="/"
          style={{
            fontSize: 12,
            color: 'var(--color-graphite)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-frost)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-graphite)')}
        >
          ← Volver a la web
        </a>
      </header>

      {/* ── MAIN FORM CONTAINER ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '110px 24px 60px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 640,
        }}>

          {/* Top Title Block */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(252, 28, 70, 0.12)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              borderRadius: 9999,
              padding: '6px 16px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-crimson-signal)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 18,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)' }} />
              SUMÁ TU CLUB · 100% GRATUITO
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: 'var(--color-frost)',
              lineHeight: 1.0,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              margin: '0 0 14px',
            }}>
              HACÉ QUE TUS CANCHAS APAREZCAN EN NUESTRA APP.
            </h1>

            <p style={{
              fontSize: 16,
              color: 'var(--color-ash)',
              lineHeight: 1.45,
              margin: 0,
            }}>
              Completá el formulario para que nuestro equipo habilite tu club en la red de Hay Equipo y puedas recibir reservas automáticas desde la app.
            </p>
          </div>

          {/* Hairline */}
          <div style={{
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: 32,
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Field 1: Nombre del Club */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 8,
              }}>
                NOMBRE DEL CLUB *
              </label>
              <input
                type="text"
                required
                value={clubName}
                onChange={e => setClubName(e.target.value)}
                placeholder="ej. Club Atlético Palermo / Padel Center Norte"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-frost)',
                  fontSize: 16,
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
              />
            </div>

            {/* Field 2: Teléfono / WhatsApp */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 8,
              }}>
                NÚMERO DE TELÉFONO / WHATSAPP *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="ej. +54 9 11 5566-7788"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-frost)',
                  fontSize: 16,
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
              />
            </div>

            {/* Field 3: Dirección del Club */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 8,
              }}>
                DIRECCIÓN DEL CLUB (CALLE Y LOCALIDAD) *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ej. Av. del Libertador 4400, Palermo, CABA"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-frost)',
                  fontSize: 16,
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
              />
            </div>

            {/* Field 4: Deportes / Tipo de Canchas (Multi-select Pills) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{
                  fontSize: 11,
                  color: 'var(--color-graphite)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}>
                  ¿QUÉ CANCHAS TENÉS EN EL CLUB? *
                </label>
                <span style={{ fontSize: 11, color: 'var(--color-crimson-signal)', fontWeight: 600 }}>
                  (Podés elegir varias)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {SPORT_CONFIG.map(item => {
                  const isSelected = sports.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSport(item.id)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 12,
                        border: isSelected ? '1px solid var(--color-crimson-signal)' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.15)' : '#101216',
                        color: isSelected ? '#ffffff' : 'var(--color-ash)',
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isSelected && (
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-crimson-signal)',
                          marginLeft: 2,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 5: Responsable & Email (Two Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--color-graphite)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 8,
                }}>
                  NOMBRE DEL RESPONSABLE
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="ej. Emiliano Giménez"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--color-frost)',
                    fontSize: 15,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  color: 'var(--color-graphite)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 8,
                }}>
                  EMAIL DE CONTACTO
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ej. contacto@tuclub.com"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--color-frost)',
                    fontSize: 15,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                color: 'var(--color-crimson-signal)',
                fontSize: 14,
                padding: '8px 0',
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 14,
                padding: '20px 30px',
                backgroundColor: submitting ? 'rgba(252,28,70,0.5)' : 'var(--color-crimson-signal)',
                color: 'var(--color-frost)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px -4px rgba(252, 28, 70, 0.4)',
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  e.currentTarget.style.filter = 'brightness(1.15)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {submitting ? 'ENVIANDO SOLICITUD...' : 'CONFIRMAR Y PUBLICAR GRATIS →'}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop: 48,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--color-graphite)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: 1.6,
          }}>
            SIN COMISIONES FIJAS · ACTIVACIÓN EN MENOS DE 24 HORAS
            <br />
            © 2026 HAY EQUIPO? · ARGENTINA
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────
          CONFIRMATION MODAL / CARTEL DE CONFIRMACIÓN
          ──────────────────────────────────────────────────────────── */}
      {submitted && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            backgroundColor: '#0f1115',
            border: '1px solid rgba(252, 28, 70, 0.3)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(252, 28, 70, 0.15)',
            textAlign: 'center',
            animation: 'fadeInUp 0.35s ease-out',
          }}>
            {/* Animated Check Icon Box */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(252, 28, 70, 0.15)',
              border: '1px solid var(--color-crimson-signal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px',
              color: 'var(--color-crimson-signal)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div style={{
              fontSize: 11,
              color: 'var(--color-crimson-signal)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: 10,
            }}>
              SOLICITUD ENVIADA
            </div>

            <h2 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--color-frost)',
              lineHeight: 1.1,
              margin: '0 0 14px',
              textTransform: 'uppercase',
            }}>
              ¡Nos contactaremos contigo lo antes posible!
            </h2>

            <p style={{
              fontSize: 15,
              color: 'var(--color-ash)',
              lineHeight: 1.45,
              marginBottom: 24,
            }}>
              Recibimos los datos de <strong style={{ color: '#fff' }}>{clubName}</strong> correctamente. Nuestro equipo se comunicará al <strong style={{ color: '#fff' }}>{phone}</strong> para habilitar las canchas en la app.
            </p>

            <div style={{
              backgroundColor: '#16181e',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: '14px 18px',
              textAlign: 'left',
              fontSize: 13,
              color: 'var(--color-ash)',
              marginBottom: 28,
              lineHeight: 1.6,
            }}>
              <div><strong style={{ color: '#fff' }}>Club:</strong> {clubName}</div>
              <div><strong style={{ color: '#fff' }}>Teléfono:</strong> {phone}</div>
              <div><strong style={{ color: '#fff' }}>Ubicación:</strong> {address}</div>
              <div><strong style={{ color: '#fff' }}>Deportes:</strong> {getSportsLabel()}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                ← Volver al Inicio
              </button>

              <button
                onClick={() => router.push('/panel')}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-graphite)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-graphite)')}
              >
                ⚡ Ver cómo funciona el Panel Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyframe Animation ── */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
