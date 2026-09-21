import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import { ClubImageCarousel } from '../../components/reservar/ClubImageCarousel';
import { ReservarNavTabs } from '../../components/reservar/ReservarNavTabs';
import {
  getClubsFirestore,
  getCourtsFirestore,
  getAllActiveSlotsFirestore,
  subscribeToAllActiveSlotsFirestore,
  saveUserFixedSlotFirestore,
  BookingRecord,
  PublishedSlotRecord,
  FixedSlotSubscriptionFirestore,
  RecurringOccurrenceFirestore,
} from '../../services/firebase';

/* ────────────────────────────────────────────────────────────
   Design System Icons (Zero Unicode Emojis)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  ArrowLeft: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ArrowUpRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Star: ({ size = 14, color = '#facc15' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Phone: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
  Clock: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Repeat: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Share: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  CheckCircle: ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Close: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  Copy: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Lock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ChevronDown: ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Data Interfaces
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
  isFixedSlot?: boolean;
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

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val);
}

const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/* ────────────────────────────────────────────────────────────
   Main Dedicated Club Page Component
   ──────────────────────────────────────────────────────────── */

export default function ClubPublicPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, userProfile, openAuthModal, logout } = useAuth();
  const { userLocation } = useUserLocation();

  const [club, setClub] = useState<WebClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<'PADEL' | 'FUTBOL'>('PADEL');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
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

  // Booking Checkout Drawer State
  const [selectedSlot, setSelectedSlot] = useState<WebSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    clubName: string;
    courtName: string;
    time: string;
    totalPaid: number;
    splitLink?: string;
    mpInitPoint?: string;
  } | null>(null);

  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('SPLIT');
  const [splitPlayers, setSplitPlayers] = useState<number>(4);
  const [slotBookingMode, setSlotBookingMode] = useState<'SINGLE' | 'FIXED_RECURRING'>('SINGLE');
  const [fixedDurationMonths, setFixedDurationMonths] = useState<1 | 3 | 6>(1);

  // Buyer Info
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Auto-fill buyer info from auth state
  useEffect(() => {
    if (userProfile?.name && !buyerName) setBuyerName(userProfile.name);
    if (user?.displayName && !buyerName) setBuyerName(user.displayName);
    if (userProfile?.phone && !buyerPhone) setBuyerPhone(userProfile.phone);
    if (user?.email && !buyerEmail) setBuyerEmail(user.email);
  }, [user, userProfile]);

  // Hold Countdown Timer (7 minutes)
  const [holdTimer, setHoldTimer] = useState<number>(420);
  useEffect(() => {
    if (!selectedSlot) {
      setHoldTimer(420);
      return;
    }
    const interval = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSelectedSlot(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSlot]);

  const timerDisplay = useMemo(() => {
    const mins = Math.floor(holdTimer / 60);
    const secs = holdTimer % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [holdTimer]);

  // Load Club & Courts & Slots from Firestore
  useEffect(() => {
    if (!router.isReady) return;
    const targetId = typeof id === 'string' ? id : '';
    if (!targetId) return;

    let unsubscribeSlots: (() => void) | null = null;

    async function fetchClubData() {
      setLoading(true);
      try {
        const [allClubs, allCourts, allSlots] = await Promise.all([
          getClubsFirestore(),
          getCourtsFirestore(),
          getAllActiveSlotsFirestore(),
        ]);

        const rawClub = (allClubs || []).find((c: any) => c.id === targetId);

        if (rawClub) {
          const clubCourts = (allCourts || [])
            .filter((c: any) => c.clubId === rawClub.id)
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              sport: (c.sportType || '').toUpperCase().includes('FUTBOL') ? ('FUTBOL' as const) : ('PADEL' as const),
              surface: c.surface || 'Césped Sintético',
              capacity: (c.sportType || '').toUpperCase().includes('FUTBOL') ? 10 : 4,
            }));

          const clubSlots: WebSlot[] = (allSlots || [])
            .filter((s: PublishedSlotRecord) => s.clubId === rawClub.id && s.status === 'ACTIVE')
            .map((s: PublishedSlotRecord) => {
              const isPadel = (s.sportType || (s as any).sport || '').toUpperCase().includes('PADEL');
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
                available: s.status === 'ACTIVE',
                isFixedSlot: Boolean(s.isFixedSlot),
              };
            });

          let sportsList: ('PADEL' | 'FUTBOL')[] = [];
          if (Array.isArray(rawClub.sports) && rawClub.sports.length > 0) {
            sportsList = rawClub.sports.filter((s: string) => s === 'PADEL' || s === 'FUTBOL');
          } else {
            const hasPadel = clubCourts.some((c: any) => c.sport === 'PADEL') || clubSlots.some((s) => s.sport === 'PADEL');
            const hasFutbol = clubCourts.some((c: any) => c.sport === 'FUTBOL') || clubSlots.some((s) => s.sport === 'FUTBOL');
            if (hasPadel) sportsList.push('PADEL');
            if (hasFutbol) sportsList.push('FUTBOL');
          }
          if (sportsList.length === 0) sportsList.push('PADEL');

          const mappedClub: WebClub = {
            id: rawClub.id,
            name: rawClub.name,
            address: rawClub.address || '',
            city: rawClub.city || 'Mar del Plata',
            zone: rawClub.zone || rawClub.city || 'Mar del Plata',
            distanceKm: rawClub.distanceKm || 2.5,
            latitude: rawClub.latitude,
            longitude: rawClub.longitude,
            rating: rawClub.rating || 4.9,
            reviewCount: rawClub.reviewCount || 120,
            sports: sportsList,
            bookingMode: rawClub.bookingMode || 'ONLINE',
            whatsappPhone: String(rawClub.whatsappPhone || rawClub.whatsapp || rawClub.phone || '').replace(/[^0-9]/g, ''),
            phone: rawClub.phone || '',
            images: (rawClub.images && rawClub.images.length > 0) ? rawClub.images : [
              'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
            ],
            minPricePerPlayer: 6500,
            amenities: {
              covered: !!rawClub.amenities?.covered,
              parking: !!rawClub.amenities?.parking,
              buffet: !!rawClub.amenities?.buffet,
              lighting: !!rawClub.amenities?.lighting,
              lockers: !!rawClub.amenities?.lockers,
              syntheticWPT: !!rawClub.amenities?.syntheticWPT,
            },
            courts: clubCourts.length > 0 ? clubCourts : [
              { id: `${rawClub.id}-c1`, name: 'Cancha Principal', sport: sportsList[0], surface: 'Césped Sintético Pro', capacity: sportsList[0] === 'PADEL' ? 4 : 10 },
            ],
            slots: clubSlots,
          };

          setClub(mappedClub);
          if (sportsList.length > 0 && !sportsList.includes(selectedSport)) {
            setSelectedSport(sportsList[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching club details from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchClubData();

    // Subscribe to live slots
    try {
      unsubscribeSlots = subscribeToAllActiveSlotsFirestore((latestActiveSlots) => {
        setClub((prevClub) => {
          if (!prevClub) return null;
          const clubSlots: WebSlot[] = latestActiveSlots
            .filter((s) => s.clubId === prevClub.id && s.status === 'ACTIVE')
            .map((s) => {
              const isPadel = (s.sportType || (s as any).sport || '').toUpperCase().includes('PADEL');
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
                available: s.status === 'ACTIVE',
                isFixedSlot: Boolean(s.isFixedSlot),
              };
            });
          return {
            ...prevClub,
            slots: clubSlots,
          };
        });
      });
    } catch (e) {
      console.warn('Realtime slots subscription failed:', e);
    }

    return () => {
      if (unsubscribeSlots) unsubscribeSlots();
    };
  }, [id, router.isReady]);

  // Generate 7 day pills
  const next7Days = useMemo(() => {
    const list: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  // Filter slots for selected date and sport
  const availableSlotsForDate = useMemo(() => {
    if (!club || !club.slots) return [];
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateIso = `${y}-${m}-${d}`;
    const isToday = isSameDay(selectedDate, new Date());

    return club.slots.filter((s) => {
      const sSport = (s.sport || '').toUpperCase().includes('PADEL') ? 'PADEL' : 'FUTBOL';
      if (sSport !== selectedSport) return false;
      if (!s.available) return false;
      if (!s.date) return true;
      if (s.date === dateIso) return true;
      if (isToday && (s.date === 'Hoy' || s.date <= dateIso)) return true;
      return false;
    });
  }, [club, selectedDate, selectedSport]);

  const handleShareClub = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenBooking = (slot: WebSlot) => {
    const dateLabel = isSameDay(selectedDate, new Date())
      ? 'Hoy'
      : `${DAY_NAMES_ES[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MONTH_NAMES_ES[selectedDate.getMonth()]}`;

    setSelectedSlot({
      ...slot,
      date: dateLabel,
    });
    setSplitPlayers(slot.sport === 'FUTBOL' ? (slot.courtName.includes('7') ? 14 : 10) : 4);
    setConfirmedBooking(null);
    setSlotBookingMode(slot.isFixedSlot ? 'FIXED_RECURRING' : 'SINGLE');
    setFixedDurationMonths(1);
  };

  const handleExecutePayment = async () => {
    if (!selectedSlot || !club) return;
    setBookingError(null);

    // Auth gate
    if (!user) {
      openAuthModal(
        `Para confirmar tu reserva en ${club.name}, por favor iniciá sesión o creá tu cuenta. Así tu turno quedará guardado para siempre.`,
        () => {}
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

    const isRecurring = Boolean(selectedSlot.isFixedSlot && slotBookingMode === 'FIXED_RECURRING');
    const discountRate = isRecurring
      ? fixedDurationMonths === 1 ? 0.05 : fixedDurationMonths === 3 ? 0.12 : 0.15
      : 0;
    const effectivePrice = Math.round(selectedSlot.price * (1 - discountRate));

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club: {
            id: club.id,
            name: club.name,
            address: `${club.address} · ${club.city}`,
          },
          slot: {
            ...selectedSlot,
            price: effectivePrice,
          },
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

      // Save Recurring Subscription if selected
      if (isRecurring) {
        try {
          const subId = `sub_${user.uid}_${Date.now()}`;
          const totalWeeks = fixedDurationMonths * 4;
          const dayOfWeek = selectedDate.getDay();
          const generatedOccurrences: RecurringOccurrenceFirestore[] = [];

          for (let i = 0; i < totalWeeks; i++) {
            const occDate = new Date();
            occDate.setDate(occDate.getDate() + i * 7 + ((dayOfWeek - occDate.getDay() + 7) % 7));
            const occDateStr = occDate.toISOString().split('T')[0];

            generatedOccurrences.push({
              id: `occ_${subId}_${i + 1}`,
              subscriptionId: subId,
              date: occDateStr,
              dayOfWeek,
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
              courtName: selectedSlot.courtName,
              clubName: club.name,
              status: 'SCHEDULED',
              isPaid: i === 0,
              price: effectivePrice,
            });
          }

          const newSub: Omit<FixedSlotSubscriptionFirestore, 'occurrences'> = {
            id: subId,
            userId: user.uid,
            userName: buyerName.trim(),
            userPhone: buyerPhone.trim(),
            clubId: club.id,
            clubName: club.name,
            courtId: selectedSlot.courtId,
            courtName: selectedSlot.courtName,
            sportType: selectedSlot.sport === 'PADEL' ? 'PADEL' : 'FUTBOL_5',
            dayOfWeek,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            startDate: generatedOccurrences[0]?.date || new Date().toISOString().split('T')[0],
            durationMonths: fixedDurationMonths,
            pricePerOccurrence: effectivePrice,
            discountMonthlyTotal: (selectedSlot.price - effectivePrice) * 4,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };

          await saveUserFixedSlotFirestore(user.uid, newSub, generatedOccurrences);
        } catch (fixedErr) {
          console.error('Error saving user fixed slot subscription to Firestore:', fixedErr);
        }
      }

      // Local storage backup
      try {
        const newBookingRecord: BookingRecord = {
          id: data.booking.id,
          clubId: club.id,
          clubName: data.booking.clubName || club.name,
          clubAddress: `${club.address} · ${club.city}`,
          courtId: selectedSlot.courtId,
          courtName: data.booking.courtName || selectedSlot.courtName,
          sport: selectedSlot.sport,
          date: data.booking.date || selectedSlot.date,
          startTime: data.booking.startTime || selectedSlot.startTime,
          endTime: data.booking.endTime || selectedSlot.endTime,
          totalPrice: effectivePrice,
          serviceFee: 0,
          totalPaid: data.booking.totalPaid || (paymentType === 'FULL' ? effectivePrice : Math.round(effectivePrice / splitPlayers)),
          paymentType,
          splitPlayers,
          paidPlayersCount: 1,
          isFixedSlot: isRecurring,
          status: 'CONFIRMED',
          buyer: {
            name: buyerName.trim(),
            email: buyerEmail.trim() || user.email || '',
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

        const existing = JSON.parse(localStorage.getItem('hay_equipo_user_bookings') || '[]');
        localStorage.setItem('hay_equipo_user_bookings', JSON.stringify([newBookingRecord, ...existing.filter((b: any) => b.id !== newBookingRecord.id)]));
      } catch (e) {}
    } catch (err: any) {
      console.error('Payment error:', err);
      setBookingError(err?.message || 'Error al procesar la reserva. Por favor reintentá.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Head>
          <title>Cargando Club... | Hay Equipo</title>
        </Head>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(252, 28, 70, 0.2)', borderTopColor: 'var(--color-crimson-signal)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 18, color: 'var(--color-ash)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Cargando ficha del club...
        </p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!club) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Head>
          <title>Club no encontrado | Hay Equipo</title>
        </Head>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#111', border: '1px solid var(--color-graphite)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icons.Close size={28} color="var(--color-crimson-signal)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Club No Encontrado</h1>
        <p style={{ color: 'var(--color-ash)', fontSize: 14, maxWidth: 440, marginBottom: 24, lineHeight: 1.5 }}>
          No pudimos localizar la ficha de este club. Puede que la dirección sea incorrecta o el club se encuentre inactivo momentáneamente.
        </p>
        <Link
          href="/reservar"
          style={{
            backgroundColor: 'var(--color-crimson-signal)',
            color: '#fff',
            borderRadius: 'var(--radius-full)',
            padding: '12px 28px',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icons.ArrowLeft size={16} />
          <span>Volver a Explorar Clubes</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: 'var(--font-sui)' }}>
      <Head>
        <title>{`${club.name} — Canchas y Reserva de Turnos Online | Hay Equipo`}</title>
        <meta name="description" content={`Reservá canchas de pádel y fútbol en ${club.name}, ${club.address}. Horarios en vivo, fotos oficiales, comodidades y reserva asegurada con Mercado Pago.`} />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          HEADER — Fixed ThoughtLab Glass Navigation (Landing / Web-Club Style)
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
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(76, 76, 76, 0.35)',
        }}
      >
        {/* Brand Logo */}
        <Link href="/reservar" style={{ display: 'flex', alignItems: 'baseline', gap: 22, textDecoration: 'none' }}>
          <span className="landing-header-logo" style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span className="landing-header-logo-sub" style={{ fontSize: 10, color: 'var(--color-graphite)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            / Red Deportiva · Argentina
          </span>
        </Link>

        {/* Center: ReservarNavTabs with activeTab="EXPLORAR" */}
        <ReservarNavTabs
          activeTab="EXPLORAR"
          onChangeTab={(tab) => {
            if (tab === 'INICIO') router.push('/reservar?tab=inicio');
            else if (tab === 'EXPLORAR') router.push('/reservar?tab=explorar');
            else if (tab === 'RESERVAS') router.push('/reservar?tab=reservas');
            else if (tab === 'PERFIL') router.push('/reservar?tab=perfil');
          }}
        />

        {/* Right: App Mobile Pill + User Profile Dropdown */}
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

          {!user ? (
            <button
              type="button"
              onClick={() => openAuthModal('Iniciá sesión para reservar tu turno y administrar tus partidos.')}
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
                {user.photoURL && !avatarError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
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
                      router.push('/reservar?tab=reservas');
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
                      router.push('/reservar?tab=perfil');
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
          HERO SECTION: CLUB COVER & MAIN INFO
          ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 20px 80px' }}>
        {/* Breadcrumb de Navegación */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/reservar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--color-ash)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-frost)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ash)')}
          >
            <Icons.ArrowLeft size={14} />
            <span>Volver a Explorar Clubes</span>
          </Link>
        </div>
        {/* Encabezado del Club */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icons.ShieldCheck size={12} color="#10b981" />
                <span>Club Verificado</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(250, 204, 21, 0.12)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, color: '#facc15' }}>
                <Icons.Star size={11} color="#facc15" />
                <span>{club.rating}</span>
                <span style={{ color: 'var(--color-ash)', fontSize: 10 }}>({club.reviewCount} opiniones)</span>
              </div>
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 10px', color: 'var(--color-frost)' }}>
              {club.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-ash)', fontSize: 14, flexWrap: 'wrap' }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.name + ' ' + club.address + ' ' + club.city)}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--color-frost)', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                <Icons.MapPin size={14} color="var(--color-crimson-signal)" />
                <span>{club.address} · {club.city}</span>
              </a>

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
                  <a href={`tel:${club.phone.replace(/[^0-9]/g, '')}`} style={{ color: 'var(--color-ash)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icons.Phone size={13} color="var(--color-ash)" />
                    <span>{club.phone}</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs Header */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = document.getElementById('turnos-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                backgroundColor: 'var(--color-crimson-signal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '12px 24px',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(252, 28, 70, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icons.Calendar size={14} color="#ffffff" />
              <span>Ver Horarios Disponibles</span>
            </button>

            {club.whatsappPhone && (
              <a
                href={`https://wa.me/${club.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola! Los vi en Hay Equipo y quería consultar disponibilidad de turnos en ${club.name}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: '#25D366',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '12px 22px',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <Icons.WhatsApp size={15} color="#000000" />
                <span>WhatsApp Club</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleShareClub}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: copiedLink ? '#10b981' : 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '12px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                transition: 'all 0.2s ease',
              }}
            >
              {copiedLink ? <Icons.Check size={14} color="#10b981" /> : <Icons.Share size={14} />}
              <span>{copiedLink ? 'Link Copiado' : 'Compartir Club'}</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            MEDIA GALLERY & AMENITIES BENTO
            ═══════════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20, marginBottom: 36, alignItems: 'stretch' }}>
          {/* Photos */}
          <div style={{ backgroundColor: '#070707', border: '1px solid var(--color-graphite)', overflow: 'hidden' }}>
            <ClubImageCarousel
              images={club.images}
              clubName={club.name}
              height="100%"
              style={{ minHeight: 320, height: '100%' }}
            />
          </div>

          {/* Amenities & Club Overview Card */}
          <div style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--color-graphite)', padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginBottom: 8 }}>
                INSTALACIONES & COMODIDADES
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 16 }}>
                Servicios del Complejo
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: '12px', backgroundColor: '#111', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 2 }}>Techada / Indoor</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: club.amenities.covered ? '#10b981' : 'var(--color-graphite)' }}>
                    {club.amenities.covered ? 'Disponible' : 'Canchas al aire libre'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#111', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 2 }}>Estacionamiento</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: club.amenities.parking ? '#10b981' : 'var(--color-graphite)' }}>
                    {club.amenities.parking ? 'Custodiado y Gratis' : 'En la vía pública'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#111', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 2 }}>Buffet & Bar</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: club.amenities.buffet ? '#10b981' : 'var(--color-graphite)' }}>
                    {club.amenities.buffet ? 'Servicio Completo' : 'No disponible'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#111', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 2 }}>Iluminación</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: club.amenities.lighting ? '#10b981' : 'var(--color-graphite)' }}>
                    {club.amenities.lighting ? 'LED Pro Torneo' : 'Convencional'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(76, 76, 76, 0.3)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 600 }}>Canchas Habilitadas</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)' }}>
                  {club.courts.length} {club.courts.length === 1 ? 'cancha' : 'canchas registradas'}
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.name + ' ' + club.address + ' ' + club.city)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-frost)',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                }}
              >
                <span>Abrir en Google Maps</span>
                <Icons.ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            CANCHAS DEL CLUB
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginBottom: 6 }}>
            DETALLE DE PISTAS
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: '0 0 16px', color: 'var(--color-frost)' }}>
            Canchas Disponibles
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {club.courts.map((court) => (
              <div
                key={court.id}
                style={{
                  backgroundColor: '#0c0c0c',
                  border: '1px solid var(--color-graphite)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{court.name}</div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: court.sport === 'PADEL' ? 'rgba(252, 28, 70, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: court.sport === 'PADEL' ? 'var(--color-crimson-signal)' : '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>
                    {court.sport}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-ash)', marginBottom: 12 }}>
                  Superficie: <strong style={{ color: 'var(--color-frost)' }}>{court.surface}</strong>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Capacidad reglamentaria: {court.capacity} jugadores
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TURNOS DISPONIBLES & RESERVA ONLINE
            ═══════════════════════════════════════════════════════ */}
        <div id="turnos-section" style={{ backgroundColor: '#070707', border: '1px solid var(--color-graphite)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginBottom: 4 }}>
                SISTEMA DE RESERVA EN TIEMPO REAL
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0, color: 'var(--color-frost)' }}>
                Turnos Disponibles
              </h2>
            </div>

            {/* Sport Filter Pills */}
            {club.sports.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {club.sports.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSport(sp)}
                    style={{
                      backgroundColor: selectedSport === sp ? 'var(--color-crimson-signal)' : '#161616',
                      color: selectedSport === sp ? '#ffffff' : 'var(--color-ash)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '8px 18px',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {sp === 'PADEL' ? 'Pádel' : 'Fútbol'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selector Pills (Next 7 Days) */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24 }}>
            {next7Days.map((d, index) => {
              const isSelected = isSameDay(d, selectedDate);
              const isToday = index === 0;
              const isTomorrow = index === 1;

              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.15)' : '#111111',
                    border: isSelected ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    color: isSelected ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                    padding: '8px 18px',
                    fontSize: 12,
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icons.Calendar size={13} color={isSelected ? 'var(--color-crimson-signal)' : 'var(--color-ash)'} />
                  <span>
                    {isToday ? `Hoy (${d.getDate()} ${MONTH_NAMES_ES[d.getMonth()].slice(0, 3)})` : isTomorrow ? `Mañana (${d.getDate()} ${MONTH_NAMES_ES[d.getMonth()].slice(0, 3)})` : `${DAY_NAMES_ES[d.getDay()]} ${d.getDate()}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slots Grid */}
          {availableSlotsForDate.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {availableSlotsForDate.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    backgroundColor: slot.isFixedSlot ? 'rgba(252, 28, 70, 0.05)' : '#101010',
                    border: slot.isFixedSlot ? '1px solid rgba(252, 28, 70, 0.4)' : '1px solid var(--color-graphite)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 800, color: 'var(--color-frost)' }}>
                        <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                        <span>{slot.startTime} a {slot.endTime} hs</span>
                      </div>
                      {slot.isFixedSlot && (
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-crimson-signal)', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase' }}>
                          FIJO
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ash)' }}>
                      {slot.courtName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase' }}>Por Jugador</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-frost)' }}>
                        {formatCurrency(slot.perPlayerPrice)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-ash)' }}>Total: {formatCurrency(slot.price)}</div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(slot)}
                      style={{
                        backgroundColor: 'var(--color-crimson-signal)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: '9px 18px',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 10px rgba(252, 28, 70, 0.35)',
                      }}
                    >
                      <span>Reservar</span>
                      <Icons.ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: '#0d0d0d', border: '1px dashed var(--color-graphite)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icons.Calendar size={20} color="var(--color-ash)" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-frost)', marginBottom: 6 }}>
                No hay turnos disponibles para esta fecha
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.4 }}>
                Podés elegir otro día en la barra superior o escribirle directamente por WhatsApp al club para consultar sobre turnos cancelados o lista de espera.
              </p>
              {club.whatsappPhone && (
                <a
                  href={`https://wa.me/${club.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola! Estoy viendo ${club.name} en Hay Equipo y quería consultar si tienen turnos disponibles para el día ${selectedDate.getDate()} de ${MONTH_NAMES_ES[selectedDate.getMonth()]}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#000000',
                    borderRadius: 'var(--radius-full)',
                    padding: '10px 22px',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icons.WhatsApp size={15} color="#000" />
                  <span>Consultar por WhatsApp</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL: CHECKOUT DE RESERVA EN VIVO (MERCADO PAGO + SPLIT)
          ═══════════════════════════════════════════════════════ */}
      {selectedSlot && (
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
            if (!isProcessing) setSelectedSlot(null);
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
                onClick={() => setSelectedSlot(null)}
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

            {/* Holding Countdown Bar */}
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
                    </div>
                  )}

                  {paymentType === 'SPLIT' && confirmedBooking.splitLink && (
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
                          onClick={() => {
                            if (typeof window !== 'undefined' && confirmedBooking.splitLink) {
                              navigator.clipboard.writeText(confirmedBooking.splitLink);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }
                          }}
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
                    <Link
                      href="/reservar"
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
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Ir a Mis Reservas
                    </Link>
                    <button
                      onClick={() => setSelectedSlot(null)}
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
                          {club.name} · {club.address}
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

                  {/* Modalidad de Turno: Puntual vs Fijo */}
                  {selectedSlot.isFixedSlot && (
                    <div
                      style={{
                        marginBottom: 20,
                        padding: '16px',
                        backgroundColor: '#101010',
                        border: '1px solid rgba(252, 28, 70, 0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                          MODALIDAD DE TURNO
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(252, 28, 70, 0.2)', color: 'var(--color-crimson-signal)', fontWeight: 700 }}>
                          DISPONIBLE COMO FIJO
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: slotBookingMode === 'FIXED_RECURRING' ? 14 : 0 }}>
                        <button
                          type="button"
                          onClick={() => setSlotBookingMode('SINGLE')}
                          style={{
                            backgroundColor: slotBookingMode === 'SINGLE' ? 'rgba(255, 255, 255, 0.1)' : '#080808',
                            border: '1px solid ' + (slotBookingMode === 'SINGLE' ? 'var(--color-frost)' : 'var(--color-graphite)'),
                            padding: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                            Turno Puntual
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--color-ash)' }}>
                            Solo juegas esta fecha puntual.
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSlotBookingMode('FIXED_RECURRING')}
                          style={{
                            backgroundColor: slotBookingMode === 'FIXED_RECURRING' ? 'rgba(252, 28, 70, 0.15)' : '#080808',
                            border: '1px solid ' + (slotBookingMode === 'FIXED_RECURRING' ? 'var(--color-crimson-signal)' : 'var(--color-graphite)'),
                            padding: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                            <Icons.Repeat size={12} color="var(--color-crimson-signal)" />
                            <span>Fijo Semanal</span>
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--color-ash)' }}>
                            Tu cancha fija cada semana.
                          </div>
                        </button>
                      </div>

                      {slotBookingMode === 'FIXED_RECURRING' && (
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12, marginTop: 10 }}>
                          <div style={{ fontSize: 10.5, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, fontWeight: 600 }}>
                            Duración del Compromiso Semanal:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {[
                              { months: 1, discount: '5% OFF' },
                              { months: 3, discount: '12% OFF' },
                              { months: 6, discount: '15% OFF' },
                            ].map((item) => {
                              const isSelected = fixedDurationMonths === item.months;
                              return (
                                <button
                                  key={item.months}
                                  type="button"
                                  onClick={() => setFixedDurationMonths(item.months as 1 | 3 | 6)}
                                  style={{
                                    backgroundColor: isSelected ? 'var(--color-crimson-signal)' : '#161616',
                                    color: isSelected ? '#ffffff' : 'var(--color-ash)',
                                    border: isSelected ? 'none' : '1px solid var(--color-graphite)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '7px 8px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {item.months} {item.months === 1 ? 'mes' : 'meses'} ({item.discount})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Jugadores para Split */}
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

                  {/* Auth Check State */}
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
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)' }}>
                            Reservando como: {userProfile?.name || user.displayName || user.email}
                          </div>
                          <div style={{ fontSize: 11, color: '#a7f3d0' }}>
                            Turno vinculado permanentemente a tu cuenta
                          </div>
                        </div>
                      </div>
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
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)', marginBottom: 2 }}>
                          Identificate para reservar
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                          Accedé con Google para asegurar este turno y rastrearlo cuando quieras.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAuthModal(`Para reservar en ${club.name}, por favor ingresá con tu cuenta.`)}
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
                  {(() => {
                    const isRecurring = Boolean(selectedSlot.isFixedSlot && slotBookingMode === 'FIXED_RECURRING');
                    const dRate = isRecurring ? (fixedDurationMonths === 1 ? 0.05 : fixedDurationMonths === 3 ? 0.12 : 0.15) : 0;
                    const effPrice = Math.round(selectedSlot.price * (1 - dRate));
                    const baseAmount = paymentType === 'FULL' ? effPrice : Math.round(effPrice / splitPlayers);
                    const fee = paymentType === 'FULL' ? 1500 : 500;
                    const totalToday = baseAmount + fee;

                    return (
                      <div style={{ borderTop: '1px solid rgba(76, 76, 76, 0.4)', paddingTop: 16, marginBottom: 20 }}>
                        {isRecurring && dRate > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: 12, fontWeight: 700, marginBottom: 10, backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            <span>Descuento Fijo Semanal ({fixedDurationMonths} {fixedDurationMonths === 1 ? 'mes' : 'meses'})</span>
                            <span>-{Math.round(dRate * 100)}% OFF APLICADO</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)', fontSize: 13, marginBottom: 6 }}>
                          <span>{paymentType === 'FULL' ? 'Subtotal Cancha' : `Tu cuota (1 de ${splitPlayers})`}</span>
                          <span>
                            {isRecurring && dRate > 0 && (
                              <span style={{ textDecoration: 'line-through', color: 'var(--color-graphite)', marginRight: 6, fontSize: 11.5 }}>
                                {paymentType === 'FULL' ? formatCurrency(selectedSlot.price) : formatCurrency(Math.round(selectedSlot.price / splitPlayers))}
                              </span>
                            )}
                            {formatCurrency(baseAmount)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)', fontSize: 13, marginBottom: 10 }}>
                          <span>Tarifa de servicio de reserva</span>
                          <span>{formatCurrency(fee)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-frost)', fontSize: 18, fontWeight: 700, borderTop: '1px dashed rgba(76, 76, 76, 0.4)', paddingTop: 10 }}>
                          <span>Total a abonar hoy</span>
                          <span style={{ color: 'var(--color-crimson-signal)' }}>
                            {formatCurrency(totalToday)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

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
    </div>
  );
}
