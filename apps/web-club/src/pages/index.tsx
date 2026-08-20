import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

/* ────────────────────────────────────────────────────────────
   Intersection Observer Hook for Scroll Reveals
   ──────────────────────────────────────────────────────────── */

function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      }
    }, { threshold: 0.15, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

/* ────────────────────────────────────────────────────────────
   Animated Reveal Components
   ──────────────────────────────────────────────────────────── */

/** Masked Slide Up Line (ThoughtLab Guillotine Text Reveal) */
function MaskedText({
  children,
  delay = 0,
  duration = 0.9,
  inView,
  style = {},
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  inView: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div style={{ overflow: 'hidden', display: 'inline-block', verticalAlign: 'top', ...style }} className={className}>
      <div
        style={{
          transform: inView ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 115%, 0)',
          opacity: inView ? 1 : 0,
          transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity ${duration * 0.6}s ease ${delay}s`,
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Tracking & Blur Expand Reveal */
function TrackingBlurReveal({
  children,
  delay = 0,
  inView,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        filter: inView ? 'blur(0px)' : 'blur(10px)',
        transform: inView ? 'translateY(0px)' : 'translateY(24px)',
        letterSpacing: inView ? (style.letterSpacing || 'normal') : '4px',
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, letter-spacing 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, filter, transform, letter-spacing',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Hairline Border Expansion */
function HairlineRule({ inView, delay = 0 }: { inView: boolean; delay?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '1px',
        backgroundColor: 'var(--color-graphite)',
        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'transform',
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   QR Code Placeholder SVG
   ──────────────────────────────────────────────────────────── */

function QRCodeSVG() {
  const s = 8;
  const cells: React.ReactNode[] = [];

  const drawFinder = (ox: number, oy: number) => {
    for (let i = 0; i < 7; i++) {
      cells.push(<rect key={`f-${ox}-${oy}-t${i}`} x={(ox + i) * s} y={oy * s} width={s} height={s} fill="#fff" />);
      cells.push(<rect key={`f-${ox}-${oy}-b${i}`} x={(ox + i) * s} y={(oy + 6) * s} width={s} height={s} fill="#fff" />);
    }
    for (let i = 1; i < 6; i++) {
      cells.push(<rect key={`f-${ox}-${oy}-l${i}`} x={ox * s} y={(oy + i) * s} width={s} height={s} fill="#fff" />);
      cells.push(<rect key={`f-${ox}-${oy}-r${i}`} x={(ox + 6) * s} y={(oy + i) * s} width={s} height={s} fill="#fff" />);
    }
    for (let r = 2; r < 5; r++) {
      for (let c = 2; c < 5; c++) {
        cells.push(<rect key={`f-${ox}-${oy}-i${r}${c}`} x={(ox + c) * s} y={(oy + r) * s} width={s} height={s} fill="#fff" />);
      }
    }
  };

  drawFinder(1, 1);
  drawFinder(17, 1);
  drawFinder(1, 17);

  const dataPattern = [
    [10,10],[11,10],[13,10],[14,11],[10,12],[12,12],[14,12],[15,13],
    [10,14],[11,14],[13,14],[14,14],[10,16],[12,16],[14,16],[16,16],
    [9,9],[11,11],[13,13],[15,15],[17,17],[18,18],[19,19],[20,20],
    [9,11],[10,13],[11,15],[12,17],[9,19],[11,19],[13,19],[15,19],
    [17,19],[19,17],[19,15],[19,13],[19,11],[19,9],[17,9],[15,9],
    [13,9],[12,10],[14,10],[16,10],[18,10],[16,12],[18,12],[20,12],
    [16,14],[18,14],[20,14],[16,16],[18,16],[20,16],[18,18],[20,18],
    [20,10],[22,10],[22,12],[22,14],[22,16],[22,18],[22,20],[20,22],
    [18,22],[16,22],[14,22],[12,22],[10,22],[9,22],[11,22],[13,22],
    [15,22],[17,22],[19,22],[21,22],[21,20],[21,18],[21,16],[21,14],
  ];

  dataPattern.forEach(([x, y], i) => {
    if (x >= 0 && x < 25 && y >= 0 && y < 25) {
      cells.push(<rect key={`d-${i}`} x={x * s} y={y * s} width={s} height={s} fill="#fff" />);
    }
  });

  return (
    <svg viewBox={`0 0 ${25 * s} ${25 * s}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width={25 * s} height={25 * s} fill="#000" />
      {cells}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Features data
   ──────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    num: '01',
    title: 'Reservá al Instante',
    desc: 'Buscá canchas cerca tuyo, elegí el horario que te sirva y reservá con un toque. Sin llamar, sin esperar, sin WhatsApp. La cancha se confirma en segundos y el turno queda bloqueado en tiempo real.',
  },
  {
    num: '02',
    title: 'Split de Gastos',
    desc: 'Dividí el costo del turno entre todos los jugadores automáticamente. Cada uno paga su parte desde la app y vos dejás de perseguir a nadie. Transparente, justo, sin vueltas.',
  },
  {
    num: '03',
    title: 'Armá tu Equipo',
    desc: 'Encontrá jugadores disponibles cerca tuyo, creá grupos recurrentes, desafiá a otros equipos. La red deportiva que convierte desconocidos en rivales y rivales en amigos.',
  },
  {
    num: '04',
    title: 'Para Clubes',
    desc: 'Publicá tus canchas, gestioná la disponibilidad y recibí reservas desde la app. Turnos fijos, tarifas valle/pico, control total del calendario. Todo desde un panel diseñado para operadores.',
  },
];

const STATS = [
  { value: '+2.000', label: 'CANCHAS DISPONIBLES', prefix: '+' },
  { value: '+50K', label: 'JUGADORES ACTIVOS', prefix: '+' },
  { value: '+150', label: 'CLUBES ASOCIADOS', prefix: '+' },
  { value: '24/7', label: 'RESERVAS EN TIEMPO REAL', prefix: '' },
];

/* ────────────────────────────────────────────────────────────
   Landing Page Component
   ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const ballContainerRef = useRef<HTMLDivElement | null>(null);
  const soccerBallRef = useRef<HTMLImageElement | null>(null);
  const padelBallRef = useRef<HTMLImageElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  // Section in-view refs
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.2 });
  const [featRef, featInView] = useInView({ threshold: 0.15 });
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });
  const [downloadRef, downloadInView] = useInView({ threshold: 0.2 });
  const [clubRef, clubInView] = useInView({ threshold: 0.2 });
  const [cityRef, cityInView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    setIsLoaded(true);

    let rafId = 0;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;

        // 1. Hardware Accelerated Ball Parallax Transform (No React state lag)
        if (ballContainerRef.current) {
          const rotation = y * 0.42;
          const translateY = y * 0.18;
          // Cleanly fade out & occlude as scroll approaches Section 3 (Funcionalidades)
          const globalOpacity = y > 750 ? Math.max(0, 1 - (y - 750) / 220) : 1;

          ballContainerRef.current.style.transform = `translate3d(0, calc(-50% + ${translateY}px), 0) rotate(${rotation}deg)`;
          ballContainerRef.current.style.opacity = String(globalOpacity);
          ballContainerRef.current.style.display = globalOpacity <= 0.001 ? 'none' : 'block';
        }

        // 2. Pure GPU Opacity Crossfade: Soccer -> Padel
        if (soccerBallRef.current) {
          const soccerOpacity = Math.min(1, Math.max(0, 1 - (y - 180) / 320));
          soccerBallRef.current.style.opacity = String(soccerOpacity);
        }

        if (padelBallRef.current) {
          const padelOpacity = Math.min(1, Math.max(0, (y - 220) / 320));
          padelBallRef.current.style.opacity = String(padelOpacity);
        }

        // 3. Header background on scroll
        if (headerRef.current) {
          if (y > 80) {
            headerRef.current.style.background = 'rgba(0,0,0,0.88)';
            headerRef.current.style.backdropFilter = 'blur(16px)';
            headerRef.current.style.borderBottom = '1px solid rgba(76,76,76,0.3)';
          } else {
            headerRef.current.style.background = 'transparent';
            headerRef.current.style.backdropFilter = 'none';
            headerRef.current.style.borderBottom = '1px solid transparent';
          }
        }

        // 4. (Scroll) hint text fade
        if (scrollIndicatorRef.current) {
          const indOpacity = Math.max(0, 1 - y / 260);
          scrollIndicatorRef.current.style.opacity = String(indOpacity);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial execution
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-void)' }}>
      <Head>
        <title>HAY EQUIPO? — Reservá tu cancha, armá tu equipo</title>
        <meta name="description" content="La app que conecta jugadores con las mejores canchas deportivas de Argentina. Reservá al instante, dividí los gastos y armá tu equipo." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload ball textures for instant lag-free GPU rendering */}
        <link rel="preload" as="image" href="/soccer-ball-hd.jpg" />
        <link rel="preload" as="image" href="/padel-ball-red.jpg" />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          FIXED MORPHING BALL — Zero-Lag Hardware Accelerated
          ═══════════════════════════════════════════════════════ */}
      <div
        ref={ballContainerRef}
        style={{
          position: 'fixed',
          top: '50%',
          right: '-2%',
          width: 'min(50vw, 560px)',
          height: 'min(50vw, 560px)',
          transform: 'translate3d(0, -50%, 0) rotate(0deg)',
          opacity: 1,
          zIndex: 1,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        {/* 1. Soccer Ball (Hero Section -> Fades Smoothly) */}
        <img
          ref={soccerBallRef}
          src="/soccer-ball-hd.jpg"
          alt="Pelota de fútbol oficial Hay Equipo"
          loading="eager"
          decoding="sync"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '50%',
            opacity: 1,
            willChange: 'opacity',
          }}
        />

        {/* 2. Clean Crimson Padel Ball (Section 2 Manifiesto -> Sharp, No Outer Halo) */}
        <img
          ref={padelBallRef}
          src="/padel-ball-red.jpg"
          alt="Pelota de pádel oficial Hay Equipo"
          loading="eager"
          decoding="sync"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '50%',
            opacity: 0,
            willChange: 'opacity',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          HEADER — Fixed, transparent, ThoughtLab-style
          ═══════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          padding: '0 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
          background: 'transparent',
          borderBottom: '1px solid transparent',
          transition: 'background 0.25s, border-bottom 0.25s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
          <span style={{ fontSize: 27, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-graphite)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            / Red Deportiva · Argentina
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Botón 1: Publicá tus Canchas (Outline / Glass Obsidian — color diferenciado) */}
          <a
            href="/registro-club"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--color-frost)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: 'var(--radius-full)',
              padding: '9px 24px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-crimson-signal)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-crimson-signal)';
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(252, 28, 70, 0.08)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.22)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-frost)';
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
            }}
          >
            <span>Publicá tus Canchas</span>
            <span style={{ fontSize: 13, lineHeight: 1 }}>→</span>
          </a>

          {/* Botón 2: Descargá la App (Solid Crimson Signal) */}
          <a
            href="#descargar"
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: 'var(--color-frost)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '9px 28px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              transition: 'transform 0.2s ease, filter 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.15)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.filter = 'none';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
            }}
          >
            Descargá la App
          </a>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Staggered Masked Guillotine Reveal
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '0 36px',
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '65%' }}>
            
            {/* Eyebrow: Tracking Expansion */}
            <TrackingBlurReveal inView={isLoaded} delay={0.1} style={{ fontSize: '10px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 22 }}>
              LA APP PARA JUGADORES Y CLUBES
            </TrackingBlurReveal>

            {/* Giant Display Lines: Staggered Guillotine slide up */}
            <h1 style={{ margin: 0, padding: 0 }}>
              <div style={{ display: 'block' }}>
                <MaskedText inView={isLoaded} delay={0.2} duration={1.0}>
                  <span style={{ display: 'block', fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.95, letterSpacing: '-2px', textTransform: 'uppercase' }}>
                    Reservá.
                  </span>
                </MaskedText>
              </div>

              <div style={{ display: 'block' }}>
                <MaskedText inView={isLoaded} delay={0.35} duration={1.0}>
                  <span style={{ display: 'block', fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.95, letterSpacing: '-2px', textTransform: 'uppercase' }}>
                    Jugá.
                  </span>
                </MaskedText>
              </div>

              <div style={{ display: 'block' }}>
                <MaskedText inView={isLoaded} delay={0.5} duration={1.0}>
                  <span style={{ display: 'block', fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.95, letterSpacing: '-2px', textTransform: 'uppercase' }}>
                    Repetí.
                  </span>
                </MaskedText>
              </div>
            </h1>

            {/* Subtitle: Soft slide up + blur clear */}
            <TrackingBlurReveal inView={isLoaded} delay={0.7} style={{ fontSize: '18px', color: 'var(--color-ash)', marginTop: 26, maxWidth: 520, lineHeight: 1.3 }}>
              La plataforma que conecta jugadores con las mejores canchas deportivas de Argentina. Reservá al instante, dividí los gastos y armá tu equipo.
            </TrackingBlurReveal>
          </div>
        </div>

        {/* (Scroll) indicator */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 14,
            color: 'var(--color-graphite)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 1,
            transition: 'opacity 0.2s',
          }}
        >
          (Scroll)
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT — Sentence-by-sentence Gradient Wave Reveal
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={aboutRef}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '108px 36px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <HairlineRule inView={aboutInView} delay={0.1} />

          <div style={{ maxWidth: 960, marginTop: 65 }}>
            <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 22 }}>
              <MaskedText inView={aboutInView} delay={0.2}>
                00 / MANIFIESTO
              </MaskedText>
            </div>

            <p style={{
              fontSize: 'clamp(24px, 3.4vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.25,
              letterSpacing: '-0.8px',
              margin: 0,
            }}>
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--color-frost)',
                  opacity: aboutInView ? 1 : 0.1,
                  transform: aboutInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
                }}
              >
                Hay Equipo? es la red deportiva en tiempo real para Argentina.
              </span>{' '}
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--color-ash)',
                  opacity: aboutInView ? 1 : 0.1,
                  transform: aboutInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease 0.5s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
                }}
              >
                Conectamos jugadores que buscan cancha con clubes que tienen disponibilidad.
              </span>{' '}
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--color-graphite)',
                  opacity: aboutInView ? 1 : 0.1,
                  transform: aboutInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease 0.7s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
                }}
              >
                Sin llamadas, sin esperas, sin grupos de WhatsApp.
              </span>{' '}
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--color-crimson-signal)',
                  fontWeight: 700,
                  opacity: aboutInView ? 1 : 0.1,
                  transform: aboutInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease 0.9s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s',
                }}
              >
                Un toque y jugás.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — Staggered Card & Number Zoom Reveals
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={featRef}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '43px 36px 108px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 65 }}>
            <div
              style={{
                width: featInView ? 48 : 0,
                height: 1,
                backgroundColor: 'var(--color-crimson-signal)',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            />
            <MaskedText inView={featInView} delay={0.2}>
              <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--color-frost)', margin: 0 }}>
                Funcionalidades
              </h2>
            </MaskedText>
          </div>

          {/* Features grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 43,
          }}>
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Hairline across top with staggered delay */}
                <HairlineRule inView={featInView} delay={0.2 + i * 0.12} />

                {/* Number with scale drop reveal */}
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 700,
                    color: '#181818',
                    lineHeight: 1,
                    marginTop: 36,
                    marginBottom: 22,
                    letterSpacing: '-2px',
                    transform: featInView ? 'scale(1) translateY(0)' : 'scale(1.4) translateY(15px)',
                    opacity: featInView ? 1 : 0,
                    transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.15}s, opacity 0.8s ease ${0.3 + i * 0.15}s`,
                    willChange: 'transform, opacity',
                  }}
                >
                  {feat.num}
                </div>

                {/* Title slide */}
                <MaskedText inView={featInView} delay={0.4 + i * 0.15}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 14px', lineHeight: 1.1 }}>
                    {feat.title}
                  </h3>
                </MaskedText>

                {/* Description fade */}
                <div
                  style={{
                    opacity: featInView ? 1 : 0,
                    transform: featInView ? 'translateY(0)' : 'translateY(18px)',
                    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.5 + i * 0.15}s`,
                  }}
                >
                  <p style={{ fontSize: 14, color: 'var(--color-ash)', lineHeight: 1.55, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════
          DOWNLOAD — QR Code & Shutter Heading Reveal
          ═══════════════════════════════════════════════════════ */}
      <section
        id="descargar"
        ref={downloadRef}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '108px 36px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <HairlineRule inView={downloadInView} delay={0.1} />

          <div style={{
            marginTop: 65,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 86,
            alignItems: 'center',
          }}>
            {/* Left — Heading + description */}
            <div>
              <TrackingBlurReveal inView={downloadInView} delay={0.2} style={{ fontSize: '10px', color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 9 }}>
                DISPONIBLE PARA IOS Y ANDROID
              </TrackingBlurReveal>

              <h2 style={{ margin: '0 0 22px', padding: 0 }}>
                <div style={{ display: 'block' }}>
                  <MaskedText inView={downloadInView} delay={0.3} duration={1.0}>
                    <span style={{ display: 'block', fontSize: 'clamp(42px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                      DESCARGÁ
                    </span>
                  </MaskedText>
                </div>
                <div style={{ display: 'block' }}>
                  <MaskedText inView={downloadInView} delay={0.45} duration={1.0}>
                    <span style={{ display: 'block', fontSize: 'clamp(42px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                      LA APP.
                    </span>
                  </MaskedText>
                </div>
              </h2>

              <TrackingBlurReveal inView={downloadInView} delay={0.6} style={{ fontSize: '18px', color: 'var(--color-ash)', lineHeight: 1.25, maxWidth: 480, margin: '0 0 36px' }}>
                Escaneá el código QR con tu celular o buscá &quot;Hay Equipo&quot; en App Store o Google Play. Creá tu cuenta en segundos y empezá a reservar.
              </TrackingBlurReveal>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  flexWrap: 'wrap',
                  opacity: downloadInView ? 1 : 0,
                  transform: downloadInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.75s',
                }}
              >
                <a
                  href="#"
                  style={{
                    backgroundColor: 'var(--color-frost)',
                    color: 'var(--color-void)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '14px 36px',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
                >
                  App Store
                </a>
                <a
                  href="#"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    padding: '14px 36px',
                    fontSize: 14,
                    fontWeight: 400,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-frost)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-graphite)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
                >
                  Google Play
                </a>
              </div>
            </div>

            {/* Right — QR Code with Shutter Box Reveal */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                opacity: downloadInView ? 1 : 0,
                transform: downloadInView ? 'scale(1) rotate(0deg)' : 'scale(0.85) rotate(-6deg)',
                filter: downloadInView ? 'blur(0px)' : 'blur(10px)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              }}
            >
              <div style={{
                width: 200,
                height: 200,
                border: '1px solid var(--color-graphite)',
                padding: 14,
                backgroundColor: '#000000',
              }}>
                <QRCodeSVG />
              </div>
              <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ESCANEÁ PARA DESCARGAR
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLUBS CTA — "¿Tenés un club?"
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={clubRef}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '108px 36px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <HairlineRule inView={clubInView} delay={0.1} />

          <div style={{
            marginTop: 65,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 43,
            alignItems: 'center',
          }}>
            {/* Left — Text & CTA */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div
                  style={{
                    width: clubInView ? 36 : 0,
                    height: 1,
                    backgroundColor: 'var(--color-graphite)',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                  }}
                />
                <MaskedText inView={clubInView} delay={0.2}>
                  <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    PARA OPERADORES Y DUEÑOS
                  </span>
                </MaskedText>
              </div>

              <h2 style={{ margin: '0 0 22px', padding: 0 }}>
                <div style={{ display: 'block' }}>
                  <MaskedText inView={clubInView} delay={0.3} duration={1.0}>
                    <span style={{ display: 'block', fontSize: 'clamp(42px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                      ¿TENÉS
                    </span>
                  </MaskedText>
                </div>
                <div style={{ display: 'block' }}>
                  <MaskedText inView={clubInView} delay={0.45} duration={1.0}>
                    <span style={{ display: 'block', fontSize: 'clamp(42px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                      UN CLUB?
                    </span>
                  </MaskedText>
                </div>
              </h2>

              <TrackingBlurReveal inView={clubInView} delay={0.6} style={{ fontSize: '20px', color: 'var(--color-frost)', lineHeight: 1.35, maxWidth: 540, margin: '0 0 14px', fontWeight: 700 }}>
                Hacé que tus canchas aparezcan en nuestra app de forma gratuita.
              </TrackingBlurReveal>

              <TrackingBlurReveal inView={clubInView} delay={0.7} style={{ fontSize: '15px', color: 'var(--color-ash)', lineHeight: 1.45, maxWidth: 540, margin: '0 0 36px' }}>
                Publicá la disponibilidad de tus canchas, recibí reservas desde la app en tiempo real y gestioná tarifas valle/pico y turnos fijos sin costo de mantenimiento.
              </TrackingBlurReveal>

              <div
                style={{
                  opacity: clubInView ? 1 : 0,
                  transform: clubInView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
                  transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s',
                }}
              >
                <a
                  href="/registro-club"
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: 'var(--color-frost)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '18px 43px',
                    fontSize: 18,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'transform 0.2s ease, filter 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.15)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'none'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
                >
                  Publicá tus Canchas →
                </a>
              </div>
            </div>

            {/* Right — 3D Dashboard Mockup */}
            <div
              style={{
                opacity: clubInView ? 1 : 0,
                transform: clubInView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 620,
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 25px 60px -15px rgba(252, 28, 70, 0.18)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 32px 75px -10px rgba(252, 28, 70, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 25px 60px -15px rgba(252, 28, 70, 0.18)';
                }}
              >
                <img
                  src="/club-mockup.png"
                  alt="Panel del Club — Hay Equipo?"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CONTACT / LOCATION — Converging Split City Text
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={cityRef}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '86px 36px 43px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <HairlineRule inView={cityInView} delay={0.1} />

          <div style={{ marginTop: 65 }}>
            <TrackingBlurReveal inView={cityInView} delay={0.2} style={{ fontSize: '10px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 9 }}>
              OPERANDO DESDE
            </TrackingBlurReveal>

            <h3 style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              margin: 0,
              overflow: 'hidden',
            }}>
              {/* BUENOS slides in from left */}
              <div
                style={{
                  transform: cityInView ? 'translate3d(0, 0, 0)' : 'translate3d(-60px, 60px, 0)',
                  opacity: cityInView ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 0.8s ease 0.3s',
                }}
              >
                <span style={{ fontSize: 'clamp(36px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                  BUENOS
                </span>
              </div>

              {/* AIRES slides in from right */}
              <div
                style={{
                  transform: cityInView ? 'translate3d(0, 0, 0)' : 'translate3d(60px, 60px, 0)',
                  opacity: cityInView ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s, opacity 0.8s ease 0.45s',
                }}
              >
                <span style={{ fontSize: 'clamp(36px, 8vw, 91px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.92, letterSpacing: '-1.82px', textTransform: 'uppercase' }}>
                  AIRES
                </span>
              </div>
            </h3>

            <div
              style={{
                fontSize: 18,
                fontWeight: 300,
                color: 'var(--color-graphite)',
                textTransform: 'uppercase',
                textAlign: 'right',
                marginTop: -8,
                opacity: cityInView ? 1 : 0,
                transform: cityInView ? 'translateY(0)' : 'translateY(15px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
              }}
            >
              / ARGENTINA
            </div>
          </div>
        </div>

        {/* Contact links grid */}
        <div style={{
          maxWidth: 1400,
          margin: '65px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 36,
          opacity: cityInView ? 1 : 0,
          transform: cityInView ? 'translateY(0)' : 'translateY(25px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
        }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-frost)', marginBottom: 14 }}>Contacto</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="mailto:hola@hayequipo.app" style={{ fontSize: 14, color: 'var(--color-ash)', textDecoration: 'none' }}>hola@hayequipo.app</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-frost)', marginBottom: 14 }}>Seguinos</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li><a href="#" style={{ fontSize: 14, color: 'var(--color-ash)', textDecoration: 'none' }}>Instagram</a></li>
              <li><a href="#" style={{ fontSize: 14, color: 'var(--color-ash)', textDecoration: 'none' }}>Twitter / X</a></li>
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--color-frost)', marginBottom: 14 }}>Clubes</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/" style={{ fontSize: 14, color: 'var(--color-ash)', textDecoration: 'none' }}>Panel de Gestión</a></li>
              <li style={{ marginTop: 4 }}><a href="#" style={{ fontSize: 14, color: 'var(--color-ash)', textDecoration: 'none' }}>Asociar mi club</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER — ThoughtLab minimal
          ═══════════════════════════════════════════════════════ */}
      <footer
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '43px 36px',
          borderTop: '1px solid var(--color-graphite)',
        }}
      >
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}>
          <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            © 2026 HAY EQUIPO. ALL RIGHTS RESERVED.
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            BUENOS AIRES, ARGENTINA
          </span>
        </div>
      </footer>

      {/* ── Global Styles ── */}
      <style jsx>{`
        a:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
