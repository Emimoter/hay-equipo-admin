import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Head>
        <title>404 — Fuera de Cancha | HAY EQUIPO?</title>
        <meta name="description" content="La página que estás buscando no existe o fue movida. Volvé a explorar las mejores canchas de la red." />
      </Head>

      {/* ── Fixed Minimal Header ── */}
      <header
        style={{
          height: 72,
          padding: '0 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fc1c46', display: 'inline-block' }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            HAY EQUIPO?
          </span>
        </Link>

        <Link
          href="/reservar"
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            transition: 'all 0.2s ease',
          }}
        >
          EXPLORAR CANCHAS
        </Link>
      </header>

      {/* ── Main Error Showcase Container (Strictly 90° Geometry) ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 0,
            padding: 'clamp(32px, 6vw, 64px)',
            position: 'relative',
          }}
        >
          {/* Crimson accent line on top edge */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: '#fc1c46',
            }}
          />

          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(252, 28, 70, 0.12)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              marginBottom: 24,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fc1c46' }} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#fc1c46',
              }}
            >
              CÓDIGO 404 · JUGADA EN OFFSIDE
            </span>
          </div>

          {/* Big Headline */}
          <h1
            style={{
              fontSize: 'clamp(36px, 7vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: '0 0 16px',
            }}
          >
            PELOTA FUERA DE LA CANCHA.
          </h1>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: '#94a3b8',
              margin: '0 0 36px',
              maxWidth: 480,
            }}
          >
            El enlace que abriste no existe, el partido ya expiró o la cancha cambió de dirección. No te quedes afuera del próximo encuentro.
          </p>

          {/* Action CTAs (Strictly 100% Pills) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <Link
              href="/reservar"
              style={{
                backgroundColor: '#fc1c46',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '14px 28px',
                fontSize: 12.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(252, 28, 70, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>BUSCAR CANCHAS DISPONIBLES</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link
              href="/"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '9999px',
                padding: '14px 24px',
                fontSize: 12.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              IR AL INICIO
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '24px 36px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#666666',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        <span>HAY EQUIPO? · PLATAFORMA DEPORTIVA</span>
        <span>ERROR 404</span>
      </footer>
    </div>
  );
}
