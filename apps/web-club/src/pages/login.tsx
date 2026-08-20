import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* ────────────────────────────────────────────────────────────
   Login Page — Void Black Cathedral Login
   ──────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    /* If already authenticated, redirect to panel */
    const session = localStorage.getItem('hayequipo_club_session');
    if (session) {
      router.replace('/panel');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    if (isRegistering && !clubName.trim()) {
      setError('Ingresá el nombre de tu club.');
      return;
    }

    setLoading(true);

    /* Simulate auth — replace with real API */
    await new Promise(r => setTimeout(r, 900));

    /* Store session */
    const session = {
      email: email.trim(),
      clubName: isRegistering ? clubName.trim() : email.split('@')[0].replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ''),
      ts: Date.now(),
    };
    localStorage.setItem('hayequipo_club_session', JSON.stringify(session));
    setLoading(false);
    router.push('/panel');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-void)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Head>
        <title>Iniciar Sesión — Hay Equipo?</title>
        <meta name="description" content="Panel de gestión para clubes — Hay Equipo?" />
      </Head>

      {/* ── Top bar ── */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '22px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <a
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <div style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            backgroundColor: 'var(--color-crimson-signal)',
          }} />
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-frost)',
            letterSpacing: '-0.3px',
          }}>
            HAY EQUIPO?
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
          ← Volver
        </a>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '108px 22px 43px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

          {/* Title block */}
          <div style={{ marginBottom: 43 }}>
            <div style={{
              fontSize: 10,
              color: 'var(--color-crimson-signal)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: 14,
            }}>
              PANEL DE CLUBES
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 56px)',
              fontWeight: 700,
              color: 'var(--color-frost)',
              lineHeight: 0.92,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {isRegistering ? 'REGISTRÁ' : 'INICIÁ'}
            </h1>
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 56px)',
              fontWeight: 700,
              color: 'var(--color-frost)',
              lineHeight: 0.92,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {isRegistering ? 'TU CLUB.' : 'SESIÓN.'}
            </h1>
          </div>

          {/* Hairline */}
          <div style={{
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: 36,
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Club name — only on register */}
            {isRegistering && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 10,
                  color: 'var(--color-graphite)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 9,
                }}>
                  NOMBRE DEL CLUB
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  placeholder="ej. Club Atlético Palermo"
                  autoComplete="organization"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--color-frost)',
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: '-0.2px',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 10,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 9,
              }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tuclub.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--color-frost)',
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: '-0.2px',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 10,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: 9,
              }}>
                CONTRASEÑA
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--color-frost)',
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: '2px',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--color-crimson-signal)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontSize: 13,
                color: 'var(--color-crimson-signal)',
                padding: '9px 0',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '18px 0',
                backgroundColor: loading ? 'rgba(252,28,70,0.5)' : 'var(--color-crimson-signal)',
                color: 'var(--color-frost)',
                border: 'none',
                borderRadius: 'var(--radius-buttons)',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background-color 0.2s ease, transform 0.15s ease, filter 0.15s ease',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading ? 'VERIFICANDO...' : isRegistering ? 'CREAR CUENTA →' : 'INGRESAR →'}
            </button>

            {/* Fast Demo Access Button */}
            <button
              type="button"
              onClick={() => {
                const demoSession = {
                  email: 'demo@clubpadelcenter.com',
                  clubName: 'Club Padel Center',
                  ts: Date.now(),
                };
                localStorage.setItem('hayequipo_club_session', JSON.stringify(demoSession));
                router.push('/panel');
              }}
              style={{
                width: '100%',
                padding: '16px 0',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-buttons)',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(252, 28, 70, 0.15)';
                e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = 'var(--color-frost)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>⚡ Probar Demo (Club Padel Center)</span>
            </button>
          </form>

          {/* Toggle register / login */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-graphite)',
                fontSize: 13,
                cursor: 'pointer',
                padding: '9px 14px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-frost)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-graphite)')}
            >
              {isRegistering
                ? '¿Ya tenés cuenta? Iniciá sesión'
                : '¿No tenés cuenta? Registrá tu club'}
            </button>
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 65,
            textAlign: 'center',
            fontSize: 10,
            color: 'var(--color-graphite)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: 1.6,
          }}>
            PANEL GRATUITO PARA CLUBES ASOCIADOS
            <br />
            © 2026 HAY EQUIPO?
          </div>
        </div>
      </main>
    </div>
  );
}
