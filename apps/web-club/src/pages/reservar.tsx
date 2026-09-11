import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSlidingIndicator } from '../hooks/useSlidingIndicator';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getBookingByIdFirestore, BookingRecord, getClubsFirestore, getCourtsFirestore } from '../services/firebase';
import { ReservarNavTabs, NavTabType } from '../components/reservar/ReservarNavTabs';
import { MisReservasTab } from '../components/reservar/MisReservasTab';
import { ExplorarTab } from '../components/reservar/ExplorarTab';
import { TurnosFijosTab } from '../components/reservar/TurnosFijosTab';
import { PerfilTab } from '../components/reservar/PerfilTab';
import { ClubImageCarousel } from '../components/reservar/ClubImageCarousel';
import { SportBadge } from '../components/SportBadge';
import { useAuth } from '../context/AuthContext';

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
   Vector Icons (ThoughtLab Swiss Minimal)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
  Star: ({ size = 13, color = '#FACC15', fill = '#FACC15' }: { size?: number; color?: string; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Zap: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Users: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ShieldCheck: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  CheckCircle: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Search: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowUpRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  ChevronDown: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronLeft: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Close: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Padel: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="10" rx="7" ry="8" />
      <line x1="12" y1="18" x2="12" y2="23" strokeWidth="2.5" />
      <circle cx="10" cy="8" r="0.8" fill={color} />
      <circle cx="14" cy="8" r="0.8" fill={color} />
      <circle cx="12" cy="11" r="0.8" fill={color} />
    </svg>
  ),
  Football: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15 9.5 14 13.5 10 13.5 9 9.5" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="2.5" y1="9" x2="9" y2="9.5" />
      <line x1="21.5" y1="9" x2="15" y2="9.5" />
      <line x1="5.5" y1="19" x2="10" y2="13.5" />
      <line x1="18.5" y1="19" x2="14" y2="13.5" />
    </svg>
  ),
  WhatsApp: ({ size = 16, color = '#25D366' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  Copy: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Trophy: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  Lock: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Phone: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Calendar Date Utilities
   ──────────────────────────────────────────────────────────── */

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTH_SHORT_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const WEEKDAYS_ES = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];

const DAY_NAMES_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const DAY_NAMES_LONG_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isPastDay(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return target.getTime() < today.getTime();
}

function getFriendlyDateLabel(d: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(d, today)) {
    return `Hoy (${d.getDate()} ${MONTH_SHORT_ES[d.getMonth()]})`;
  }
  if (isSameDay(d, tomorrow)) {
    return `Mañana (${d.getDate()} ${MONTH_SHORT_ES[d.getMonth()]})`;
  }
  const dayName = DAY_NAMES_SHORT_ES[d.getDay()];
  return `${dayName}, ${d.getDate()} ${MONTH_SHORT_ES[d.getMonth()]}`;
}

function getFullDateLabel(d: Date): string {
  return `${DAY_NAMES_LONG_ES[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ────────────────────────────────────────────────────────────
   Argentine Real Clubs & Courts Data
   ──────────────────────────────────────────────────────────── */

interface WebSlot {
  id: string;
  courtId: string;
  courtName: string;
  sport: 'PADEL' | 'FUTBOL';
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  perPlayerPrice: number;
  available: boolean;
}

interface WebClub {
  id: string;
  name: string;
  address: string;
  city: string;
  zone: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  sports: ('PADEL' | 'FUTBOL')[];
  images: string[];
  minPricePerPlayer: number;
  minPrice?: number;
  latitude?: number;
  longitude?: number;
  bookingMode?: 'ONLINE' | 'DIRECT_CONTACT';
  whatsappPhone?: string;
  phone?: string;
  amenities: {
    covered: boolean;
    parking: boolean;
    buffet: boolean;
    lighting: boolean;
    lockers: boolean;
    syntheticWPT: boolean;
  };
  courts: {
    id: string;
    name: string;
    sport: 'PADEL' | 'FUTBOL';
    surface: string;
    capacity: number;
  }[];
  slots: WebSlot[];
}

function getClubSlotsForDate(club: WebClub, date: Date, sport: 'PADEL' | 'FUTBOL'): WebSlot[] {
  // Retorna únicamente turnos reales si el club los tiene publicados
  if (!club.slots || club.slots.length === 0) return [];
  const friendlyDate = getFriendlyDateLabel(date);
  return club.slots.filter(
    (s) => s.sport === sport && (!s.date || s.date === friendlyDate || s.date === 'Hoy') && s.available
  );
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
];

const CLUBS_DATA: WebClub[] = [
  {
    id: 'club-360-padel',
    name: '360 Padel Club',
    address: 'Solís 9565',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 142,
    sports: ['PADEL'],
    bookingMode: 'ONLINE',
    whatsappPhone: '5492236800369',
    phone: '(0223) 472-9295',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 6500,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: '360-c1', name: 'Cancha 1 — Cristal Panorámica WPT', sport: 'PADEL', surface: 'Vidrio Panorámico 12mm · Césped Texturado', capacity: 4 },
      { id: '360-c2', name: 'Cancha 2 — Cristal Pro Indoor', sport: 'PADEL', surface: 'Vidrio Templado 10mm · Iluminación LED Torneo', capacity: 4 },
      { id: '360-c3', name: 'Cancha 3 — Techada Climatizada', sport: 'PADEL', surface: 'Césped Sintético Azul WPT', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-world-padel-center',
    name: 'World Pádel Center',
    address: 'Acha 250 (esq. Brandsen)',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 1.8,
    rating: 4.9,
    reviewCount: 168,
    sports: ['PADEL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492236800369',
    phone: '(0223) 680-0369',
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 7000,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'wpc-c1', name: 'Pista Panorámica WPT Oficial', sport: 'PADEL', surface: 'Cristal Panorámico 12mm · Mondo Supercourt', capacity: 4 },
      { id: 'wpc-c2', name: 'Pista Indoor Climatizada 2', sport: 'PADEL', surface: 'Cristal Templado · LED Pro', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-los-naranjos',
    name: 'Los Naranjos Pádel',
    address: 'Dorrego 333',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 2.3,
    rating: 4.8,
    reviewCount: 195,
    sports: ['PADEL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492235470343',
    phone: '(0223) 472-9295',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 6000,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'ln-c1', name: 'Cancha Central Cristal', sport: 'PADEL', surface: 'Vidrio Panorámico 10mm', capacity: 4 },
      { id: 'ln-c2', name: 'Cancha 2 Techada', sport: 'PADEL', surface: 'Césped Sintético Texturado', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-alfar-club',
    name: 'Alfar Club Deportivo',
    address: 'Alvarado 3280',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 2.1,
    rating: 4.8,
    reviewCount: 98,
    sports: ['FUTBOL'],
    bookingMode: 'ONLINE',
    whatsappPhone: '5492235589812',
    phone: '(0223) 558-9812',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4000,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'alf-f5', name: 'Cancha F5 — Sintético Forbex 50mm', sport: 'FUTBOL', surface: 'Césped con Caucho Criogénico', capacity: 10 },
    ],
    slots: [],
  },
  {
    id: 'club-el-potrero',
    name: 'El Potrero Fútbol 5',
    address: 'Salta 2248',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 1.5,
    rating: 4.9,
    reviewCount: 220,
    sports: ['FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492234554400',
    phone: '(0223) 496-0303',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4500,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'pot-f5', name: 'Cancha F5 Techada Sintético', sport: 'FUTBOL', surface: 'Forbex 50mm Techado', capacity: 10 },
      { id: 'pot-p1', name: 'Cancha Pádel Cristal Pro', sport: 'PADEL', surface: 'Vidrio Templado 10mm', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-laverde-jara',
    name: 'La Verde Jara Fútbol & Pádel',
    address: 'Av. Jara 3450 (y Jara 470)',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 2.8,
    rating: 4.7,
    reviewCount: 165,
    sports: ['FUTBOL', 'PADEL'],
    bookingMode: 'ONLINE',
    whatsappPhone: '5492235340140',
    phone: '(0223) 476-3811',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 3800,
    amenities: {
      covered: false,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'lv-f7', name: 'Cancha Principal — Fútbol 7 Pro', sport: 'FUTBOL', surface: 'Césped Sintético Homologado AFA', capacity: 14 },
      { id: 'lv-f5', name: 'Cancha Techada — Fútbol 5', sport: 'FUTBOL', surface: 'Césped Sintético Bajo Techo', capacity: 10 },
      { id: 'lv-p1', name: 'Cancha 1 — Pádel Cristal', sport: 'PADEL', surface: 'Cristal Panorámico WPT', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-complejo-la-meca',
    name: 'Complejo La Meca',
    address: 'Juan B. Justo 5279 / Uruguay 4064',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 3.2,
    rating: 4.8,
    reviewCount: 130,
    sports: ['PADEL', 'FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492236802020',
    phone: '(0223) 476-2606',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4500,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'mec-p1', name: 'Pádel Cristal Indoor', sport: 'PADEL', surface: 'Vidrio Panorámico 10mm', capacity: 4 },
      { id: 'mec-f5', name: 'Cancha F5 Sintético Techada', sport: 'FUTBOL', surface: 'Sintético 45mm', capacity: 10 },
    ],
    slots: [],
  },
  {
    id: 'club-las-lomas',
    name: 'Complejo Deportivo Las Lomas',
    address: 'Gaboto 3875',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 3.8,
    rating: 4.7,
    reviewCount: 110,
    sports: ['FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492233125002',
    phone: '(0223) 489-3643',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 3800,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'lom-f5', name: 'Cancha F5 Techada Sintético', sport: 'FUTBOL', surface: 'Césped Sintético con Caucho', capacity: 10 },
      { id: 'lom-parq', name: 'Cancha Parquet Indoor', sport: 'FUTBOL', surface: 'Parquet Profesional', capacity: 10 },
    ],
    slots: [],
  },
  {
    id: 'club-futbol-5-mb',
    name: 'Fútbol 5 MB',
    address: 'Av. Luro 5102 (esq. 1º de Mayo)',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 2.0,
    rating: 4.8,
    reviewCount: 180,
    sports: ['FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492234739964',
    phone: '(0223) 473-9964',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4200,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'mb-c1', name: 'Cancha Techada 1 F5', sport: 'FUTBOL', surface: 'Sintético Forbex Techado', capacity: 10 },
      { id: 'mb-c2', name: 'Cancha Techada 2 F5', sport: 'FUTBOL', surface: 'Sintético Forbex Techado', capacity: 10 },
    ],
    slots: [],
  },
  {
    id: 'club-punto-sur',
    name: 'Complejo Punto Sur',
    address: 'Av. de los Trabajadores 1079',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 4.2,
    rating: 4.9,
    reviewCount: 240,
    sports: ['FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492234808600',
    phone: '(0223) 480-8600',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4500,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'ps-f7', name: 'Cancha Fútbol 7 Césped Sintético', sport: 'FUTBOL', surface: 'Sintético Pro', capacity: 14 },
    ],
    slots: [],
  },
  {
    id: 'club-san-carlos-padel',
    name: 'San Carlos Pádel',
    address: '9 de Julio 4179',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 1.6,
    rating: 4.7,
    reviewCount: 92,
    sports: ['PADEL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492234744669',
    phone: '(0223) 474-4669',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 5500,
    amenities: {
      covered: true,
      parking: false,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'sc-p1', name: 'Cancha 1 Cristal', sport: 'PADEL', surface: 'Cristal 10mm', capacity: 4 },
      { id: 'sc-p2', name: 'Cancha 2 Techada', sport: 'PADEL', surface: 'Césped Texturado', capacity: 4 },
    ],
    slots: [],
  },
  {
    id: 'club-parada-5',
    name: 'Complejo Parada 5',
    address: 'Av. Constitución 4205',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 3.5,
    rating: 4.8,
    reviewCount: 145,
    sports: ['FUTBOL'],
    bookingMode: 'DIRECT_CONTACT',
    whatsappPhone: '5492234792524',
    phone: '(0223) 479-2524',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4000,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'p5-c1', name: 'Cancha F5 Principal Sintético', sport: 'FUTBOL', surface: 'Forbex 50mm', capacity: 10 },
      { id: 'p5-c2', name: 'Cancha F5 Techada', sport: 'FUTBOL', surface: 'Sintético Bajo Techo', capacity: 10 },
    ],
    slots: [],
  },
  {
    id: 'club-arenas-sport',
    name: 'Arenas Fútbol Club',
    address: 'Av. Juan B. Justo 2200',
    city: 'Mar del Plata',
    zone: 'Mar del Plata',
    distanceKm: 3.4,
    rating: 4.8,
    reviewCount: 115,
    sports: ['FUTBOL'],
    bookingMode: 'ONLINE',
    whatsappPhone: '5492234801590',
    phone: '(0223) 480-1590',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 4200,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'as-p1', name: 'Cancha 1 Climatizada', sport: 'PADEL', surface: 'Vidrio Panorámico 12mm', capacity: 4 },
      { id: 'as-f8', name: 'Cancha Fútbol 8 Techada', sport: 'FUTBOL', surface: 'Sintético Forbex 50mm', capacity: 16 },
    ],
    slots: [],
  },
  {
    id: 'club-matchpoint-palermo',
    name: 'Match Point Club Palermo',
    address: 'Av. del Libertador 4400',
    city: 'Buenos Aires (CABA)',
    zone: 'CABA',
    distanceKm: 4.5,
    rating: 4.9,
    reviewCount: 210,
    sports: ['PADEL'],
    bookingMode: 'ONLINE',
    whatsappPhone: '5491144005500',
    phone: '(011) 4400-5500',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    ],
    minPricePerPlayer: 7500,
    amenities: {
      covered: true,
      parking: true,
      buffet: true,
      lighting: true,
      lockers: true,
      syntheticWPT: true,
    },
    courts: [
      { id: 'mp-c1', name: 'Pista Central Premier Padel', sport: 'PADEL', surface: 'Panorámica 12mm Vidrio Templado', capacity: 4 },
      { id: 'mp-c2', name: 'Pista 2 — Cristal Indoor', sport: 'PADEL', surface: 'Césped Texturado Mondo Supercourt', capacity: 4 },
    ],
    slots: [],
  },
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val);
}

/* ────────────────────────────────────────────────────────────
   Main Reservar Page Component
   ──────────────────────────────────────────────────────────── */

export default function ReservarPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSport, setActiveSport] = useState<'PADEL' | 'FUTBOL'>('PADEL');
  const {
    containerRef: sportContainerRef,
    setItemRef: setSportItemRef,
    indicatorStyle: sportIndicatorStyle,
  } = useSlidingIndicator(activeSport);

  // Search Bar state
  const [selectedZone, setSelectedZone] = useState<string>('TODAS');
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState<boolean>(false);
  const zoneDropdownRef = useRef<HTMLDivElement | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);
  const dateDropdownRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAmenityFilter, setActiveAmenityFilter] = useState<string>('ALL');
  const [activeSportTypeFilter, setActiveSportTypeFilter] = useState<'ALL' | 'PADEL_ONLY' | 'FUTBOL_ONLY' | 'BOTH'>('ALL');
  const [clubsList, setClubsList] = useState<WebClub[]>(CLUBS_DATA);

  // Load clubs & courts dynamically from Firestore database if available
  useEffect(() => {
    async function loadFirestoreData() {
      try {
        const [firestoreClubs, firestoreCourts] = await Promise.all([
          getClubsFirestore(),
          getCourtsFirestore(),
        ]);

        if (Array.isArray(firestoreClubs) && firestoreClubs.length > 0) {
          const mapped: WebClub[] = firestoreClubs.map((fc: any) => {
            // Find courts belonging to this club
            const clubCourts = (firestoreCourts || [])
              .filter((c: any) => c.clubId === fc.id)
              .map((c: any) => ({
                id: c.id,
                name: c.name,
                sport: c.sportType === 'PADEL' ? ('PADEL' as const) : ('FUTBOL' as const),
                surface: c.surface || 'Césped Sintético',
                capacity: c.sportType === 'PADEL' ? 4 : (c.name?.includes('7') ? 14 : 10),
              }));

            let sportsList: ('PADEL' | 'FUTBOL')[] = [];
            if (Array.isArray(fc.sports) && fc.sports.length > 0) {
              sportsList = fc.sports.filter((s: string) => s === 'PADEL' || s === 'FUTBOL');
            } else {
              const hasPadel = clubCourts.some((c: any) => c.sport === 'PADEL');
              const hasFutbol = clubCourts.some((c: any) => c.sport === 'FUTBOL');
              if (hasPadel) sportsList.push('PADEL');
              if (hasFutbol) sportsList.push('FUTBOL');
              if (sportsList.length === 0) sportsList.push('PADEL');
            }

            return {
              id: fc.id,
              name: fc.name,
              address: fc.address || '',
              city: fc.city || 'Mar del Plata',
              zone: fc.zone || fc.city || 'Mar del Plata',
              distanceKm: fc.distanceKm || 2.5,
              latitude: fc.latitude,
              longitude: fc.longitude,
              minPrice: fc.minPrice,
              rating: fc.rating || 4.8,
              reviewCount: fc.reviewCount || 100,
              sports: sportsList,
              bookingMode: fc.bookingMode || (fc.active ? 'ONLINE' : 'DIRECT_CONTACT'),
              whatsappPhone: String(fc.whatsappPhone || fc.whatsapp || fc.phone || '').replace(/[^0-9]/g, ''),
              phone: fc.phone || '',
              images: (fc.images && fc.images.length > 0) ? fc.images : [
                'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
              ],
              minPricePerPlayer: fc.minPrice ? Math.round(fc.minPrice / 4) : 4500,
              amenities: {
                covered: !!fc.amenities?.covered,
                parking: !!fc.amenities?.parking,
                buffet: !!fc.amenities?.buffet,
                lighting: !!fc.amenities?.lighting,
                lockers: !!fc.amenities?.lockers,
                syntheticWPT: !!fc.amenities?.syntheticWPT,
              },
              courts: clubCourts.length > 0 ? clubCourts : [
                { id: `${fc.id}-c1`, name: 'Cancha Principal', sport: sportsList[0], surface: 'Césped Sintético Pro', capacity: sportsList[0] === 'PADEL' ? 4 : 10 },
              ],
              slots: [],
            };
          });

          if (mapped.length > 0) {
            setClubsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Could not sync clubs from Firestore, falling back to local list:', err);
      }
    }
    loadFirestoreData();
  }, []);

  // Checkout Drawer state
  const [selectedSlot, setSelectedSlot] = useState<WebSlot | null>(null);
  const [selectedSlotClub, setSelectedSlotClub] = useState<WebClub | null>(null);
  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('SPLIT');
  const [splitPlayers, setSplitPlayers] = useState<number>(4);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(420);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    clubName: string;
    courtName: string;
    time: string;
    totalPaid: number;
    splitLink: string;
    mpInitPoint?: string;
  } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const router = useRouter();

  // Authentication & User State
  const { user, userProfile, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-sync buyer info from authenticated Firebase user
  useEffect(() => {
    if (user) {
      if (userProfile?.name || user.displayName) {
        setBuyerName((prev) => prev.trim() || userProfile?.name || user.displayName || '');
      }
      if (user.email) {
        setBuyerEmail((prev) => prev.trim() || user.email || '');
      }
      if (userProfile?.phone || user.phoneNumber) {
        setBuyerPhone((prev) => prev.trim() || userProfile?.phone || user.phoneNumber || '');
      }
    }
  }, [user, userProfile]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect returning from Mercado Pago with ?bookingId=HE-XXXXX
  useEffect(() => {
    if (!router.isReady) return;
    const { bookingId } = router.query;
    if (bookingId && typeof bookingId === 'string') {
      getBookingByIdFirestore(bookingId).then((b) => {
        if (b) {
          setConfirmedBooking({
            bookingCode: b.id,
            clubName: b.clubName,
            courtName: b.courtName,
            time: `${b.date} · ${b.startTime} hs`,
            totalPaid: b.totalPaid,
            splitLink: b.splitLink,
            mpInitPoint: b.mpInitPoint,
          });
          setSelectedSlot({
            id: b.courtId,
            courtId: b.courtId,
            courtName: b.courtName,
            sport: b.sport,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            price: b.totalPrice,
            perPlayerPrice: Math.round(b.totalPrice / b.splitPlayers),
            available: true,
          });
          setSelectedSlotClub({
            id: b.clubId,
            name: b.clubName,
            address: b.clubAddress || '',
            city: '',
            zone: 'CENTRO',
            distanceKm: 1.0,
            rating: 4.9,
            reviewCount: 50,
            sports: [b.sport],
            images: [],
            amenities: { covered: true, parking: true, buffet: true, lighting: true, lockers: true, syntheticWPT: true },
            courts: [],
            minPricePerPlayer: Math.round(b.totalPrice / b.splitPlayers),
            slots: [],
          });
        }
      });
    }
  }, [router.isReady, router.query]);

  // Navigation Tabs State (Mirroring Mobile App's 5 Floating Dock Tabs)
  const [activeNavTab, setActiveNavTab] = useState<NavTabType>('INICIO');
  const [storedBookingsCount, setStoredBookingsCount] = useState<number>(0);

  // Sync stored bookings count on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hay_equipo_user_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setStoredBookingsCount(parsed.length);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Sync tab from router query param (e.g. ?tab=reservas)
  useEffect(() => {
    if (!router.isReady) return;
    const tabParam = router.query.tab as string;
    if (tabParam) {
      const upper = tabParam.toUpperCase();
      if (upper === 'RESERVAS' || upper === 'BOOKINGS') setActiveNavTab('RESERVAS');
      else if (upper === 'EXPLORAR' || upper === 'SEARCH') setActiveNavTab('EXPLORAR');
      else if (upper === 'FIJOS' || upper === 'PAYMENTS') setActiveNavTab('FIJOS');
      else if (upper === 'PERFIL' || upper === 'PROFILE') setActiveNavTab('PERFIL');
      else if (upper === 'INICIO' || upper === 'HOME') setActiveNavTab('INICIO');
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (tab: NavTabType) => {
    setActiveNavTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Club Detail Modal
  const [clubModalData, setClubModalData] = useState<WebClub | null>(null);

  // InView hooks
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [searchRef, searchInView] = useInView({ threshold: 0.1 });
  const [todaySlotsRef, todaySlotsInView] = useInView({ threshold: 0.1 });
  const [clubsListRef, clubsListInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle clicking outside custom dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
        setIsZoneDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 7-minute countdown timer when slot is selected
  useEffect(() => {
    if (!selectedSlot) return;
    setHoldTimerSeconds(420);
    const interval = setInterval(() => {
      setHoldTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('El tiempo de reserva temporal de 7 minutos ha expirado.');
          setSelectedSlot(null);
          setSelectedSlotClub(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSlot]);

  // Format timer MM:SS
  const timerDisplay = useMemo(() => {
    const mins = Math.floor(holdTimerSeconds / 60);
    const secs = holdTimerSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [holdTimerSeconds]);

  // Zone metadata definitions for custom UI
  const ZONE_OPTIONS = [
    {
      value: 'TODAS',
      label: 'Todas las Zonas',
      sublabel: 'Todo el país · Canchas en Mar del Plata y CABA',
      badge: '14 COMPLEJOS',
    },
    {
      value: 'MDP',
      label: 'Mar del Plata (MDP)',
      sublabel: 'Alem, Centro, Alvarado, Jara, Güemes, Constitución, Juan B. Justo',
      badge: '13 COMPLEJOS',
    },
    {
      value: 'CABA',
      label: 'Buenos Aires (CABA)',
      sublabel: 'Palermo, Belgrano, Puerto Madero y alrededores',
      badge: '1 COMPLEJO',
    },
  ];

  const selectedZoneItem = ZONE_OPTIONS.find((z) => z.value === selectedZone) || ZONE_OPTIONS[0];

  // Filtered Clubs
  const filteredClubs = useMemo(() => {
    return clubsList.filter((c) => {
      // 1. Filtro del deporte activo del buscador
      if (!c.sports.includes(activeSport)) return false;

      // 2. Filtro específico de tipo de club (Solo Pádel, Solo Fútbol, Ambos)
      const hasPadel = c.sports.includes('PADEL');
      const hasFutbol = c.sports.includes('FUTBOL');
      if (activeSportTypeFilter === 'PADEL_ONLY' && (!hasPadel || hasFutbol)) return false;
      if (activeSportTypeFilter === 'FUTBOL_ONLY' && (!hasFutbol || hasPadel)) return false;
      if (activeSportTypeFilter === 'BOTH' && (!hasPadel || !hasFutbol)) return false;

      if (selectedZone !== 'TODAS') {
        if (selectedZone === 'MDP' && !c.city.toLowerCase().includes('mar del plata')) return false;
        if (selectedZone === 'CABA' && !c.city.toLowerCase().includes('buenos aires')) return false;
      }

      if (searchQuery.trim().length > 0) {
        const clean = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const q = clean(searchQuery);

        // Si el usuario busca explícitamente "padel" o "futbol" por texto en el buscador:
        if (q.includes('padel') && !c.sports.includes('PADEL')) return false;
        if (q.includes('futbol') && !c.sports.includes('FUTBOL')) return false;

        const matchName = clean(c.name).includes(q);
        const matchAddress = clean(c.address).includes(q);
        const matchCity = clean(c.city).includes(q);
        const matchSportKeyword = (q.includes('padel') && c.sports.includes('PADEL')) || (q.includes('futbol') && c.sports.includes('FUTBOL'));

        if (!matchName && !matchAddress && !matchCity && !matchSportKeyword) return false;
      }

      if (activeAmenityFilter === 'COVERED' && !c.amenities.covered) return false;
      if (activeAmenityFilter === 'PARKING' && !c.amenities.parking) return false;
      if (activeAmenityFilter === 'BUFFET' && !c.amenities.buffet) return false;

      return true;
    });
  }, [clubsList, activeSport, activeSportTypeFilter, selectedZone, searchQuery, activeAmenityFilter]);

  // Instant Available Slots for Selected Date and Sport
  const instantSlots = useMemo(() => {
    const list: { slot: WebSlot; club: WebClub }[] = [];
    filteredClubs.forEach((club) => {
      const dateSlots = getClubSlotsForDate(club, selectedDate, activeSport);
      dateSlots.forEach((slot) => {
        list.push({ slot, club });
      });
    });
    return list;
  }, [filteredClubs, activeSport, selectedDate]);

  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchTurnos = () => {
    setIsDateDropdownOpen(false);
    setIsZoneDropdownOpen(false);
    setHasSearched(true);

    const el = document.getElementById('complejos-disponibles');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenBooking = (slot: WebSlot, club: WebClub) => {
    setSelectedSlot({
      ...slot,
      date: getFriendlyDateLabel(selectedDate),
    });
    setSelectedSlotClub(club);
    setSplitPlayers(slot.sport === 'FUTBOL' ? (slot.courtName.includes('7') ? 14 : 10) : 4);
    setConfirmedBooking(null);
  };

  const handleExecutePayment = async () => {
    if (!selectedSlot || !selectedSlotClub) return;
    setBookingError(null);

    // ── AUTH GATE: Require login before booking ──
    if (!user) {
      openAuthModal(
        `Para confirmar tu reserva en ${selectedSlotClub.name}, por favor iniciá sesión o creá tu cuenta. Así tu turno quedará guardado para siempre.`,
        () => {
          // Success callback after login
        }
      );
      return;
    }

    if (!buyerName.trim()) {
      setBookingError('Por favor ingresá tu nombre y apellido para la reserva.');
      return;
    }
    if (!buyerPhone.trim()) {
      setBookingError('Por favor ingresá tu número de WhatsApp para enviarte la confirmación.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club: {
            id: selectedSlotClub.id,
            name: selectedSlotClub.name,
            address: `${selectedSlotClub.address} · ${selectedSlotClub.city}`,
          },
          slot: selectedSlot,
          buyer: {
            name: buyerName.trim(),
            email: buyerEmail.trim() || user.email || '',
            phone: buyerPhone.trim(),
          },
          userId: user.uid,
          paymentType,
          splitPlayers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No se pudo registrar la reserva.');
      }

      setConfirmedBooking({
        bookingCode: data.booking.id,
        clubName: data.booking.clubName,
        courtName: data.booking.courtName,
        time: `${data.booking.date} · ${data.booking.startTime} hs`,
        totalPaid: data.booking.totalPaid,
        splitLink: data.booking.splitLink,
        mpInitPoint: data.checkout?.initPoint,
      });

      // Automatically store in localStorage for "Mis Reservas"
      try {
        const newBookingRecord: BookingRecord = {
          id: data.booking.id,
          userId: user.uid,
          clubId: selectedSlotClub.id,
          clubName: data.booking.clubName,
          clubAddress: `${selectedSlotClub.address} · ${selectedSlotClub.city}`,
          courtId: selectedSlot.courtId,
          courtName: data.booking.courtName,
          sport: selectedSlot.sport,
          date: data.booking.date,
          startTime: data.booking.startTime,
          endTime: data.booking.endTime,
          totalPrice: selectedSlot.price,
          serviceFee: 0,
          totalPaid: data.booking.totalPaid,
          paymentType: paymentType,
          splitPlayers: splitPlayers,
          paidPlayersCount: 1,
          status: 'CONFIRMED',
          buyer: {
            name: buyerName.trim(),
            email: buyerEmail.trim(),
            phone: buyerPhone.trim(),
          },
          participants: data.booking.participants || [],
          splitToken: data.booking.splitToken || data.booking.id.toLowerCase(),
          splitLink: data.booking.splitLink || `https://hay-equipo-admin.vercel.app/split/${data.booking.id.toLowerCase()}`,
          mpPreferenceId: data.checkout?.preferenceId,
          mpInitPoint: data.checkout?.initPoint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const currentList = JSON.parse(localStorage.getItem('hay_equipo_user_bookings') || '[]');
        const updatedList = [newBookingRecord, ...currentList.filter((b: any) => b.id !== newBookingRecord.id)];
        localStorage.setItem('hay_equipo_user_bookings', JSON.stringify(updatedList));
        setStoredBookingsCount(updatedList.length);
      } catch (errLocal) {
        console.error('Error saving to localStorage:', errLocal);
      }
    } catch (err: any) {
      console.error('Error procesando reserva:', err);
      setBookingError(err.message || 'Error al conectar con la pasarela de reservas.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = () => {
    if (!confirmedBooking) return;
    navigator.clipboard.writeText(confirmedBooking.splitLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: 'var(--color-void)' }}>
      <Head>
        <title>HAY EQUIPO? — Reservar Cancha en Vivo</title>
        <meta
          name="description"
          content="Buscador en tiempo real de canchas de Pádel y Fútbol en Argentina. Turnos garantizados, bloqueo de 7 minutos y pago dividido con Mercado Pago."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          HEADER — ThoughtLab Swiss Minimal
          ═══════════════════════════════════════════════════════ */}
      <header
        className="landing-header"
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
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(76, 76, 76, 0.35)',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 22, textDecoration: 'none' }}>
          <span className="landing-header-logo" style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span className="landing-header-logo-sub" style={{ fontSize: 10, color: 'var(--color-graphite)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            / Red Deportiva · Argentina
          </span>
        </a>

        {/* ── App Navigation Tabs (Desktop Header / Mobile Floating Dock) ── */}
        <ReservarNavTabs
          activeTab={activeNavTab}
          onChangeTab={handleTabChange}
          bookingCount={storedBookingsCount}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="/#descargar"
            className="landing-header-btn-outline"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--color-frost)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-full)',
              padding: '9px 18px',
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Descargar App</span>
          </a>

          {/* ── Auth State in Header ── */}
          {!user ? (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="landing-header-btn-cta"
              style={{
                backgroundColor: 'var(--color-crimson-signal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '9px 20px',
                fontSize: 12.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Icons.Lock size={12} color="#ffffff" />
              <span>Ingresar</span>
            </button>
          ) : (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 14px 4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  color: 'var(--color-frost)',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-crimson-signal)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {(userProfile?.name || user.displayName || user.email || 'J').substring(0, 1).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2px' }}>
                  {(userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Jugador').split(' ')[0]}
                </span>
                <Icons.ChevronDown size={11} color="var(--color-ash)" />
              </button>

              {isUserMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 220,
                    backgroundColor: '#0c0c0c',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(252, 28, 70, 0.1)',
                    padding: '8px 0',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userProfile?.name || user.displayName || 'Jugador'}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--color-ash)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email || user.phoneNumber || ''}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleTabChange('RESERVAS');
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      textAlign: 'left',
                      color: 'var(--color-frost)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icons.Calendar size={13} color="var(--color-crimson-signal)" />
                    <span>Mis Reservas</span>
                  </button>

                  <button
                    onClick={() => {
                      handleTabChange('PERFIL');
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      textAlign: 'left',
                      color: 'var(--color-frost)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icons.Users size={13} color="var(--color-crimson-signal)" />
                    <span>Mi Perfil Deportivo</span>
                  </button>

                  <div style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      textAlign: 'left',
                      color: '#f87171',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          PESTAÑAS DE NAVEGACIÓN DE LA APP (EXPLORAR / RESERVAS / FIJOS / PERFIL)
          ═══════════════════════════════════════════════════════ */}
      {activeNavTab === 'EXPLORAR' && (
        <ExplorarTab
          clubs={clubsList}
          onSelectClub={(club) => setClubModalData(club)}
          onNavigateHome={() => handleTabChange('INICIO')}
        />
      )}

      {activeNavTab === 'RESERVAS' && (
        <MisReservasTab onNavigateSearch={() => handleTabChange('INICIO')} />
      )}

      {activeNavTab === 'FIJOS' && (
        <TurnosFijosTab
          onNavigateHome={() => handleTabChange('INICIO')}
          clubs={clubsList}
        />
      )}

      {activeNavTab === 'PERFIL' && (
        <PerfilTab
          onNavigateReservas={() => handleTabChange('RESERVAS')}
          buyerName={buyerName}
          buyerPhone={buyerPhone}
          buyerEmail={buyerEmail}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          PESTAÑA PRINCIPAL: INICIO (HERO, BUSCADOR & COMPLEJOS DISPONIBLES)
          ═══════════════════════════════════════════════════════ */}
      {activeNavTab === 'INICIO' && (
        <>
          <section
            ref={heroRef}
            style={{
              position: 'relative',
          paddingTop: 120,
          paddingBottom: 24,
          paddingLeft: 36,
          paddingRight: 36,
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Eyebrow */}
          <TrackingBlurReveal inView={isLoaded} delay={0.1} style={{ fontSize: '10px', color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20, fontWeight: 700 }}>
            01 / DISPONIBILIDAD EN TIEMPO REAL
          </TrackingBlurReveal>

          {/* Staggered Giant Headline + Sport Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 36 }}>
            <h1 style={{ margin: 0, padding: 0 }}>
              <div style={{ display: 'block' }}>
                <MaskedText inView={isLoaded} delay={0.2} duration={1.0}>
                  <span style={{ display: 'block', fontSize: 'clamp(38px, 6.5vw, 88px)', fontWeight: 700, color: 'var(--color-frost)', lineHeight: 0.95, letterSpacing: '-2px', textTransform: 'uppercase' }}>
                    Reservá tu
                  </span>
                </MaskedText>
              </div>
              <div style={{ display: 'block' }}>
                <MaskedText inView={isLoaded} delay={0.35} duration={1.0}>
                  <span style={{ display: 'block', fontSize: 'clamp(38px, 6.5vw, 88px)', fontWeight: 700, color: 'var(--color-crimson-signal)', lineHeight: 0.95, letterSpacing: '-2px', textTransform: 'uppercase' }}>
                    Cancha.
                  </span>
                </MaskedText>
              </div>
            </h1>

            {/* Sport Toggle Switch (Sliding Pill Switch — hay-equipo-system) */}
            <div
              ref={sportContainerRef as any}
              style={{
                position: 'relative',
                display: 'inline-flex',
                padding: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Sliding Red Pill Indicator */}
              <div style={sportIndicatorStyle} />

              <button
                ref={setSportItemRef('PADEL')}
                onClick={() => setActiveSport('PADEL')}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'transparent',
                  color: activeSport === 'PADEL' ? 'var(--color-frost)' : 'var(--color-ash)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '11px 30px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'color 0.2s ease',
                }}
              >
                <Icons.Padel size={15} color={activeSport === 'PADEL' ? '#ffffff' : 'var(--color-ash)'} />
                <span>Pádel</span>
              </button>

              <button
                ref={setSportItemRef('FUTBOL')}
                onClick={() => setActiveSport('FUTBOL')}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: 'transparent',
                  color: activeSport === 'FUTBOL' ? 'var(--color-frost)' : 'var(--color-ash)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '11px 30px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'color 0.2s ease',
                }}
              >
                <Icons.Football size={15} color={activeSport === 'FUTBOL' ? '#ffffff' : 'var(--color-ash)'} />
                <span>Fútbol</span>
              </button>
            </div>
          </div>

          <HairlineRule inView={isLoaded} delay={0.4} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BUSCADOR ESTRUCTURADO MULTI-SEGMENTO
          (Con Dropdowns Custom Brutalistas Sin Select Nativo de OS)
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={searchRef}
        style={{
          position: 'relative',
          padding: '10px 36px 36px',
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
              alignItems: 'center',
              backgroundColor: '#0a0a0a',
              border: '1px solid var(--color-graphite)',
              padding: '8px',
              gap: '6px',
              position: 'relative',
            }}
          >
            {/* ── Segmento 1: Ciudad / Zona (Custom Popover) ── */}
            <div
              ref={zoneDropdownRef}
              style={{
                padding: '10px 18px',
                borderRight: '1px solid rgba(76, 76, 76, 0.4)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onClick={() => {
                setIsZoneDropdownOpen(!isZoneDropdownOpen);
                setIsDateDropdownOpen(false);
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 700 }}>
                ¿Dónde querés jugar?
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-frost)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {selectedZoneItem.label}
                  </span>
                </div>
                <div
                  style={{
                    transform: isZoneDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    color: isZoneDropdownOpen ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                  }}
                >
                  <Icons.ChevronDown size={13} />
                </div>
              </div>

              {/* Custom Brutalist Popover Panel para Zonas */}
              {isZoneDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    left: 0,
                    width: 'max(320px, 100%)',
                    maxWidth: 380,
                    backgroundColor: '#0c0c0c',
                    border: '1px solid var(--color-graphite)',
                    borderTop: '2px solid var(--color-crimson-signal)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.98), 0 0 35px rgba(252, 28, 70, 0.18)',
                    zIndex: 100,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    backdropFilter: 'blur(20px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '6px 10px 8px', fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, borderBottom: '1px solid rgba(76, 76, 76, 0.3)' }}>
                    SELECCIONÁ TU ZONA O CIUDAD
                  </div>

                  {ZONE_OPTIONS.map((opt) => {
                    const isSelected = selectedZone === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedZone(opt.value);
                          setIsZoneDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '12px 14px',
                          backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.12)' : '#111111',
                          border: '1px solid ' + (isSelected ? 'rgba(252, 28, 70, 0.4)' : 'rgba(255, 255, 255, 0.04)'),
                          borderLeft: isSelected ? '3px solid var(--color-crimson-signal)' : '3px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111111';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.04)';
                          }
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Icons.MapPin size={12} color={isSelected ? 'var(--color-crimson-signal)' : 'var(--color-ash)'} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--color-frost)' : '#f0f0f0' }}>
                              {opt.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-ash)', lineHeight: 1.3, paddingLeft: 18 }}>
                            {opt.sublabel}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isSelected ? 'var(--color-crimson-signal)' : '#181818',
                              color: isSelected ? '#ffffff' : 'var(--color-graphite)',
                              border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.1)'),
                            }}
                          >
                            {opt.badge}
                          </span>
                          {isSelected && (
                            <span style={{ color: 'var(--color-crimson-signal)', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icons.Check size={12} color="var(--color-crimson-signal)" />
                              <span>Activo</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Segmento 2: Deporte Activo ── */}
            <div
              style={{
                padding: '10px 18px',
                borderRight: '1px solid rgba(76, 76, 76, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSport(activeSport === 'PADEL' ? 'FUTBOL' : 'PADEL')}
            >
              <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 700 }}>
                Deporte activo (Clic para cambiar)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeSport === 'PADEL' ? (
                  <Icons.Padel size={13} color="var(--color-crimson-signal)" />
                ) : (
                  <Icons.Football size={13} color="var(--color-crimson-signal)" />
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-frost)' }}>
                  {activeSport === 'PADEL' ? 'Pádel (Cristal & WPT)' : 'Fútbol (F5 / F7 / F8)'}
                </span>
              </div>
            </div>

            {/* ── Segmento 3: Fecha (Custom Calendar Popover) ── */}
            <div
              ref={dateDropdownRef}
              style={{
                padding: '10px 18px',
                borderRight: '1px solid rgba(76, 76, 76, 0.4)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onClick={() => {
                setIsDateDropdownOpen(!isDateDropdownOpen);
                setIsZoneDropdownOpen(false);
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 700 }}>
                Fecha
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Calendar size={13} color="var(--color-crimson-signal)" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-frost)' }}>
                    {getFriendlyDateLabel(selectedDate)}
                  </span>
                </div>
                <div
                  style={{
                    transform: isDateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    color: isDateDropdownOpen ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                  }}
                >
                  <Icons.ChevronDown size={13} />
                </div>
              </div>

              {/* Custom Brutalist Popover Calendar para Fechas */}
              {isDateDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    left: 0,
                    width: 340,
                    maxWidth: 'calc(100vw - 40px)',
                    backgroundColor: '#0c0c0c',
                    border: '1px solid var(--color-graphite)',
                    borderTop: '2px solid var(--color-crimson-signal)',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.98), 0 0 35px rgba(252, 28, 70, 0.18)',
                    zIndex: 100,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(24px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Subtitle & Month Navigation */}
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)' }} />
                      SELECCIONÁ DÍA DE JUEGO
                    </div>

                    {/* Month & Year Navigation Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 10px', borderRadius: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
                          const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                          if (prev >= currentMonthStart) {
                            setCalendarMonth(prev);
                          }
                        }}
                        disabled={
                          calendarMonth.getFullYear() === new Date().getFullYear() &&
                          calendarMonth.getMonth() === new Date().getMonth()
                        }
                        style={{
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 'var(--radius-full)',
                          color: (calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth()) ? '#3a3a3a' : 'var(--color-frost)',
                          cursor: (calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth()) ? 'not-allowed' : 'pointer',
                        }}
                        title="Mes anterior"
                      >
                        <Icons.ChevronLeft size={12} />
                      </button>

                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {MONTH_NAMES_ES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
                        }}
                        style={{
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--color-frost)',
                          cursor: 'pointer',
                        }}
                        title="Mes siguiente"
                      >
                        <Icons.ChevronRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Pills (Custom SVG Icons - No Emojis) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {[
                      {
                        label: 'Hoy',
                        icon: (color: string) => <Icons.Zap size={11} color={color} />,
                        getDate: () => new Date(),
                      },
                      {
                        label: 'Mañana',
                        icon: (color: string) => <Icons.Calendar size={11} color={color} />,
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d;
                        },
                      },
                      {
                        label: 'Fin de Sem.',
                        icon: (color: string) => <Icons.Trophy size={11} color={color} />,
                        getDate: () => {
                          const d = new Date();
                          const day = d.getDay(); // 0=Sun, 6=Sat
                          const diff = day === 6 ? 0 : (6 - day);
                          d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
                          return d;
                        },
                      },
                    ].map((preset, idx) => {
                      const pDate = preset.getDate();
                      const isActive = isSameDay(selectedDate, pDate);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDate(pDate);
                            setCalendarMonth(new Date(pDate.getFullYear(), pDate.getMonth(), 1));
                            setIsDateDropdownOpen(false);
                          }}
                          style={{
                            padding: '7px 6px',
                            fontSize: 10.5,
                            fontWeight: 700,
                            backgroundColor: isActive ? 'var(--color-crimson-signal)' : '#141414',
                            border: isActive ? '1px solid var(--color-crimson-signal)' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isActive ? '#ffffff' : 'var(--color-ash)',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {preset.icon(isActive ? '#ffffff' : 'var(--color-crimson-signal)')}
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Grid Container */}
                  <div style={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 8px', borderRadius: 0 }}>
                    {/* Weekdays Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8, textAlign: 'center' }}>
                      {WEEKDAYS_ES.map((wd) => (
                        <div key={wd} style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '0.5px' }}>
                          {wd}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                      {/* Empty slots before first day */}
                      {Array.from({
                        length: (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7,
                      }).map((_, idx) => (
                        <div key={`empty-${idx}`} style={{ height: 32 }} />
                      ))}

                      {/* Month Days */}
                      {Array.from({
                        length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate(),
                      }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
                        const isPast = isPastDay(cellDate);
                        const isToday = isSameDay(cellDate, new Date());
                        const isSelected = isSameDay(cellDate, selectedDate);

                        return (
                          <button
                            key={dayNum}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              if (!isPast) {
                                setSelectedDate(cellDate);
                                setIsDateDropdownOpen(false);
                              }
                            }}
                            style={{
                              height: 32,
                              width: 32,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: isSelected || isToday ? 700 : 500,
                              backgroundColor: isSelected
                                ? 'var(--color-crimson-signal)'
                                : isToday
                                ? 'rgba(252, 28, 70, 0.12)'
                                : 'transparent',
                              border: isSelected
                                ? '1px solid var(--color-crimson-signal)'
                                : isToday
                                ? '1px solid var(--color-crimson-signal)'
                                : '1px solid transparent',
                              borderRadius: 'var(--radius-full)',
                              color: isPast
                                ? '#3a3a3a'
                                : isSelected
                                ? '#ffffff'
                                : isToday
                                ? 'var(--color-crimson-signal)'
                                : 'var(--color-frost)',
                              cursor: isPast ? 'not-allowed' : 'pointer',
                              position: 'relative',
                              transition: 'all 0.12s ease',
                              boxShadow: isSelected ? '0 0 14px rgba(252, 28, 70, 0.5)' : 'none',
                              padding: 0,
                            }}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar Footer with Selected Date and Confirm */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(76, 76, 76, 0.3)',
                      paddingTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: 9, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
                        FECHA ELEGIDA
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-frost)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {getFullDateLabel(selectedDate)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDateDropdownOpen(false)}
                      style={{
                        backgroundColor: 'var(--color-crimson-signal)',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 10px rgba(252, 28, 70, 0.3)',
                      }}
                    >
                      Listo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Segmento 4: Filtro Nombre Club ── */}
            <div style={{ padding: '10px 18px' }}>
              <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 700 }}>
                Buscar club específico
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Search size={13} color="var(--color-ash)" />
                <input
                  type="text"
                  placeholder="Ej: 360, Alfar, La Verde..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-frost)',
                    border: 'none',
                    fontSize: 13,
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* ── Botón Buscar ── */}
            <div style={{ padding: '4px' }}>
              <button
                onClick={handleSearchTurnos}
                style={{
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: 'var(--color-frost)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '14px 28px',
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                <span>Buscar Turnos</span>
                <Icons.ArrowUpRight size={14} color="#ffffff" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BANNER: ASEGURÁ TU CANCHA FIJA (CON ASSET 3D DINÁMICO)
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 36px 44px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div
            style={{
              position: 'relative',
              backgroundColor: '#080808',
              border: '1px solid var(--color-graphite)',
              padding: '36px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 28,
              overflow: 'hidden',
              boxShadow: '0 0 35px rgba(252, 28, 70, 0.08)',
            }}
          >
            {/* Radial glow halo */}
            <div
              style={{
                position: 'absolute',
                top: '-40%',
                right: '10%',
                width: 450,
                height: 450,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(252, 28, 70, 0.18) 0%, rgba(8, 8, 8, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    backgroundColor: 'rgba(252, 28, 70, 0.12)',
                    border: '1px solid rgba(252, 28, 70, 0.4)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--color-crimson-signal)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  <Icons.Zap size={11} color="var(--color-crimson-signal)" />
                  <span>TURNO FIJO SEMANAL</span>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#161616',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--color-frost)',
                    letterSpacing: '0.5px',
                  }}
                >
                  -15% OFF
                </div>
              </div>

              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-1px', margin: '0 0 12px', textTransform: 'uppercase' }}>
                Asegurá tu Cancha Fija
              </h2>

              <p style={{ fontSize: 15, color: 'var(--color-ash)', lineHeight: 1.45, margin: '0 0 24px', maxWidth: 520 }}>
                {activeSport === 'PADEL'
                  ? 'Mismo día y horario cada semana con cobro y split automatizado entre los 4 jugadores. Sin transferencias manuales ni cancelaciones a último minuto.'
                  : 'Fútbol semanal para tu equipo con link de pago único para el grupo de WhatsApp. Si alguien no paga, el sistema avisa automáticamente.'}
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('FIJOS')}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: 'var(--color-frost)',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.35)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                  <span>Asegurar Turno Fijo</span>
                  <Icons.ArrowUpRight size={14} color="#ffffff" />
                </button>
                <span style={{ fontSize: 12, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sin permanencia mínima
                </span>
              </div>
            </div>

            {/* Dynamic 3D Cutout Image */}
            <div style={{ position: 'relative', zIndex: 1, paddingRight: 20 }}>
              <img
                src={activeSport === 'PADEL' ? '/padel_rackets_cutout.png' : '/soccer_ball_cutout.png'}
                alt={activeSport}
                style={{
                  width: 'clamp(180px, 22vw, 260px)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8))',
                  transform: 'rotate(-4deg)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION: COMPLEJOS CON CANCHAS LIBRES
          ═══════════════════════════════════════════════════════ */}
      <section
        id="complejos-disponibles"
        ref={clubsListRef}
        style={{
          position: 'relative',
          padding: '0 36px 120px',
          zIndex: 2,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {hasSearched && (
            <div
              style={{
                marginBottom: 28,
                padding: '16px 24px',
                backgroundColor: 'rgba(252, 28, 70, 0.08)',
                border: '1px solid rgba(252, 28, 70, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(252, 28, 70, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Calendar size={15} color="var(--color-crimson-signal)" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    DISPONIBILIDAD CONFIRMADA
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-frost)', fontWeight: 600 }}>
                    {getFullDateLabel(selectedDate)} · {activeSport === 'PADEL' ? 'Pádel' : 'Fútbol'} ({selectedZoneItem.label})
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#121212',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    color: 'var(--color-frost)',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {filteredClubs.length} {filteredClubs.length === 1 ? 'complejo encontrado' : 'complejos encontrados'}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6, fontWeight: 700 }}>
                DIRECTORIO DE CANCHAS · MAR DEL PLATA
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-1px', margin: 0, textTransform: 'uppercase' }}>
                Complejos Deportivos
              </h2>
            </div>

            {/* Filtros de Disciplina & Amenidades */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              {/* Filtro Tipo de Complejo: Todos, Solo Pádel, Solo Fútbol, Ambos */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'Todos los Complejos' },
                  { id: 'PADEL_ONLY', label: 'Solo Pádel', sport: 'PADEL' },
                  { id: 'FUTBOL_ONLY', label: 'Solo Fútbol', sport: 'FUTBOL' },
                  { id: 'BOTH', label: 'Pádel & Fútbol (Ambos)' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveSportTypeFilter(st.id as any)}
                    style={{
                      backgroundColor: activeSportTypeFilter === st.id ? 'rgba(252, 28, 70, 0.15)' : '#0c0c0c',
                      color: activeSportTypeFilter === st.id ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                      border: `1px solid ${activeSportTypeFilter === st.id ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                      padding: '5px 12px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Amenity Filter Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'Todos los servicios' },
                  { id: 'COVERED', label: 'Techada' },
                  { id: 'PARKING', label: 'Estacionamiento' },
                  { id: 'BUFFET', label: 'Buffet / Bar' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveAmenityFilter(chip.id)}
                    style={{
                      backgroundColor: activeAmenityFilter === chip.id ? '#ffffff' : '#0c0c0c',
                      color: activeAmenityFilter === chip.id ? '#000000' : 'var(--color-ash)',
                      border: '1px solid ' + (activeAmenityFilter === chip.id ? '#ffffff' : 'var(--color-graphite)'),
                      padding: '5px 12px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-full)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Listado de Tarjetas de Clubes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredClubs.map((club) => {
              const availableSlots = getClubSlotsForDate(club, selectedDate, activeSport).filter((s) => s.available);
              return (
                <div
                  key={club.id}
                  style={{
                    backgroundColor: '#070707',
                    border: '1px solid var(--color-graphite)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(260px, 320px) 1fr',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                    transition: 'border-color 0.25s ease',
                  }}
                  className="club-card-container"
                >
                  {/* Carrusel de Imágenes del Club (Logo Oficial N°1 + Fotos Reales al scrollear) */}
                  <ClubImageCarousel
                    images={club.images}
                    clubName={club.name}
                    height="100%"
                    style={{ minHeight: 220, height: '100%' }}
                    onCardClick={() => setClubModalData(club)}
                    topLeftBadge={
                      <SportBadge sports={club.sports} size="sm" />
                    }
                    topRightBadge={
                      <div
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--color-frost)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Icons.Star size={11} />
                        <span>{club.rating}</span>
                        <span style={{ color: 'var(--color-ash)', fontSize: 10 }}>({club.reviewCount})</span>
                      </div>
                    }
                    bottomLeftBadge={
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--color-ash)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(6px)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {club.courts.length} {club.courts.length === 1 ? 'cancha' : 'canchas'}
                      </div>
                    }
                  />

                  {/* Contenido del Club */}
                  <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100%', gap: 16 }}>
                    <div>
                      {/* Encabezado Club */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 25px)', fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.6px', margin: '0 0 6px', textTransform: 'uppercase' }}>
                            {club.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ash)', fontSize: 13, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                              <span>{club.address} · {club.city}</span>
                            </span>
                            <span style={{ color: 'var(--color-graphite)' }}>·</span>
                            <span style={{ color: 'var(--color-frost)', fontWeight: 600 }}>a {club.distanceKm} km</span>
                            {club.phone && (
                              <>
                                <span style={{ color: 'var(--color-graphite)' }}>·</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-ash)', fontSize: 12 }}>
                                  <Icons.Phone size={11} color="var(--color-ash)" />
                                  <span>{club.phone}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setClubModalData(club)}
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--color-frost)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '7px 14px',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            borderRadius: 'var(--radius-full)',
                            transition: 'border-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.5)')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                        >
                          <span>Ver Fotos & Canchas</span>
                          <Icons.ArrowUpRight size={12} />
                        </button>
                      </div>

                      {/* Amenities Badges (Pills) */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: availableSlots.length > 0 ? 14 : 0 }}>
                        {club.amenities.covered && (
                          <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                            Techada / Indoor
                          </div>
                        )}
                        {club.amenities.parking && (
                          <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                            Parking Custodiado
                          </div>
                        )}
                        {club.amenities.buffet && (
                          <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                            Buffet & Bar
                          </div>
                        )}
                        {club.amenities.lighting && (
                          <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                            Iluminación LED Pro
                          </div>
                        )}
                      </div>

                      {/* Turnos disponibles directo en la tarjeta si existen slots online */}
                      {availableSlots.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>
                            {isSameDay(selectedDate, new Date())
                              ? 'HORARIOS DISPONIBLES HOY (HACÉ CLIC PARA RESERVAR):'
                              : `HORARIOS DISPONIBLES · ${getFullDateLabel(selectedDate).toUpperCase()} (HACÉ CLIC PARA RESERVAR):`}
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => handleOpenBooking(slot, club)}
                                style={{
                                  backgroundColor: '#111111',
                                  border: '1px solid var(--color-graphite)',
                                  borderRadius: 'var(--radius-full)',
                                  color: 'var(--color-frost)',
                                  padding: '6px 14px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2,
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-crimson-signal)';
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(252, 28, 70, 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-graphite)';
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111111';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                                  <Icons.Clock size={11} color="var(--color-crimson-signal)" />
                                  <span>{slot.startTime} hs</span>
                                </div>
                                <div style={{ fontSize: 9.5, color: 'var(--color-ash)', fontWeight: 500 }}>
                                  {formatCurrency(slot.perPlayerPrice)} / pers
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer de Tarjeta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(76, 76, 76, 0.25)', paddingTop: 14, marginTop: 'auto', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        {club.phone ? (
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                              Teléfono Directo
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-frost)' }}>
                              {club.phone}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                              Ubicación
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>
                              {club.address}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setClubModalData(club)}
                          style={{
                            backgroundColor: '#161616',
                            color: 'var(--color-frost)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            borderRadius: 'var(--radius-full)',
                            padding: '10px 16px',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.4)';
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#202020';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.18)';
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#161616';
                          }}
                        >
                          <span>Ficha & Canchas</span>
                          <Icons.ArrowUpRight size={12} />
                        </button>

                        {club.whatsappPhone && (
                          <a
                            href={`https://wa.me/${club.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola! Los vi en Hay Equipo y quería consultar disponibilidad de turnos para jugar ${
                                activeSport === 'PADEL' ? 'pádel' : 'fútbol'
                              } en ${club.name}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: '#25D366',
                              color: '#000000',
                              border: 'none',
                              borderRadius: 'var(--radius-full)',
                              padding: '10px 18px',
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              textDecoration: 'none',
                              boxShadow: '0 2px 10px rgba(37, 211, 102, 0.25)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = '1';
                            }}
                          >
                            <Icons.WhatsApp size={14} color="#000000" />
                            <span>Consultar WhatsApp</span>
                          </a>
                        )}

                        {availableSlots.length > 0 && (
                          <button
                            onClick={() => {
                              const firstSlot = availableSlots[0];
                              if (firstSlot) handleOpenBooking(firstSlot, club);
                            }}
                            style={{
                              backgroundColor: 'var(--color-crimson-signal)',
                              color: 'var(--color-frost)',
                              border: 'none',
                              padding: '10px 24px',
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              cursor: 'pointer',
                              borderRadius: 'var(--radius-full)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span>Elegir Horario</span>
                            <Icons.ArrowUpRight size={13} color="#ffffff" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CHECKOUT DE RESERVA EN VIVO (MERCADO PAGO + SPLIT)
          ═══════════════════════════════════════════════════════ */}
      {selectedSlot && selectedSlotClub && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
          onClick={() => {
            if (!isProcessing) {
              setSelectedSlot(null);
              setSelectedSlotClub(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#0c0c0c',
              border: '1px solid var(--color-graphite)',
              width: '100%',
              maxWidth: 580,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 40px rgba(252, 28, 70, 0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#090909',
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                  CONFIRMACIÓN Y CHECKOUT
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  Reservá tu Turno
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setSelectedSlotClub(null);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-ash)',
                  cursor: 'pointer',
                  padding: 6,
                }}
              >
                <Icons.Close size={18} />
              </button>
            </div>

            {/* Holding Countdown Bar (7 minutos) */}
            <div
              style={{
                padding: '10px 24px',
                backgroundColor: 'rgba(252, 28, 70, 0.12)',
                borderBottom: '1px solid rgba(252, 28, 70, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    animation: 'pulse 1.2s infinite',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-frost)', fontWeight: 600 }}>
                  Turno bloqueado temporalmente:
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-crimson-signal)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                {timerDisplay}
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {confirmedBooking ? (
                /* ── Booking Success Screen ── */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(252, 28, 70, 0.15)',
                      border: '2px solid var(--color-crimson-signal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <Icons.CheckCircle size={28} color="var(--color-crimson-signal)" />
                  </div>

                  <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    ¡Turno Reservado con Éxito!
                  </h3>
                  <p style={{ color: 'var(--color-ash)', fontSize: 14, margin: '0 0 24px' }}>
                    Código de reserva: <strong style={{ color: 'var(--color-crimson-signal)' }}>{confirmedBooking.bookingCode}</strong>
                  </p>

                  <div style={{ backgroundColor: '#111', border: '1px solid var(--color-graphite)', padding: '16px', textAlign: 'left', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', marginBottom: 4 }}>Detalle del Partido</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-frost)', marginBottom: 2 }}>{confirmedBooking.clubName}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-ash)', marginBottom: 6 }}>{confirmedBooking.courtName}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-crimson-signal)', fontWeight: 600, marginBottom: 8 }}>{confirmedBooking.time}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-ash)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 8 }}>
                      <Icons.Check size={13} color="var(--color-crimson-signal)" />
                      <span>Registrado en tiempo real en la nube</span>
                    </div>
                  </div>

                  {confirmedBooking.mpInitPoint && (
                    <div style={{ marginBottom: 20 }}>
                      <a
                        href={confirmedBooking.mpInitPoint}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          backgroundColor: '#009EE3',
                          color: '#fff',
                          borderRadius: 'var(--radius-full)',
                          padding: '13px 24px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: 13,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          boxShadow: '0 0 20px rgba(0, 158, 227, 0.35)',
                        }}
                      >
                        <Icons.Lock size={14} color="#fff" />
                        <span>Completar Pago en Mercado Pago</span>
                        <Icons.ArrowUpRight size={14} color="#fff" />
                      </a>
                      <div style={{ fontSize: 10.5, color: 'var(--color-graphite)', marginTop: 6 }}>
                        Aboná con tarjeta de débito, crédito o dinero en cuenta
                      </div>
                    </div>
                  )}

                  {paymentType === 'SPLIT' && (
                    <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '18px', marginBottom: 24, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icons.WhatsApp size={18} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Link de Pago para tu Equipo</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-ash)', margin: '0 0 14px', lineHeight: 1.4 }}>
                        Compartí este link en el grupo de WhatsApp. Cada jugador paga su parte directamente por Mercado Pago sin que tengas que poner plata de más.
                      </p>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          readOnly
                          value={confirmedBooking.splitLink}
                          style={{
                            backgroundColor: '#000',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: 12,
                            width: '100%',
                          }}
                        />
                        <button
                          onClick={handleCopyLink}
                          style={{
                            backgroundColor: copiedLink ? '#25D366' : '#222',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            padding: '8px 18px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Icons.Copy size={13} />
                          <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent('¡Muchachos! Ya reservé la cancha en ' + confirmedBooking.clubName + ' (' + confirmedBooking.time + '). Entren acá para pagar su parte con Mercado Pago: ' + confirmedBooking.splitLink)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          backgroundColor: '#25D366',
                          color: '#000',
                          borderRadius: 'var(--radius-full)',
                          padding: '13px 20px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: 13,
                          marginTop: 14,
                          textTransform: 'uppercase',
                        }}
                      >
                        <Icons.WhatsApp size={16} color="#000" />
                        <span>Enviar por WhatsApp al equipo</span>
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button
                      onClick={() => {
                        setSelectedSlot(null);
                        setSelectedSlotClub(null);
                        handleTabChange('RESERVAS');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--color-crimson-signal)',
                        color: '#fff',
                        border: 'none',
                        padding: '11px 18px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      Ver en Mis Reservas
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSlot(null);
                        setSelectedSlotClub(null);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-ash)',
                        border: '1px solid var(--color-graphite)',
                        padding: '11px 18px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Checkout Form ── */
                <div>
                  <div
                    style={{
                      backgroundColor: '#101010',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '16px',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)' }}>
                          {selectedSlot.courtName}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-ash)' }}>
                          {selectedSlotClub.name} · {selectedSlotClub.address}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'var(--color-crimson-signal)',
                          color: '#fff',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                        }}
                      >
                        {selectedSlot.sport}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-frost)', fontSize: 13, fontWeight: 600 }}>
                      <Icons.Clock size={13} color="var(--color-crimson-signal)" />
                      <span>{selectedSlot.date} · {selectedSlot.startTime} a {selectedSlot.endTime} hs</span>
                    </div>
                  </div>

                  {/* Modalidad de Pago: Full vs Split */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>
                      Modalidad de Pago
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        onClick={() => setPaymentType('SPLIT')}
                        style={{
                          backgroundColor: paymentType === 'SPLIT' ? 'rgba(252, 28, 70, 0.15)' : '#101010',
                          border: '1px solid ' + (paymentType === 'SPLIT' ? 'var(--color-crimson-signal)' : 'var(--color-graphite)'),
                          padding: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                          <Icons.Users size={14} color={paymentType === 'SPLIT' ? 'var(--color-crimson-signal)' : '#fff'} />
                          <span>Dividir Pago (Split)</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                          Pagás tu cuota ahora y compartís el link al resto.
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentType('FULL')}
                        style={{
                          backgroundColor: paymentType === 'FULL' ? 'rgba(252, 28, 70, 0.15)' : '#101010',
                          border: '1px solid ' + (paymentType === 'FULL' ? 'var(--color-crimson-signal)' : 'var(--color-graphite)'),
                          padding: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                          <Icons.ShieldCheck size={14} color={paymentType === 'FULL' ? 'var(--color-crimson-signal)' : '#fff'} />
                          <span>Pago Total (100%)</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                          Abonás el turno completo ({formatCurrency(selectedSlot.price)}).
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Cantidad de Jugadores para Split */}
                  {paymentType === 'SPLIT' && (
                    <div style={{ marginBottom: 20, padding: '14px', backgroundColor: '#101010', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--color-frost)', fontWeight: 600 }}>Cantidad de jugadores para dividir:</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[4, 10, 14].map((num) => (
                            <button
                              key={num}
                              onClick={() => setSplitPlayers(num)}
                              style={{
                                backgroundColor: splitPlayers === num ? 'var(--color-crimson-signal)' : '#1a1a1a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                padding: '5px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ash)' }}>
                        Cuota por persona: <strong style={{ color: 'var(--color-frost)' }}>{formatCurrency(Math.round(selectedSlot.price / splitPlayers))}</strong>
                      </div>
                    </div>
                  )}

                  {/* Estado de Autenticación del Pagador */}
                  {user ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '12px 16px',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 10px #10b981',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)' }}>
                            Reservando como: {userProfile?.name || user.displayName || user.email}
                          </div>
                          <div style={{ fontSize: 11, color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Turno vinculado permanentemente a tu cuenta</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAuthModal()}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-ash)',
                          fontSize: 11,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: 'rgba(252, 28, 70, 0.08)',
                        border: '1px solid rgba(252, 28, 70, 0.35)',
                        padding: '14px 16px',
                        marginBottom: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-crimson-signal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span>Identificate para reservar</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                          Accedé con Google, Email o Teléfono para asegurar este turno y rastrearlo cuando quieras.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openAuthModal(
                            `Para reservar en ${selectedSlotClub.name}, por favor ingresá con tu cuenta.`
                          )
                        }
                        style={{
                          backgroundColor: 'var(--color-crimson-signal)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-buttons)',
                          padding: '8px 16px',
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 0 12px rgba(252, 28, 70, 0.4)',
                        }}
                      >
                        Ingresar
                      </button>
                    </div>
                  )}

                  {/* Formulario del Pagador */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Nombre y Apellido
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Emiliano Moter"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#101010',
                          border: '1px solid var(--color-graphite)',
                          color: '#fff',
                          padding: '10px 14px',
                          fontSize: 13,
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          WhatsApp (Para confirmación)
                        </label>
                        <input
                          type="tel"
                          placeholder="+54 9 223 555-0100"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#101010',
                            border: '1px solid var(--color-graphite)',
                            color: '#fff',
                            padding: '10px 14px',
                            fontSize: 13,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#101010',
                            border: '1px solid var(--color-graphite)',
                            color: '#fff',
                            padding: '10px 14px',
                            fontSize: 13,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desglose de Precios */}
                  <div style={{ borderTop: '1px solid rgba(76, 76, 76, 0.4)', paddingTop: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)', fontSize: 13, marginBottom: 6 }}>
                      <span>{paymentType === 'FULL' ? 'Subtotal Cancha (100%)' : `Tu cuota (1 de ${splitPlayers})`}</span>
                      <span>
                        {paymentType === 'FULL'
                          ? formatCurrency(selectedSlot.price)
                          : formatCurrency(Math.round(selectedSlot.price / splitPlayers))}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)', fontSize: 13, marginBottom: 10 }}>
                      <span>Tarifa de servicio de reserva</span>
                      <span>{formatCurrency(paymentType === 'FULL' ? 1500 : 500)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-frost)', fontSize: 18, fontWeight: 700, borderTop: '1px dashed rgba(76, 76, 76, 0.4)', paddingTop: 10 }}>
                      <span>Total a abonar hoy</span>
                      <span style={{ color: 'var(--color-crimson-signal)' }}>
                        {paymentType === 'FULL'
                          ? formatCurrency(selectedSlot.price + 1500)
                          : formatCurrency(Math.round(selectedSlot.price / splitPlayers) + 500)}
                      </span>
                    </div>
                  </div>

                  {bookingError && (
                    <div
                      style={{
                        marginBottom: 16,
                        padding: '12px 16px',
                        backgroundColor: 'rgba(252, 28, 70, 0.15)',
                        border: '1px solid var(--color-crimson-signal)',
                        color: 'var(--color-frost)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <Icons.Close size={14} color="var(--color-crimson-signal)" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Botón Mercado Pago */}
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-crimson-signal)',
                      color: 'var(--color-frost)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '16px 28px',
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      cursor: isProcessing ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: isProcessing ? 0.7 : 1,
                      boxShadow: '0 0 25px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    {isProcessing ? (
                      <span>Procesando pago con Mercado Pago...</span>
                    ) : (
                      <>
                        <Icons.ShieldCheck size={16} color="#ffffff" />
                        <span>Pagar con Mercado Pago</span>
                        <Icons.ArrowUpRight size={14} color="#ffffff" />
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--color-graphite)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icons.Lock size={12} color="var(--color-graphite)" />
                    <span>Pago 100% Protegido con Mercado Pago Oficial · SSL 256-bit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: DETALLE DEL CLUB & FOTOS
          ═══════════════════════════════════════════════════════ */}
      {clubModalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 90,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
          onClick={() => setClubModalData(null)}
        >
          <div
            style={{
              backgroundColor: '#0c0c0c',
              border: '1px solid var(--color-graphite)',
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <ClubImageCarousel
                images={clubModalData.images}
                clubName={clubModalData.name}
                height={280}
              />
              <button
                onClick={() => setClubModalData(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 25,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-crimson-signal)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.75)')}
                aria-label="Cerrar ficha"
              >
                <Icons.Close size={16} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ marginBottom: 6 }}>
                    <SportBadge sports={clubModalData.sports} size="md" />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', margin: '0 0 4px' }}>
                    {clubModalData.name}
                  </h3>
                  <div style={{ color: 'var(--color-ash)', fontSize: 13 }}>
                    {clubModalData.address} · {clubModalData.city}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FACC15', fontWeight: 700, fontSize: 14 }}>
                  <Icons.Star size={14} />
                  <span>{clubModalData.rating}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 12 }}>
                Canchas e Instalaciones
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {clubModalData.courts.map((court) => (
                  <div
                    key={court.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#111',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{court.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-ash)' }}>{court.surface}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Capacidad: {court.capacity} personas
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {clubModalData.amenities.covered && (
                  <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                    Techada / Indoor
                  </div>
                )}
                {clubModalData.amenities.parking && (
                  <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                    Parking Custodiado
                  </div>
                )}
                {clubModalData.amenities.buffet && (
                  <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                    Buffet & Bar
                  </div>
                )}
                {clubModalData.amenities.lighting && (
                  <div style={{ padding: '4px 10px', backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--color-ash)' }}>
                    Iluminación LED Pro
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {clubModalData.whatsappPhone && (
                  <a
                    href={`https://wa.me/${clubModalData.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hola! Los vi en Hay Equipo y quería consultar disponibilidad de canchas de ${
                        activeSport === 'PADEL' ? 'pádel' : 'fútbol'
                      } en ${clubModalData.name}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: '#25D366',
                      color: '#000',
                      borderRadius: 'var(--radius-full)',
                      padding: '13px 24px',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    <Icons.WhatsApp size={16} color="#000" />
                    <span>Contactar por WhatsApp Oficial</span>
                  </a>
                )}

                {clubModalData.phone && (
                  <a
                    href={`tel:${clubModalData.phone.replace(/[^0-9]/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: '#161616',
                      color: '#fff',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-full)',
                      padding: '12px 24px',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <Icons.Phone size={14} color="var(--color-crimson-signal)" />
                    <span>Llamar al Club ({clubModalData.phone})</span>
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clubModalData.name + ' ' + clubModalData.address + ' ' + clubModalData.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#161616',
                    color: '#fff',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <Icons.MapPin size={14} color="var(--color-crimson-signal)" />
                  <span>Abrir ubicación en Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          FOOTER — ThoughtLab Swiss Minimal
          ═══════════════════════════════════════════════════════ */}
      <footer
        className="landing-footer"
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          padding: '40px 36px',
          borderTop: '1px solid var(--color-graphite)',
        }}
      >
        <div
          className="landing-footer-inner"
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            © 2026 HAY EQUIPO. ALL RIGHTS RESERVED.
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            BUENOS AIRES, ARGENTINA
          </span>
        </div>
      </footer>

      {/* Mobile Responsive adjustments */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .club-card-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
