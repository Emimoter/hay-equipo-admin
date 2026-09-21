import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSlidingIndicator } from '../hooks/useSlidingIndicator';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  getBookingByIdFirestore,
  BookingRecord,
  getClubsFirestore,
  getCourtsFirestore,
  getAllActiveSlotsFirestore,
  subscribeToAllActiveSlotsFirestore,
  PublishedSlotRecord,
  saveUserFixedSlotFirestore,
  FixedSlotSubscriptionFirestore,
  RecurringOccurrenceFirestore,
} from '../services/firebase';
import { ReservarNavTabs, NavTabType } from '../components/reservar/ReservarNavTabs';
import { MisReservasTab } from '../components/reservar/MisReservasTab';
import { ExplorarTab } from '../components/reservar/ExplorarTab';
import { PerfilTab } from '../components/reservar/PerfilTab';
import { ClubImageCarousel } from '../components/reservar/ClubImageCarousel';
import { SportBadge } from '../components/SportBadge';
import { useAuth } from '../context/AuthContext';
import { useUserLocation, calculateHaversineKm } from '../context/LocationContext';

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
  Repeat: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

export interface WebSlot {
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
  isFixedSlot?: boolean;
}

export interface WebClub {
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

export function getClubSlotsForDate(club: WebClub, date: Date, sport?: 'PADEL' | 'FUTBOL'): WebSlot[] {
  // Retorna únicamente turnos reales si el club los tiene publicados
  if (!club.slots || club.slots.length === 0) return [];
  const friendlyDate = getFriendlyDateLabel(date);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateIso = `${y}-${m}-${d}`;
  const isToday = isSameDay(date, new Date());

  return club.slots.filter((s) => {
    const isStatusActive = !(s as any).status || String((s as any).status).toUpperCase() === 'ACTIVE' || s.available !== false;
    if (!isStatusActive) return false;

    if (sport) {
      const rawSport = (s.sport || (s as any).sportType || '').toString().toUpperCase();
      const sSport = rawSport.includes('PADEL') ? 'PADEL' : 'FUTBOL';
      if (sSport !== sport) return false;
    }

    if (!s.date) return true;
    const sDate = String(s.date).trim();
    if (sDate === dateIso || sDate.startsWith(dateIso) || sDate === friendlyDate) return true;
    if (isToday && (sDate.toLowerCase() === 'hoy' || sDate <= dateIso)) return true;

    // Robust date parsing comparison
    const parsed = new Date(sDate);
    if (!isNaN(parsed.getTime())) {
      if (
        parsed.getFullYear() === date.getFullYear() &&
        parsed.getMonth() === date.getMonth() &&
        parsed.getDate() === date.getDate()
      ) {
        return true;
      }
    }
    return false;
  });
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
];

export const CLUBS_DATA: WebClub[] = [
  {
    id: 'club-360-padel',
    latitude: -37.9992,
    longitude: -57.5988,
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
    latitude: -38.0413,
    longitude: -57.546,
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
    latitude: -37.9826,
    longitude: -57.5507,
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
    latitude: -38.0065,
    longitude: -57.5622,
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
    latitude: -37.9985,
    longitude: -57.552,
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
    latitude: -38.004,
    longitude: -57.575,
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
    latitude: -38.026,
    longitude: -57.579,
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
    latitude: -38.0377,
    longitude: -57.5497,
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
    latitude: -37.991,
    longitude: -57.57,
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
    latitude: -38.0515,
    longitude: -57.5461,
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
    latitude: -37.9888,
    longitude: -57.5607,
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
    latitude: -37.9693,
    longitude: -57.5456,
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
    latitude: -38.029,
    longitude: -57.555,
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
    latitude: -34.5711,
    longitude: -58.4233,
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
  const { userLocation, isLocating, permissionStatus, requestLocation } = useUserLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSport, setActiveSport] = useState<'PADEL' | 'FUTBOL'>('PADEL');
  const {
    containerRef: sportContainerRef,
    setItemRef: setSportItemRef,
    indicatorStyle: sportIndicatorStyle,
  } = useSlidingIndicator(activeSport);

  // Search Bar state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);
  const dateDropdownRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAmenityFilter, setActiveAmenityFilter] = useState<string>('ALL');
  const [activeSportTypeFilter, setActiveSportTypeFilter] = useState<'ALL' | 'PADEL_ONLY' | 'FUTBOL_ONLY' | 'BOTH'>('ALL');
  const [onlyFixedSlots, setOnlyFixedSlots] = useState<boolean>(false);
  const [clubsList, setClubsList] = useState<WebClub[]>(CLUBS_DATA);

  // Load clubs & courts dynamically from Firestore database if available
  useEffect(() => {
    let unsubscribeSlots: (() => void) | null = null;

    async function loadFirestoreData() {
      try {
        const [firestoreClubs, firestoreCourts, firestoreSlots] = await Promise.all([
          getClubsFirestore(),
          getCourtsFirestore(),
          getAllActiveSlotsFirestore(),
        ]);

        if (Array.isArray(firestoreClubs) && firestoreClubs.length > 0) {
          const mapped: WebClub[] = firestoreClubs.map((fc: any) => {
            // Find courts belonging to this club
            const clubCourts = (firestoreCourts || [])
              .filter((c: any) => String(c.clubId || '').trim() === String(fc.id || '').trim())
              .map((c: any) => ({
                id: c.id,
                name: c.name,
                sport: String(c.sportType || '').toUpperCase().includes('PADEL') ? ('PADEL' as const) : ('FUTBOL' as const),
                surface: c.surface || 'Césped Sintético',
                capacity: String(c.sportType || '').toUpperCase().includes('PADEL') ? 4 : (c.name?.includes('7') ? 14 : 10),
              }));

            // Map published active slots belonging to this club
            const clubSlots: WebSlot[] = (firestoreSlots || [])
              .filter((s: PublishedSlotRecord) => {
                const sameClub = String(s.clubId || '').trim() === String(fc.id || '').trim();
                const isActive = !s.status || String(s.status).toUpperCase() === 'ACTIVE' || (s as any).available !== false;
                return sameClub && isActive;
              })
              .map((s: PublishedSlotRecord) => {
                const isPadel = ((s.sportType || (s as any).sport || '').toUpperCase().includes('PADEL'));
                const capacity = isPadel ? 4 : (s.courtName?.includes('7') ? 14 : 10);
                return {
                  id: s.id,
                  courtId: s.courtId,
                  courtName: s.courtName || 'Cancha',
                  sport: isPadel ? ('PADEL' as const) : ('FUTBOL' as const),
                  date: s.date,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  price: s.price,
                  perPlayerPrice: Math.round(s.price / capacity),
                  available: !s.status || String(s.status).toUpperCase() === 'ACTIVE' || (s as any).available !== false,
                  isFixedSlot: Boolean(s.isFixedSlot),
                };
              });

            let sportsList: ('PADEL' | 'FUTBOL')[] = [];
            if (Array.isArray(fc.sports) && fc.sports.length > 0) {
              fc.sports.forEach((s: string) => {
                const norm = String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (norm.includes('PADEL') && !sportsList.includes('PADEL')) sportsList.push('PADEL');
                if (norm.includes('FUTBOL') && !sportsList.includes('FUTBOL')) sportsList.push('FUTBOL');
              });
            } else {
              const hasPadel = clubCourts.some((c: any) => c.sport === 'PADEL');
              const hasFutbol = clubCourts.some((c: any) => c.sport === 'FUTBOL');
              if (hasPadel) sportsList.push('PADEL');
              if (hasFutbol) sportsList.push('FUTBOL');
            }

            // Ensure any sports from published slots are included
            clubSlots.forEach((slot) => {
              if (!sportsList.includes(slot.sport)) {
                sportsList.push(slot.sport);
              }
            });

            if (sportsList.length === 0) sportsList.push('PADEL');

            // Dynamic min prices based on actual slots or court rates
            const slotPrices = clubSlots.map((s) => s.price);
            const effectiveMinPrice =
              slotPrices.length > 0 ? Math.min(...slotPrices) : (fc.minPrice || 24000);
            const slotPerPlayerPrices = clubSlots.map((s) => s.perPlayerPrice);
            const effectiveMinPerPlayer =
              slotPerPlayerPrices.length > 0
                ? Math.min(...slotPerPlayerPrices)
                : Math.round(effectiveMinPrice / 4);

            return {
              id: fc.id,
              name: fc.name || 'Club Deportivo',
              address: fc.address || 'Mar del Plata',
              city: fc.city || 'Mar del Plata',
              zone: fc.zone || fc.city || 'Mar del Plata',
              distanceKm: fc.distanceKm ?? 2.1,
              rating: fc.rating ?? 4.8,
              reviewCount: fc.reviewCount ?? 12,
              sports: sportsList,
              bookingMode: fc.bookingMode || 'ONLINE',
              whatsappPhone: fc.whatsappPhone || fc.phone || '',
              phone: fc.phone || '',
              images: Array.isArray(fc.images) && fc.images.length > 0 ? fc.images : [
                'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
              ],
              minPricePerPlayer: effectiveMinPerPlayer,
              amenities: fc.amenities || {
                covered: true,
                parking: true,
                buffet: true,
                lighting: true,
                lockers: true,
                syntheticWPT: true,
              },
              courts: clubCourts,
              slots: clubSlots,
            };
          });

          // Merge: if Firestore club matches an ID in CLUBS_DATA, replace it; otherwise prepend it
          setClubsList((prev) => {
            const firestoreIds = new Set(mapped.map((c) => c.id));
            const remainingLocal = prev.filter((c) => !firestoreIds.has(c.id));
            return [...mapped, ...remainingLocal];
          });
        }
      } catch (err) {
        console.warn('Could not sync clubs from Firestore, falling back to local list:', err);
      }
    }

    loadFirestoreData();

    // Subscribe to live slots updates in real-time
    try {
      unsubscribeSlots = subscribeToAllActiveSlotsFirestore((latestActiveSlots) => {
        setClubsList((prevClubs) => {
          return prevClubs.map((club) => {
            const clubSlots: WebSlot[] = latestActiveSlots
              .filter((s) => {
                const sameClub = String(s.clubId || '').trim() === String(club.id || '').trim();
                const isActive = !s.status || String(s.status).toUpperCase() === 'ACTIVE' || (s as any).available !== false;
                return sameClub && isActive;
              })
              .map((s) => {
                const isPadel = ((s.sportType || (s as any).sport || '').toUpperCase().includes('PADEL'));
                const capacity = isPadel ? 4 : (s.courtName?.includes('7') ? 14 : 10);
                return {
                  id: s.id,
                  courtId: s.courtId,
                  courtName: s.courtName || 'Cancha',
                  sport: isPadel ? ('PADEL' as const) : ('FUTBOL' as const),
                  date: s.date,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  price: s.price,
                  perPlayerPrice: Math.round(s.price / capacity),
                  available: !s.status || String(s.status).toUpperCase() === 'ACTIVE' || (s as any).available !== false,
                  isFixedSlot: Boolean(s.isFixedSlot),
                };
              });
            return {
              ...club,
              slots: clubSlots,
            };
          });
        });
      });
    } catch (e) {}

    window.addEventListener('focus', loadFirestoreData);
    return () => {
      if (unsubscribeSlots) unsubscribeSlots();
      window.removeEventListener('focus', loadFirestoreData);
    };
  }, []);

  const router = useRouter();

  // Authentication & User State
  const { user, userProfile, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);


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
      setActiveNavTab('RESERVAS');
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
      else if (upper === 'FIJOS' || upper === 'PAYMENTS') setActiveNavTab('RESERVAS');
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
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered & Proximity-Sorted Clubs (Mar del Plata focus)
  const filteredClubs = useMemo(() => {
    const filtered = clubsList.filter((c) => {
      // 1. Filtro del deporte activo del buscador
      if (!c.sports.includes(activeSport)) return false;

      // 2. Filtro específico de tipo de club (Solo Pádel, Solo Fútbol, Ambos)
      const hasPadel = c.sports.includes('PADEL');
      const hasFutbol = c.sports.includes('FUTBOL');
      if (activeSportTypeFilter === 'PADEL_ONLY' && (!hasPadel || hasFutbol)) return false;
      if (activeSportTypeFilter === 'FUTBOL_ONLY' && (!hasFutbol || hasPadel)) return false;
      if (activeSportTypeFilter === 'BOTH' && (!hasPadel || !hasFutbol)) return false;

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

      // 3. Filtro específico de Turnos Fijos Semanales
      if (onlyFixedSlots) {
        const hasFixed = c.slots?.some((s) => Boolean(s.isFixedSlot) && s.available);
        if (!hasFixed) return false;
      }

      return true;
    });

    // Calcular distancias reales en base a la ubicación GPS del usuario (o referencia MDP si no otorgó permiso)
    const withUpdatedDistances = filtered.map((c) => {
      if (userLocation && typeof c.latitude === 'number' && typeof c.longitude === 'number') {
        const realDist = calculateHaversineKm(userLocation.lat, userLocation.lng, c.latitude, c.longitude);
        return { ...c, distanceKm: realDist };
      }
      return c;
    });

    // Ordenar estrictamente por cercanía en km (de menor a mayor)
    return withUpdatedDistances.sort((a, b) => {
      const distA = typeof a.distanceKm === 'number' ? a.distanceKm : 999;
      const distB = typeof b.distanceKm === 'number' ? b.distanceKm : 999;
      return distA - distB;
    });
  }, [clubsList, userLocation, activeSport, activeSportTypeFilter, searchQuery, activeAmenityFilter, onlyFixedSlots]);

  // Instant Available Slots for Selected Date and Sport
  const instantSlots = useMemo(() => {
    const list: { slot: WebSlot; club: WebClub }[] = [];
    filteredClubs.forEach((club) => {
      const dateSlots = getClubSlotsForDate(club, selectedDate, activeSport);
      dateSlots.forEach((slot) => {
        if (onlyFixedSlots && !slot.isFixedSlot) return;
        list.push({ slot, club });
      });
    });
    return list;
  }, [filteredClubs, activeSport, selectedDate, onlyFixedSlots]);

  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchTurnos = () => {
    setIsDateDropdownOpen(false);
    setHasSearched(true);

    const el = document.getElementById('complejos-disponibles');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenBooking = (slot: WebSlot, club: WebClub) => {
    const dateLabel = getFriendlyDateLabel(selectedDate);
    router.push(
      `/checkout?clubId=${club.id}&slotId=${slot.id}&date=${encodeURIComponent(dateLabel)}&time=${encodeURIComponent(slot.startTime)}&price=${slot.price}&court=${encodeURIComponent(slot.courtName)}&sport=${slot.sport}&isFixed=${Boolean(slot.isFixedSlot)}&clubName=${encodeURIComponent(club.name)}`
    );
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
            <span>App Mobile</span>
            <span
              style={{
                fontSize: 9,
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(252, 28, 70, 0.15)',
                color: 'var(--color-crimson-signal)',
                fontWeight: 700,
                letterSpacing: '0.4px',
              }}
            >
              PRONTO
            </span>
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
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
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
          onSelectClub={(club) => {
            router.push(`/clubes/${club.id}`);
          }}
          onNavigateHome={() => handleTabChange('INICIO')}
        />
      )}

      {activeNavTab === 'RESERVAS' && (
        <MisReservasTab onNavigateSearch={() => handleTabChange('INICIO')} />
      )}

      {activeNavTab === 'PERFIL' && (
        <PerfilTab
          onNavigateReservas={() => handleTabChange('RESERVAS')}
          buyerName={userProfile?.name || user?.displayName || ''}
          buyerPhone={userProfile?.phone || ''}
          buyerEmail={user?.email || ''}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          PESTAÑA PRINCIPAL: INICIO (HERO, BUSCADOR & COMPLEJOS DISPONIBLES)
          ═══════════════════════════════════════════════════════ */}
      {activeNavTab === 'INICIO' && (
        <>
          {/* ── HERO SECTION: RESERVÁ TU CANCHA ── */}
          <section
            ref={heroRef}
            style={{
              position: 'relative',
              paddingTop: 110,
              paddingBottom: 24,
              paddingLeft: 36,
              paddingRight: 36,
              zIndex: 2,
            }}
          >
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              {/* Staggered Giant Headline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
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
          </div>
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
          padding: '12px 36px 36px',
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div
            className="search-bar-unified"
            style={{
              display: 'grid',
              alignItems: 'center',
              backgroundColor: '#0a0a0a',
              border: '1px solid var(--color-graphite)',
              padding: '8px 12px',
              gap: '8px',
              position: 'relative',
            }}
          >
            {/* ── Segmento 1: Deporte (Pádel / Fútbol) ── */}
            <div
              className="search-segment-sport"
              style={{
                padding: '8px 14px',
                borderRight: '1px solid rgba(76, 76, 76, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ fontSize: 9.5, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                Deporte
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#121212',
                  padding: '3px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  gap: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveSport('PADEL')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: activeSport === 'PADEL' ? 'var(--color-crimson-signal)' : 'transparent',
                    color: activeSport === 'PADEL' ? '#ffffff' : 'var(--color-ash)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: activeSport === 'PADEL' ? '0 0 12px rgba(252, 28, 70, 0.4)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icons.Padel size={12} color={activeSport === 'PADEL' ? '#ffffff' : 'var(--color-ash)'} />
                  <span>Pádel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSport('FUTBOL')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: activeSport === 'FUTBOL' ? 'var(--color-crimson-signal)' : 'transparent',
                    color: activeSport === 'FUTBOL' ? '#ffffff' : 'var(--color-ash)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: activeSport === 'FUTBOL' ? '0 0 12px rgba(252, 28, 70, 0.4)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icons.Football size={12} color={activeSport === 'FUTBOL' ? '#ffffff' : 'var(--color-ash)'} />
                  <span>Fútbol</span>
                </button>
              </div>
            </div>

            {/* ── Segmento 2: Fecha de Juego (Custom Calendar Popover) ── */}
            <div
              ref={dateDropdownRef}
              className="search-segment-date"
              style={{
                padding: '8px 14px',
                borderRight: '1px solid rgba(76, 76, 76, 0.4)',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            >
              <div style={{ fontSize: 9.5, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5, fontWeight: 700 }}>
                Fecha de juego
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  backgroundColor: '#121212',
                  border: isDateDropdownOpen ? '1px solid var(--color-crimson-signal)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 14px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <Icons.Calendar size={13} color="var(--color-crimson-signal)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)', whiteSpace: 'nowrap' }}>
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
                  <Icons.ChevronDown size={12} />
                </div>
              </div>

              {/* Custom Brutalist Popover Calendar para Fechas */}
              {isDateDropdownOpen && (
                <div
                  className="search-calendar-popover"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    width: 330,
                    maxWidth: 'calc(100vw - 32px)',
                    backgroundColor: '#0c0c0c',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderTop: '2px solid var(--color-crimson-signal)',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.98), 0 0 35px rgba(252, 28, 70, 0.18)',
                    zIndex: 150,
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
                          const day = d.getDay();
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

            {/* ── Segmento 3: Buscar Club / Complejo ── */}
            <div
              className="search-segment-input"
              style={{
                padding: '8px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 9.5, color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Club o Complejo
                </span>
                <span style={{ fontSize: 9, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
                  Mar del Plata
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#121212',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 14px',
                }}
              >
                <Icons.Search size={13} color="var(--color-ash)" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o dirección..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-frost)',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    width: '100%',
                    fontWeight: 500,
                  }}
                />
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--color-ash)',
                    }}
                  >
                    <Icons.Close size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Segmento 4: Botón Buscar ── */}
            <div
              className="search-segment-button"
              style={{
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={handleSearchTurnos}
                style={{
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '11px 24px',
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 16px rgba(252, 28, 70, 0.45)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
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
                <span>Buscar Turnos</span>
                <Icons.ArrowUpRight size={13} color="#ffffff" />
              </button>
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
                    {getFullDateLabel(selectedDate)} · {activeSport === 'PADEL' ? 'Pádel' : 'Fútbol'} · Mar del Plata
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

          <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 6 }}>
                DIRECTORIO DE CANCHAS · MAR DEL PLATA
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-1px', margin: 0, textTransform: 'uppercase' }}>
                Complejos Deportivos
              </h2>
            </div>

            {/* Selector de modo de turnos: Todos vs Fijos Semanales */}
            <div style={{ display: 'inline-flex', padding: 3, backgroundColor: '#0e0e0e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-full)' }}>
              <button
                type="button"
                onClick={() => setOnlyFixedSlots(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: !onlyFixedSlots ? 'var(--color-frost)' : 'transparent',
                  color: !onlyFixedSlots ? '#000000' : 'var(--color-ash)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Todos los Turnos
              </button>
              <button
                type="button"
                onClick={() => setOnlyFixedSlots(true)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: onlyFixedSlots ? 'var(--color-crimson-signal)' : 'transparent',
                  color: onlyFixedSlots ? 'var(--color-frost)' : 'var(--color-ash)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icons.Repeat size={12} color={onlyFixedSlots ? '#ffffff' : 'var(--color-ash)'} />
                <span>Turnos Fijos Semanales</span>
              </button>
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
                    onCardClick={() => {
                      router.push(`/clubes/${club.id}`);
                    }}
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
                          <Link
                            href={`/clubes/${club.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <h3
                              style={{
                                fontSize: 'clamp(20px, 2.5vw, 25px)',
                                fontWeight: 700,
                                color: 'var(--color-frost)',
                                letterSpacing: '-0.6px',
                                margin: '0 0 6px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'color 0.2s ease',
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-crimson-signal)')}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-frost)')}
                            >
                              {club.name}
                            </h3>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ash)', fontSize: 13, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                              <span>{club.address} · {club.city}</span>
                            </span>
                            <span style={{ color: 'var(--color-graphite)' }}>·</span>
                            <span style={{ color: 'var(--color-frost)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span>a {club.distanceKm} km</span>
                              {userLocation && (
                                <span style={{ fontSize: 9, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 5px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>
                                  GPS
                                </span>
                              )}
                            </span>
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
                                  backgroundColor: slot.isFixedSlot ? 'rgba(252, 28, 70, 0.08)' : '#111111',
                                  border: slot.isFixedSlot ? '1px solid rgba(252, 28, 70, 0.45)' : '1px solid var(--color-graphite)',
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
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(252, 28, 70, 0.18)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = slot.isFixedSlot ? 'rgba(252, 28, 70, 0.45)' : 'var(--color-graphite)';
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = slot.isFixedSlot ? 'rgba(252, 28, 70, 0.08)' : '#111111';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                                  {slot.isFixedSlot ? (
                                    <Icons.Repeat size={11} color="var(--color-crimson-signal)" />
                                  ) : (
                                    <Icons.Clock size={11} color="var(--color-crimson-signal)" />
                                  )}
                                  <span>{slot.startTime} hs</span>
                                  {slot.isFixedSlot && (
                                    <span style={{ fontSize: 8.5, padding: '1px 5px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-crimson-signal)', color: '#ffffff', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                                      FIJO
                                    </span>
                                  )}
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
                        <Link
                          href={`/clubes/${club.id}`}
                          style={{
                            backgroundColor: '#161616',
                            color: 'var(--color-frost)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            borderRadius: 'var(--radius-full)',
                            padding: '10px 18px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#222222';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#161616';
                          }}
                        >
                          <span>Ficha del Club</span>
                          <Icons.ArrowUpRight size={12} />
                        </Link>

                        {availableSlots.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(availableSlots[0], club)}
                            style={{
                              backgroundColor: 'var(--color-crimson-signal)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 'var(--radius-full)',
                              padding: '10px 20px',
                              fontSize: 11.5,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 3px 14px rgba(252, 28, 70, 0.4)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.filter = 'none';
                            }}
                          >
                            <Icons.Calendar size={13} color="#ffffff" />
                            <span>Reservar Turno</span>
                          </button>
                        ) : club.whatsappPhone ? (
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
                          >
                            <Icons.WhatsApp size={14} color="#000000" />
                            <span>Consultar WhatsApp</span>
                          </a>
                        ) : null}
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

        .search-bar-unified {
          grid-template-columns: auto minmax(210px, 240px) 1fr auto;
        }

        @media (max-width: 960px) {
          .search-bar-unified {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          .search-segment-sport {
            border-right: none !important;
            border-bottom: 1px solid rgba(76, 76, 76, 0.4);
            padding-bottom: 10px !important;
          }
          .search-segment-date {
            border-right: none !important;
            border-bottom: 1px solid rgba(76, 76, 76, 0.4);
            padding-bottom: 10px !important;
          }
          .search-segment-input {
            grid-column: span 2;
          }
          .search-segment-button {
            grid-column: span 2;
          }
          .search-segment-button button {
            width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          .search-bar-unified {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .search-segment-sport,
          .search-segment-date {
            grid-column: span 1 !important;
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
