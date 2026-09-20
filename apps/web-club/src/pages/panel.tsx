import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  getClubsFirestore,
  getCourtsFirestore,
  saveCourtsFirestore,
  listenClubBookingsFirestore,
  updateBookingStatusFirestore,
  getClubPublishedSlotsFirestore,
  saveClubPublishedSlotsFirestore,
  createBookingFirestore,
  BookingRecord,
} from '../services/firebase';
import { SportBadge } from '../components/SportBadge';
import { useSlidingIndicator } from '../hooks/useSlidingIndicator';

/* ────────────────────────────────────────────────────────────
   Types & Navigation
   ──────────────────────────────────────────────────────────── */

type ClubPanelTab = 'REQUESTS' | 'PUBLISH_SLOTS' | 'COURTS' | 'PAYOUTS';

interface CourtData {
  id: string;
  clubId: string;
  name: string;
  sportType: 'PADEL' | 'FUTBOL_5' | 'FUTBOL_7' | 'FUTBOL_11';
  surface: string;
  pricePerHour: number;
  durationMinutes?: number;
  isCovered: boolean;
  hasLighting: boolean;
  active: boolean;
}

const DEFAULT_TIME_SLOTS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30',
  '17:00', '18:30', '20:00', '21:30', '23:00'
];

/* ────────────────────────────────────────────────────────────
   Vector Icons (Strict Zero-Emoji Policy)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  Bell: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Volume: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeX: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  Check: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Close: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Clock: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Calendar: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  WhatsApp: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  ShieldCheck: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Plus: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Zap: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  DollarSign: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ArrowRight: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Synthesized Audio Chime (Web Audio API)
   ──────────────────────────────────────────────────────────── */

function playNewRequestChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1st note (740 Hz - F#5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(740, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // 2nd note (987.77 Hz - B5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(988, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.warn('Audio alert not supported or user gesture blocked:', err);
  }
}

/* ────────────────────────────────────────────────────────────
   Format Helpers
   ──────────────────────────────────────────────────────────── */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFormattedDate(offsetDays: number = 0): { value: string; label: string; sublabel: string } {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const val = `${year}-${month}-${day}`;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayName = dayNames[d.getDay()];

  let label = `${dayName} ${day}/${month}`;
  if (offsetDays === 0) label = 'Hoy';
  if (offsetDays === 1) label = 'Mañana';

  return {
    value: val,
    label,
    sublabel: `${day}/${month}`,
  };
}

/* ────────────────────────────────────────────────────────────
   Main Component: Club Operations Terminal
   ──────────────────────────────────────────────────────────── */

export default function ClubPanelPage() {
  const router = useRouter();

  // Active Club State
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('club-laverde-jara');
  const [clubName, setClubName] = useState<string>('Club Laverde Jara');
  const [isReceptionOnline, setIsReceptionOnline] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Tab State with Sliding Indicator
  const [activeTab, setActiveTab] = useState<ClubPanelTab>('REQUESTS');
  const { containerRef, setItemRef, indicatorStyle } = useSlidingIndicator<ClubPanelTab>(activeTab);

  // Bookings (Real-time Firestore)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('PENDING');

  // Rejection Modal
  const [rejectModalBooking, setRejectModalBooking] = useState<BookingRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Cancha ocupada presencialmente en el club');
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Published Slots State
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [publishedSlots, setPublishedSlots] = useState<Record<string, boolean>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Courts State
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [isEditCourtModalOpen, setIsEditCourtModalOpen] = useState<boolean>(false);
  const [editingCourt, setEditingCourt] = useState<CourtData | null>(null);

  // Financial & Payout State
  const [cbuAlias, setCbuAlias] = useState<string>('LAVERDE.FUTBOL.MP');
  const [savedAliasMsg, setSavedAliasMsg] = useState<boolean>(false);

  // Audio alert tracker: remember IDs to only chime on brand new incoming requests
  const prevPendingIdsRef = useRef<Set<string>>(new Set());

  // 1. Initial Load: Clubs & Courts
  useEffect(() => {
    async function loadInitial() {
      const clubsData = await getClubsFirestore();
      if (clubsData && clubsData.length > 0) {
        setClubs(clubsData);
        const storedClubId = typeof window !== 'undefined' ? localStorage.getItem('hayequipo_active_club_id') : null;
        const initial = clubsData.find((c: any) => c.id === storedClubId) || clubsData[0];
        setSelectedClubId(initial.id);
        setClubName(initial.name);
      }

      const courtsData = await getCourtsFirestore();
      if (courtsData && courtsData.length > 0) {
        setCourts(courtsData);
      } else {
        // Fallback default courts for initial experience
        setCourts([
          {
            id: 'c-1',
            clubId: 'club-laverde-jara',
            name: 'Cancha 1 — Panorámica WPT',
            sportType: 'PADEL',
            surface: 'Vidrio Panorámico 12mm · Césped Texturado',
            pricePerHour: 32000,
            durationMinutes: 90,
            isCovered: true,
            hasLighting: true,
            active: true,
          },
          {
            id: 'c-2',
            clubId: 'club-laverde-jara',
            name: 'Cancha 2 — Cristal Pro',
            sportType: 'PADEL',
            surface: 'Vidrio Templado 10mm · Césped Monofilamento',
            pricePerHour: 28000,
            durationMinutes: 90,
            isCovered: true,
            hasLighting: true,
            active: true,
          },
          {
            id: 'c-3',
            clubId: 'club-laverde-jara',
            name: 'Cancha 3 — Fútbol 7 Pro',
            sportType: 'FUTBOL_7',
            surface: 'Césped Sintético Forbex 50mm con Caucho',
            pricePerHour: 48000,
            durationMinutes: 60,
            isCovered: false,
            hasLighting: true,
            active: true,
          },
        ]);
      }
    }
    loadInitial();
  }, []);

  // 2. Real-Time Listener: Incoming Bookings for the Selected Club
  useEffect(() => {
    if (!selectedClubId) return;

    const unsubscribe = listenClubBookingsFirestore(selectedClubId, (allClubBookings) => {
      setBookings(allClubBookings);

      // Check if there are newly added PENDING bookings
      const currentPending = allClubBookings.filter((b) => b.status === 'PENDING');
      const newPending = currentPending.filter((b) => !prevPendingIdsRef.current.has(b.id));

      if (newPending.length > 0 && isSoundEnabled) {
        playNewRequestChime();
      }

      // Update ref set
      prevPendingIdsRef.current = new Set(currentPending.map((b) => b.id));
    });

    return () => {
      unsubscribe();
    };
  }, [selectedClubId, isSoundEnabled]);

  // 3. Tab Title Alert Counter
  const pendingRequests = useMemo(() => {
    return bookings.filter((b) => b.status === 'PENDING');
  }, [bookings]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (pendingRequests.length > 0) {
      document.title = `(${pendingRequests.length}) ¡NUEVA SOLICITUD! — Hay Equipo Panel`;
    } else {
      document.title = `Panel Club · ${clubName} — Hay Equipo`;
    }
  }, [pendingRequests.length, clubName]);

  // 4. Load Published Slots for Date
  const currentDateObj = useMemo(() => {
    return getFormattedDate(selectedDateOffset);
  }, [selectedDateOffset]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedClubId) return;
      setIsLoadingSlots(true);
      const slots = await getClubPublishedSlotsFirestore(selectedClubId, currentDateObj.value);
      setPublishedSlots(slots);
      setIsLoadingSlots(false);
    }
    loadSlots();
  }, [selectedClubId, currentDateObj.value]);

  // Handle Switching Active Club
  const handleClubChange = (clubId: string) => {
    setSelectedClubId(clubId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hayequipo_active_club_id', clubId);
    }
    const found = clubs.find((c) => c.id === clubId);
    if (found) setClubName(found.name);
  };

  // 5. Booking Actions: Aceptar / Rechazar
  const handleAcceptBooking = async (bookingId: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'CONFIRMED' }),
      });

      if (!res.ok) {
        // Direct fallback update via Firestore
        await updateBookingStatusFirestore(bookingId, 'CONFIRMED');
      }

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : b))
      );
    } catch (err) {
      console.error('Error accepting booking:', err);
      await updateBookingStatusFirestore(bookingId, 'CONFIRMED');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;
    setIsProcessingAction(true);
    try {
      const bookingId = rejectModalBooking.id;
      const res = await fetch('/api/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'REJECTED', reason: rejectReason }),
      });

      if (!res.ok) {
        await updateBookingStatusFirestore(bookingId, 'REJECTED', rejectReason);
      }

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectReason }
            : b
        )
      );
      setRejectModalBooking(null);
    } catch (err) {
      console.error('Error rejecting booking:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 6. Slots Toggle Handlers
  const handleToggleSlot = async (courtId: string, time: string) => {
    const slotKey = `${courtId}_${time}`;
    const nextState = !publishedSlots[slotKey];
    const updated = {
      ...publishedSlots,
      [slotKey]: nextState,
    };
    setPublishedSlots(updated);
    await saveClubPublishedSlotsFirestore(selectedClubId, currentDateObj.value, updated);
  };

  const handleBatchPublishAfternoon = async () => {
    const afternoonTimes = ['17:00', '18:30', '20:00', '21:30', '23:00'];
    const updated = { ...publishedSlots };
    courts.forEach((court) => {
      afternoonTimes.forEach((time) => {
        updated[`${court.id}_${time}`] = true;
      });
    });
    setPublishedSlots(updated);
    await saveClubPublishedSlotsFirestore(selectedClubId, currentDateObj.value, updated);
  };

  const handleBatchPublishAll = async () => {
    const updated = { ...publishedSlots };
    courts.forEach((court) => {
      DEFAULT_TIME_SLOTS.forEach((time) => {
        updated[`${court.id}_${time}`] = true;
      });
    });
    setPublishedSlots(updated);
    await saveClubPublishedSlotsFirestore(selectedClubId, currentDateObj.value, updated);
  };

  const handleBatchUnpublishAll = async () => {
    const updated = { ...publishedSlots };
    courts.forEach((court) => {
      DEFAULT_TIME_SLOTS.forEach((time) => {
        updated[`${court.id}_${time}`] = false;
      });
    });
    setPublishedSlots(updated);
    await saveClubPublishedSlotsFirestore(selectedClubId, currentDateObj.value, updated);
  };

  // 7. Simular Solicitud Entrante (Testing Helper)
  const handleSimulateIncomingRequest = async () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `HE-${randomCode}`;
    const demoCourt = courts[0] || { id: 'c-1', name: 'Cancha 1 — Panorámica WPT', pricePerHour: 32000 };
    const sportsOptions: ('PADEL' | 'FUTBOL')[] = ['PADEL', 'FUTBOL'];
    const selectedSport = demoCourt.sportType?.includes('FUT') ? 'FUTBOL' : 'PADEL';

    const testPlayers = [
      { name: 'Rodrigo De Paul', phone: '+54 9 11 5566-7788' },
      { name: 'Emiliano Martínez', phone: '+54 9 223 445-5667' },
      { name: 'Lautaro Martínez', phone: '+54 9 11 3322-1144' },
      { name: 'Alexis Mac Allister', phone: '+54 9 11 9988-7766' },
    ];
    const randomPlayer = testPlayers[Math.floor(Math.random() * testPlayers.length)];

    const simBooking: BookingRecord = {
      id: bookingId,
      clubId: selectedClubId,
      clubName,
      courtId: demoCourt.id,
      courtName: demoCourt.name,
      sport: selectedSport,
      date: getTodayString(),
      startTime: '20:00',
      endTime: '21:30',
      totalPrice: demoCourt.pricePerHour || 32000,
      serviceFee: 1500,
      totalPaid: demoCourt.pricePerHour || 32000,
      paymentType: 'FULL',
      splitPlayers: 4,
      paidPlayersCount: 4,
      status: 'PENDING',
      buyer: {
        name: randomPlayer.name,
        email: 'jugador@hayequipo.com.ar',
        phone: randomPlayer.phone,
      },
      participants: [
        {
          id: 'part-1',
          name: randomPlayer.name,
          phone: randomPlayer.phone,
          amount: demoCourt.pricePerHour || 32000,
          status: 'PAID',
          isHost: true,
        },
      ],
      splitToken: bookingId.toLowerCase(),
      splitLink: `https://hayequipo.com.ar/split/${bookingId.toLowerCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createBookingFirestore(simBooking);
    if (isSoundEnabled) {
      playNewRequestChime();
    }
  };

  // Filtered Bookings for the Requests Tab
  const filteredBookings = useMemo(() => {
    if (requestFilter === 'PENDING') return bookings.filter((b) => b.status === 'PENDING');
    if (requestFilter === 'CONFIRMED') return bookings.filter((b) => b.status === 'CONFIRMED');
    if (requestFilter === 'REJECTED') return bookings.filter((b) => b.status === 'REJECTED');
    return bookings;
  }, [bookings, requestFilter]);

  // Today's Confirmed Bookings for the Reception Agenda
  const todaysConfirmedBookings = useMemo(() => {
    const todayStr = getTodayString();
    return bookings.filter((b) => b.status === 'CONFIRMED' && b.date === todayStr);
  }, [bookings]);

  // Financial Stats
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'CONFIRMED').length, [bookings]);
  const totalRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  }, [bookings]);

  return (
    <div style={{ backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Head>
        <title>{pendingRequests.length > 0 ? `(${pendingRequests.length}) ¡SOLICITUD ENTRANTE! — Hay Equipo` : `Terminal Club · ${clubName}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* ────────────────────────────────────────────────────────────
          HEADER: Void Black Terminal Command Bar
          ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: '1px solid var(--color-graphite)',
          backgroundColor: 'var(--color-obsidian)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Left: Branding & Club Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--color-frost)' }}>
                  HAY EQUIPO
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  TERMINAL CLUB
                </span>
              </div>

              {/* Club Selector Dropdown */}
              {clubs.length > 1 && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedClubId}
                    onChange={(e) => handleClubChange(e.target.value)}
                    style={{
                      backgroundColor: 'var(--color-surface-elevate)',
                      color: 'var(--color-frost)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: '#141414', color: '#ffffff' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: Sound Alert Switch & Reception Status & Demo Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Sound Alert Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !isSoundEnabled;
                  setIsSoundEnabled(next);
                  if (next) playNewRequestChime();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSoundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-elevate)',
                  color: isSoundEnabled ? 'var(--color-emerald)' : 'var(--color-ash)',
                  border: isSoundEnabled ? '1px solid var(--color-emerald)' : '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={isSoundEnabled ? 'Alertas sonoras activas' : 'Alertas silenciadas'}
              >
                {isSoundEnabled ? <Icons.Volume size={14} /> : <Icons.VolumeX size={14} />}
                <span>{isSoundEnabled ? 'AUDIO ACTIVO' : 'SILENCIADO'}</span>
              </button>

              {/* Status Indicator (Recepción Abierta) */}
              <button
                type="button"
                onClick={() => setIsReceptionOnline(!isReceptionOnline)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isReceptionOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: isReceptionOnline ? 'var(--color-emerald)' : '#ef4444',
                  border: isReceptionOnline ? '1px solid var(--color-emerald)' : '1px solid #ef4444',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isReceptionOnline ? 'var(--color-emerald)' : '#ef4444',
                    boxShadow: isReceptionOnline ? '0 0 8px var(--color-emerald)' : 'none',
                  }}
                />
                <span>{isReceptionOnline ? 'RECEPCIÓN ONLINE' : 'RECEPCIÓN EN PAUSA'}</span>
              </button>

              {/* Quick Simulation Button for Demo Testing */}
              <button
                type="button"
                onClick={handleSimulateIncomingRequest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px dashed var(--color-crimson-signal)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Genera una solicitud de prueba en vivo para verificar el sonido y el flujo"
              >
                <Icons.Zap size={13} color="var(--color-crimson-signal)" />
                <span>+ Simular Solicitud</span>
              </button>
            </div>
          </div>

          {/* Sliding Pill Navigation Bar */}
          <div style={{ marginTop: '16px', position: 'relative' }}>
            <div
              ref={containerRef as any}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface-elevate)',
                padding: '4px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-graphite)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={indicatorStyle} />

              {/* Tab 1: Solicitudes */}
              <button
                ref={setItemRef('REQUESTS')}
                onClick={() => setActiveTab('REQUESTS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'REQUESTS' ? '#ffffff' : 'var(--color-ash)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <Icons.Bell size={14} />
                <span>Solicitudes</span>
                {pendingRequests.length > 0 && (
                  <span
                    style={{
                      backgroundColor: activeTab === 'REQUESTS' ? '#ffffff' : 'var(--color-crimson-signal)',
                      color: activeTab === 'REQUESTS' ? 'var(--color-crimson-signal)' : '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      marginLeft: '4px',
                    }}
                  >
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {/* Tab 2: Publicar Turnos */}
              <button
                ref={setItemRef('PUBLISH_SLOTS')}
                onClick={() => setActiveTab('PUBLISH_SLOTS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'PUBLISH_SLOTS' ? '#ffffff' : 'var(--color-ash)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <Icons.Calendar size={14} />
                <span>Publicar Turnos</span>
              </button>

              {/* Tab 3: Mis Canchas */}
              <button
                ref={setItemRef('COURTS')}
                onClick={() => setActiveTab('COURTS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'COURTS' ? '#ffffff' : 'var(--color-ash)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span>Mis Canchas ({courts.length})</span>
              </button>

              {/* Tab 4: Liquidaciones */}
              <button
                ref={setItemRef('PAYOUTS')}
                onClick={() => setActiveTab('PAYOUTS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'PAYOUTS' ? '#ffffff' : 'var(--color-ash)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <Icons.DollarSign size={14} />
                <span>Liquidaciones</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
          ──────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* ════════════════════════════════════════════════════════════
            TAB 1: BANDEJA DE SOLICITUDES (INBOX DE RESERVAS EN VIVO)
            ════════════════════════════════════════════════════════════ */}
        {activeTab === 'REQUESTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filter Pills & Summary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(['PENDING', 'ALL', 'CONFIRMED', 'REJECTED'] as const).map((filterKey) => {
                  const labels = {
                    PENDING: `SOLICITUDES PENDIENTES (${pendingRequests.length})`,
                    ALL: `TODAS (${bookings.length})`,
                    CONFIRMED: `CONFIRMADAS (${bookings.filter((b) => b.status === 'CONFIRMED').length})`,
                    REJECTED: `RECHAZADAS (${bookings.filter((b) => b.status === 'REJECTED').length})`,
                  };
                  const isActive = requestFilter === filterKey;
                  return (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setRequestFilter(filterKey)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: isActive ? 'var(--color-frost)' : 'var(--color-surface-elevate)',
                        color: isActive ? '#000000' : 'var(--color-ash)',
                        border: isActive ? '1px solid var(--color-frost)' : '1px solid var(--color-graphite)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {labels[filterKey]}
                    </button>
                  );
                })}
              </div>

              {pendingRequests.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-crimson-signal)',
                      display: 'inline-block',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-crimson-signal)' }}>
                    {pendingRequests.length} {pendingRequests.length === 1 ? 'pedido esperando tu respuesta' : 'pedidos esperando tu respuesta'}
                  </span>
                </div>
              )}
            </div>

            {/* List of Incoming Requests */}
            {filteredBookings.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '64px 24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', marginBottom: '16px' }}>
                  <Icons.Bell size={28} color="var(--color-ash)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  {requestFilter === 'PENDING' ? 'No tenés solicitudes pendientes ahora mismo' : 'No hay reservas registradas en esta vista'}
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px' }}>
                  Cuando un jugador elija una cancha libre desde la web o app de Hay Equipo, su solicitud aparecerá acá con una alerta sonora para que la aceptes o rechaces en 1 click.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateIncomingRequest}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Generar Solicitud de Prueba
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredBookings.map((booking) => {
                  const isPending = booking.status === 'PENDING';
                  const isConfirmed = booking.status === 'CONFIRMED';
                  const isRejected = booking.status === 'REJECTED';
                  const cleanPhone = (booking.buyer?.phone || '').replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(booking.buyer?.name || '')},%20te%20escribimos%20desde%20${encodeURIComponent(clubName)}%20sobre%20tu%20reserva%20en%20Hay%20Equipo.`;

                  return (
                    <div
                      key={booking.id}
                      style={{
                        backgroundColor: 'var(--color-obsidian)',
                        border: isPending ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                        borderLeft: isPending ? '4px solid var(--color-crimson-signal)' : isConfirmed ? '4px solid var(--color-emerald)' : '4px solid #64748b',
                        borderRadius: '0px',
                        padding: '20px 24px',
                        boxShadow: isPending ? '0 0 20px rgba(252, 28, 70, 0.15)' : 'none',
                        transition: 'border 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        {/* Left: Slot & Player Information */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: isPending ? 'rgba(252, 28, 70, 0.2)' : isConfirmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                color: isPending ? 'var(--color-crimson-signal)' : isConfirmed ? 'var(--color-emerald)' : 'var(--color-ash)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {isPending ? 'SOLICITUD ENTRANTE' : isConfirmed ? 'TURNO CONFIRMADO' : 'RECHAZADO'}
                            </span>

                            <span style={{ fontSize: '12px', color: 'var(--color-ash)', fontWeight: 600 }}>
                              Código: #{booking.id}
                            </span>

                            <SportBadge sports={[booking.sport]} size="sm" />
                          </div>

                          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-frost)' }}>
                            {booking.courtName}
                          </div>

                          {/* Match Schedule */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-ash)', fontSize: '14px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-frost)', fontWeight: 600 }}>
                              <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                              {booking.date}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-frost)', fontWeight: 700 }}>
                              <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                              {booking.startTime} hs {booking.endTime ? `a ${booking.endTime} hs` : ''}
                            </span>
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                              {formatCurrency(booking.totalPrice)} {booking.paymentType === 'SPLIT' ? '· PAGO DIVIDIDO' : '· PAGO COMPLETO'}
                            </span>
                          </div>

                          {/* Player Identity Row */}
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '10px 14px',
                              backgroundColor: 'var(--color-surface-elevate)',
                              borderRadius: '0px',
                              border: '1px solid var(--color-graphite)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: '#1f1f1f',
                                  color: 'var(--color-frost)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '14px',
                                }}
                              >
                                {(booking.buyer?.name || 'J')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-frost)' }}>
                                  {booking.buyer?.name || 'Jugador'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-ash)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Icons.ShieldCheck size={12} color="var(--color-emerald)" />
                                  <span>Jugador Verificado · {booking.buyer?.phone || 'Sin WhatsApp'}</span>
                                </div>
                              </div>
                            </div>

                            {/* WhatsApp Button */}
                            {cleanPhone && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: '#25D366',
                                  color: '#000000',
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                }}
                              >
                                <Icons.WhatsApp size={13} color="#000000" />
                                <span>Abrir WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions (Aceptar / Rechazar) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
                          {isPending ? (
                            <>
                              <div style={{ fontSize: '12px', color: 'var(--color-ash)', textAlign: 'right', marginBottom: '2px' }}>
                                Pago pre-autorizado en custodia
                              </div>

                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={() => handleAcceptBooking(booking.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  backgroundColor: 'var(--color-emerald)',
                                  color: '#000000',
                                  border: 'none',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '12px 20px',
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  cursor: isProcessingAction ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <Icons.Check size={16} color="#000000" />
                                <span>ACEPTAR TURNO</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={() => {
                                  setRejectModalBooking(booking);
                                  setRejectReason('Cancha ocupada presencialmente en el club');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-ash)',
                                  border: '1px solid var(--color-graphite)',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '10px 20px',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: isProcessingAction ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <Icons.Close size={14} />
                                <span>RECHAZAR</span>
                              </button>
                            </>
                          ) : isConfirmed ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--color-emerald)',
                                border: '1px solid var(--color-emerald)',
                                fontWeight: 700,
                                fontSize: '13px',
                                justifyContent: 'center',
                              }}
                            >
                              <Icons.Check size={15} />
                              <span>TURNO CONFIRMADO</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--color-ash)',
                                border: '1px solid var(--color-graphite)',
                                fontSize: '12px',
                                textAlign: 'center',
                              }}
                            >
                              <span style={{ fontWeight: 700, color: '#ef4444' }}>SOLICITUD RECHAZADA</span>
                              <span style={{ fontSize: '11px', color: 'var(--color-ash)' }}>
                                {booking.rejectReason || 'Fondos liberados'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Agenda de Turnos Confirmados de Hoy */}
            {todaysConfirmedBookings.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Agenda Confirmada de Hoy ({todaysConfirmedBookings.length})
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--color-ash)' }}>
                    {getTodayString()}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-obsidian)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    overflow: 'hidden',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-graphite)', backgroundColor: 'var(--color-surface-elevate)', color: 'var(--color-ash)', fontSize: '12px' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>HORARIO</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>CANCHA</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>JUGADOR TITULAR</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>CONTACTO</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>MONTO COBRADO</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysConfirmedBookings.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--color-graphite)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--color-frost)' }}>
                            {b.startTime} hs
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-frost)' }}>
                            {b.courtName}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-frost)' }}>
                            {b.buyer?.name || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-ash)' }}>
                            {b.buyer?.phone || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-emerald)' }}>
                            {formatCurrency(b.totalPrice)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--color-emerald)',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              <Icons.Check size={12} />
                              Confirmado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 2: PUBLICADOR DE TURNOS (MATRIZ ON/OFF RÁPIDA)
            ════════════════════════════════════════════════════════════ */}
        {activeTab === 'PUBLISH_SLOTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Context Explanation */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: 'var(--color-frost)' }}>
                  VENTA DE TURNOS VACANTES EN HAY EQUIPO
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: '13px', margin: 0, maxWidth: '650px' }}>
                  No reemplazamos tu sistema habitual. Marcá acá únicamente los horarios que tenés libres o que se te cayeron a último momento. Los jugadores en la app solo podrán solicitar los turnos que dejes en verde.
                </p>
              </div>

              {/* Batch Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleBatchPublishAfternoon}
                  style={{
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-crimson-signal)',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Publicar Tarde/Noche (17 a 23 hs)
                </button>
                <button
                  type="button"
                  onClick={handleBatchPublishAll}
                  style={{
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Publicar Todos
                </button>
                <button
                  type="button"
                  onClick={handleBatchUnpublishAll}
                  style={{
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-ash)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Pausar Todos
                </button>
              </div>
            </div>

            {/* Date Pill Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const dateMeta = getFormattedDate(offset);
                const isSelected = selectedDateOffset === offset;
                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setSelectedDateOffset(offset)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'var(--color-crimson-signal)' : 'var(--color-surface-elevate)',
                      color: isSelected ? '#ffffff' : 'var(--color-ash)',
                      border: isSelected ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                      cursor: 'pointer',
                      minWidth: '90px',
                      boxShadow: isSelected ? '0 0 16px rgba(252, 28, 70, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>{dateMeta.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>{dateMeta.sublabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Courts Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {courts.map((court) => {
                return (
                  <div
                    key={court.id}
                    style={{
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      padding: '20px 24px',
                    }}
                  >
                    {/* Court Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--color-frost)' }}>
                          {court.name}
                        </h4>
                        <SportBadge sports={[court.sportType]} size="sm" />
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-ash)', fontWeight: 600 }}>
                        Tarifa: <strong style={{ color: 'var(--color-frost)' }}>{formatCurrency(court.pricePerHour)}</strong> / turno
                      </div>
                    </div>

                    {/* Time Slots Pills Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                      {DEFAULT_TIME_SLOTS.map((time) => {
                        const slotKey = `${court.id}_${time}`;
                        const isPublished = !!publishedSlots[slotKey];

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleToggleSlot(court.id, time)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-elevate)',
                              color: isPublished ? 'var(--color-emerald)' : 'var(--color-ash)',
                              border: isPublished ? '1px solid var(--color-emerald)' : '1px solid var(--color-graphite)',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 700,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{time} hs</span>
                            {isPublished ? (
                              <Icons.Check size={14} color="var(--color-emerald)" />
                            ) : (
                              <span style={{ fontSize: '10px', opacity: 0.5 }}>LIBRE EN CLUB</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 3: MIS CANCHAS & TARIFAS
            ════════════════════════════════════════════════════════════ */}
        {activeTab === 'COURTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-frost)' }}>
                  CANCHAS REGISTRADAS
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-ash)', margin: 0 }}>
                  Ajustá los precios y características de tus canchas para que los jugadores vean los datos correctos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCourt({
                    id: `c-${Date.now()}`,
                    clubId: selectedClubId,
                    name: `Cancha ${courts.length + 1}`,
                    sportType: 'PADEL',
                    surface: 'Vidrio Panorámico 12mm · Césped Sintético',
                    pricePerHour: 32000,
                    durationMinutes: 90,
                    isCovered: true,
                    hasLighting: true,
                    active: true,
                  });
                  setIsEditCourtModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={15} />
                <span>+ AGREGAR CANCHA</span>
              </button>
            </div>

            {/* Grid of Courts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {courts.map((court) => (
                <div
                  key={court.id}
                  style={{
                    backgroundColor: 'var(--color-obsidian)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <SportBadge sports={[court.sportType]} size="sm" />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: court.active ? 'var(--color-emerald)' : '#ef4444',
                        }}
                      >
                        {court.active ? 'ACTIVA' : 'PAUSADA'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-frost)' }}>
                      {court.name}
                    </h4>

                    <p style={{ fontSize: '13px', color: 'var(--color-ash)', margin: '0 0 12px' }}>
                      {court.surface}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {court.isCovered && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)' }}>
                          Techada
                        </span>
                      )}
                      {court.hasLighting && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)' }}>
                          Luz LED
                        </span>
                      )}
                      <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)' }}>
                        Turno de {court.durationMinutes || 90} min
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-graphite)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-ash)', textTransform: 'uppercase' }}>Precio por turno</span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-emerald)' }}>
                        {formatCurrency(court.pricePerHour)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourt(court);
                        setIsEditCourtModalOpen(true);
                      }}
                      style={{
                        backgroundColor: 'var(--color-surface-elevate)',
                        color: 'var(--color-frost)',
                        border: '1px solid var(--color-graphite)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Editar Precio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 4: LIQUIDACIONES & BILLETERA
            ════════════════════════════════════════════════════════════ */}
        {activeTab === 'PAYOUTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Recaudado por Hay Equipo
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-frost)', marginTop: '4px' }}>
                  {formatCurrency(totalRevenue)}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-emerald)', marginTop: '4px', display: 'block' }}>
                  100% fondos garantizados y cobrados
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Turnos Concretados
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-frost)', marginTop: '4px' }}>
                  {confirmedCount}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '4px', display: 'block' }}>
                  Turnos que hubieran quedado vacíos
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Saldo a Transferir
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '4px' }}>
                  {formatCurrency(totalRevenue)}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-ash)', marginTop: '4px', display: 'block' }}>
                  Próxima liquidación: Cada Martes
                </span>
              </div>
            </div>

            {/* Payout Details & CBU Config */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: '24px',
                maxWidth: '600px',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-frost)' }}>
                DATOS BANCARIOS PARA TRANSFERENCIAS AUTOMÁTICAS
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-ash)', margin: '0 0 20px' }}>
                Ingresá el CBU o Alias de Mercado Pago donde querés recibir las liquidaciones semanales de los turnos cobrados.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-ash)', marginBottom: '6px', fontWeight: 600 }}>
                    ALIAS O CBU DEL CLUB
                  </label>
                  <input
                    type="text"
                    value={cbuAlias}
                    onChange={(e) => setCbuAlias(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-surface-elevate)',
                      color: 'var(--color-frost)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSavedAliasMsg(true);
                      setTimeout(() => setSavedAliasMsg(false), 3000);
                    }}
                    style={{
                      backgroundColor: 'var(--color-frost)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '9px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    GUARDAR DATOS
                  </button>

                  {savedAliasMsg && (
                    <span style={{ fontSize: '13px', color: 'var(--color-emerald)', fontWeight: 600 }}>
                      Datos de cobro actualizados correctamente
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ────────────────────────────────────────────────────────────
          MODAL: RECHAZAR SOLICITUD
          ──────────────────────────────────────────────────────────── */}
      {rejectModalBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '28px',
              maxWidth: '460px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-frost)' }}>
                Rechazar Solicitud #{rejectModalBooking.id}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-ash)', margin: 0 }}>
                La retención de dinero se le liberará al jugador inmediatamente sin costo. Elegí el motivo para informarle:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Cancha ocupada presencialmente en el club',
                'Horario no disponible / Cambio de turno',
                'Condiciones climáticas / Lluvia',
                'Mantenimiento imprevisto en la cancha',
                'Recepción cerrada fuera de horario',
              ].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRejectReason(m)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: rejectReason === m ? 'rgba(252, 28, 70, 0.15)' : 'var(--color-surface-elevate)',
                    color: rejectReason === m ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                    border: rejectReason === m ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleConfirmReject}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isProcessingAction ? 'not-allowed' : 'pointer',
                }}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL: EDITAR / AGREGAR CANCHA
          ──────────────────────────────────────────────────────────── */}
      {isEditCourtModalOpen && editingCourt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-frost)' }}>
              Configurar Cancha
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-ash)', marginBottom: '4px', fontWeight: 600 }}>
                Nombre de la Cancha
              </label>
              <input
                type="text"
                value={editingCourt.name}
                onChange={(e) => setEditingCourt({ ...editingCourt, name: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '9px 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-ash)', marginBottom: '4px', fontWeight: 600 }}>
                  Deporte
                </label>
                <select
                  value={editingCourt.sportType}
                  onChange={(e) => setEditingCourt({ ...editingCourt, sportType: e.target.value as any })}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '9px 12px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="PADEL">Pádel</option>
                  <option value="FUTBOL_5">Fútbol 5</option>
                  <option value="FUTBOL_7">Fútbol 7</option>
                  <option value="FUTBOL_11">Fútbol 11</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-ash)', marginBottom: '4px', fontWeight: 600 }}>
                  Precio por Turno ($)
                </label>
                <input
                  type="number"
                  value={editingCourt.pricePerHour}
                  onChange={(e) => setEditingCourt({ ...editingCourt, pricePerHour: Number(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '9px 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-ash)', marginBottom: '4px', fontWeight: 600 }}>
                Superficie / Descripción
              </label>
              <input
                type="text"
                value={editingCourt.surface}
                onChange={(e) => setEditingCourt({ ...editingCourt, surface: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setIsEditCourtModalOpen(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const exists = courts.some((c) => c.id === editingCourt.id);
                  let updatedList: CourtData[];
                  if (exists) {
                    updatedList = courts.map((c) => (c.id === editingCourt.id ? editingCourt : c));
                  } else {
                    updatedList = [...courts, editingCourt];
                  }
                  setCourts(updatedList);
                  await saveCourtsFirestore(updatedList);
                  setIsEditCourtModalOpen(false);
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Guardar Cancha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
