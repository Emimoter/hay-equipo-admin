import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  getClubsFirestore,
  getCourtsFirestore,
  saveCourtsFirestore,
  listenClubBookingsFirestore,
  updateBookingStatusFirestore,
  getClubPublishedSlotsFirestore,
  saveClubPublishedSlotsFirestore,
  linkClubAdminEmailFirestore,
  BookingRecord,
} from '../services/firebase';
import { SportBadge } from '../components/SportBadge';
import { useSlidingIndicator } from '../hooks/useSlidingIndicator';

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

type ClubTab = 'REQUESTS' | 'PUBLISH_SLOTS' | 'COURTS' | 'PAYOUTS';

interface CourtItem {
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

const DEFAULT_HOURS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30',
  '17:00', '18:30', '20:00', '21:30', '23:00'
];

/* ────────────────────────────────────────────────────────────
   Vector Icons (Strict Zero-Emoji Compliance)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  Bell: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Volume: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeX: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  Check: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Close: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
      <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  Plus: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  DollarSign: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  LogOut: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Google: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  ),
  UserCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Audio Chime (Web Audio API)
   ──────────────────────────────────────────────────────────── */

function playRequestAlertChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(740, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(988, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
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

  return { value: val, label, sublabel: `${day}/${month}` };
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT: /club (TERMINAL EXCLUSIVA DE CLUBES)
   ──────────────────────────────────────────────────────────── */

export default function ClubPage() {
  const router = useRouter();
  const { user, userProfile, loginWithGoogle, loginWithEmail, logout, loading: authLoading } = useAuth();

  // Club session state
  const [activeClub, setActiveClub] = useState<any | null>(null);
  const [clubsList, setClubsList] = useState<any[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);

  // Manual linking claim input
  const [claimInput, setClaimInput] = useState('');
  const [claimMessage, setClaimMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isLinkingClaim, setIsLinkingClaim] = useState(false);

  // Add staff email modal
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [staffModalSuccess, setStaffModalSuccess] = useState(false);

  // Reception controls
  const [isReceptionOpen, setIsReceptionOpen] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<ClubTab>('REQUESTS');
  const { containerRef, setItemRef, indicatorStyle } = useSlidingIndicator<ClubTab>(activeTab);

  // Real Data (100% Firebase, ZERO MOCKS)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Solicitudes Filter
  const [requestFilter, setRequestFilter] = useState<'PENDING' | 'ALL' | 'CONFIRMED' | 'REJECTED'>('PENDING');

  // Rejection modal
  const [rejectBooking, setRejectBooking] = useState<BookingRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Cancha ocupada presencialmente en el club');
  const [isActionPending, setIsActionPending] = useState(false);

  // Published slots
  const [dateOffset, setDateOffset] = useState(0);
  const [publishedSlots, setPublishedSlots] = useState<Record<string, boolean>>({});

  // Court edit/add modal
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtItem | null>(null);

  // Payout alias
  const [cbuAlias, setCbuAlias] = useState('');
  const [aliasSaved, setAliasSaved] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Audio alert tracking
  const knownPendingIds = useRef<Set<string>>(new Set());

  // 1. Fetch available clubs from Firestore and detect match with user's Google Account
  const loadClubsAndMatch = useCallback(async () => {
    setIsLoadingClubs(true);
    const data = await getClubsFirestore();
    const loadedList = Array.isArray(data) ? data : [];
    setClubsList(loadedList);

    // If user is authenticated, resolve their club
    if (user?.email) {
      const userEmail = user.email.trim().toLowerCase();
      const userUid = user.uid;

      // Check URL for auto-claim / linking param
      const claimParam = (router.query.vincular || router.query.claim) as string;
      if (claimParam) {
        const targetClub = loadedList.find(
          (c: any) => c.id === claimParam || c.slug === claimParam
        );
        if (targetClub) {
          await linkClubAdminEmailFirestore(targetClub.id, userEmail, userUid);
          setActiveClub(targetClub);
          setIsLoadingClubs(false);
          return;
        }
      }

      // Normal lookup: match adminEmails array or adminEmail or ownerUid
      const matched = loadedList.find((c: any) => {
        const emails: string[] = Array.isArray(c.adminEmails)
          ? c.adminEmails.map((e: string) => String(e).trim().toLowerCase())
          : c.adminEmail ? [String(c.adminEmail).trim().toLowerCase()] : [];

        const matchesEmail = emails.includes(userEmail);
        const matchesUid = c.ownerUid && c.ownerUid === userUid;
        return matchesEmail || matchesUid;
      });

      if (matched) {
        setActiveClub(matched);
      } else {
        setActiveClub(null);
      }
    } else {
      setActiveClub(null);
    }

    setIsLoadingClubs(false);
  }, [user, router.query]);

  useEffect(() => {
    loadClubsAndMatch();
  }, [loadClubsAndMatch]);

  // 2. Load Real Courts for Active Club ONLY (No mocks)
  const loadClubCourts = useCallback(async () => {
    if (!activeClub?.id) return;
    setIsLoadingData(true);
    const allCourts = await getCourtsFirestore();
    if (Array.isArray(allCourts)) {
      const filtered = allCourts.filter((c: any) => c.clubId === activeClub.id);
      setCourts(filtered);
    } else {
      setCourts([]);
    }
    setIsLoadingData(false);
  }, [activeClub?.id]);

  useEffect(() => {
    loadClubCourts();
  }, [loadClubCourts]);

  // 3. Listen to Real-time Bookings for Active Club ONLY
  useEffect(() => {
    if (!activeClub?.id) return;

    const unsubscribe = listenClubBookingsFirestore(activeClub.id, (clubBookings) => {
      setBookings(clubBookings);

      // Trigger audio chime only on brand new PENDING requests
      const pendings = clubBookings.filter((b) => b.status === 'PENDING');
      const brandNew = pendings.filter((b) => !knownPendingIds.current.has(b.id));

      if (brandNew.length > 0 && isSoundOn) {
        playRequestAlertChime();
      }

      knownPendingIds.current = new Set(pendings.map((b) => b.id));
    });

    return () => {
      unsubscribe();
    };
  }, [activeClub?.id, isSoundOn]);

  // 4. Update Tab Title with pending counter
  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'PENDING').length;
  }, [bookings]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) ¡SOLICITUD! — Hay Equipo Club`;
    } else {
      document.title = activeClub?.name ? `${activeClub.name} — Terminal Club` : 'Terminal Club — Hay Equipo?';
    }
  }, [pendingCount, activeClub?.name]);

  // 5. Load Published Slots for Selected Date
  const currentDate = useMemo(() => getFormattedDate(dateOffset), [dateOffset]);

  useEffect(() => {
    async function fetchSlots() {
      if (!activeClub?.id) return;
      const slots = await getClubPublishedSlotsFirestore(activeClub.id, currentDate.value);
      setPublishedSlots(slots || {});
    }
    fetchSlots();
  }, [activeClub?.id, currentDate.value]);

  // Handle slot toggle
  const handleToggleSlot = async (courtId: string, time: string) => {
    if (!activeClub?.id) return;
    const slotKey = `${courtId}_${time}`;
    const nextState = !publishedSlots[slotKey];
    const updated = { ...publishedSlots, [slotKey]: nextState };
    setPublishedSlots(updated);
    await saveClubPublishedSlotsFirestore(activeClub.id, currentDate.value, updated);
  };

  // Actions: Accept / Reject Booking
  const handleAccept = async (bookingId: string) => {
    setIsActionPending(true);
    try {
      await updateBookingStatusFirestore(bookingId, 'CONFIRMED');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : b))
      );
    } catch (err) {
      console.error('Error accepting:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectBooking) return;
    setIsActionPending(true);
    try {
      await updateBookingStatusFirestore(rejectBooking.id, 'REJECTED', rejectReason);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rejectBooking.id
            ? { ...b, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectReason }
            : b
        )
      );
      setRejectBooking(null);
    } catch (err) {
      console.error('Error rejecting:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  // Self-claim handler when user types club slug or ID
  const handleClaimClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim() || !user?.email) return;

    setIsLinkingClaim(true);
    setClaimMessage(null);

    const clean = claimInput.trim().toLowerCase();
    const target = clubsList.find(
      (c) => c.id.toLowerCase() === clean || (c.slug && c.slug.toLowerCase() === clean) || c.name.toLowerCase() === clean
    );

    if (!target) {
      setClaimMessage({
        text: `No encontramos ningún club con el código o nombre "${claimInput}". Verificalo o pedíselo al soporte de Hay Equipo.`,
        type: 'error',
      });
      setIsLinkingClaim(false);
      return;
    }

    const success = await linkClubAdminEmailFirestore(target.id, user.email, user.uid);
    if (success) {
      setClaimMessage({
        text: `¡Vinculación exitosa con ${target.name}! Ingresando al panel...`,
        type: 'success',
      });
      await loadClubsAndMatch();
    } else {
      setClaimMessage({
        text: 'Hubo un inconveniente al guardar la vinculación. Reintentá en unos segundos.',
        type: 'error',
      });
    }
    setIsLinkingClaim(false);
  };

  // Add staff email to active club
  const handleAddStaffEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !activeClub?.id) return;
    const success = await linkClubAdminEmailFirestore(activeClub.id, newStaffEmail.trim());
    if (success) {
      setStaffModalSuccess(true);
      setTimeout(() => {
        setStaffModalSuccess(false);
        setIsAddStaffModalOpen(false);
        setNewStaffEmail('');
      }, 2000);
      await loadClubsAndMatch();
    }
  };

  // Login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Ingresá tu correo y contraseña.');
      return;
    }
    setIsLoggingIn(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filtered requests list
  const visibleBookings = useMemo(() => {
    if (requestFilter === 'PENDING') return bookings.filter((b) => b.status === 'PENDING');
    if (requestFilter === 'CONFIRMED') return bookings.filter((b) => b.status === 'CONFIRMED');
    if (requestFilter === 'REJECTED') return bookings.filter((b) => b.status === 'REJECTED');
    return bookings;
  }, [bookings, requestFilter]);

  const confirmedRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((acc, b) => acc + (Number(b.totalPrice) || 0), 0);
  }, [bookings]);

  /* ────────────────────────────────────────────────────────────
     VIEW 1: NO USER LOGGED IN -> Clean Google & Email Login
     ──────────────────────────────────────────────────────────── */
  if (!authLoading && !user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
        <Head>
          <title>Acceso Clubes — Hay Equipo?</title>
        </Head>

        {/* Minimal High-End Header */}
        <header
          style={{
            height: 72,
            padding: '0 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
              HAY EQUIPO?
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-ash)', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              / Terminal Exclusiva Clubes
            </span>
          </div>

          <Link
            href="/"
            style={{
              color: 'var(--color-ash)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-graphite)',
            }}
          >
            ← Volver al Inicio
          </Link>
        </header>

        {/* Login Box */}
        <div style={{ maxWidth: 460, margin: '80px auto', padding: '0 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '40px 32px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-crimson-signal)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                TERMINAL DE DESPACHO
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 6px', color: 'var(--color-frost)' }}>
                Ingresá con tu Cuenta
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                Entrá con tu cuenta de Google para acceder a las solicitudes y turnos de tu club.
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  backgroundColor: 'rgba(252, 28, 70, 0.12)',
                  border: '1px solid var(--color-crimson-signal)',
                  color: 'var(--color-crimson-signal)',
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: '0px',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                {loginError}
              </div>
            )}

            {/* Google 1-Click Login (Primary Action) */}
            <button
              type="button"
              onClick={async () => {
                setLoginError('');
                try {
                  await loginWithGoogle();
                } catch (err: any) {
                  setLoginError(err?.message || 'Error al conectar con Google.');
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                backgroundColor: 'var(--color-surface-elevate)',
                color: 'var(--color-frost)',
                border: '1px solid var(--color-graphite)',
                borderRadius: 'var(--radius-full)',
                padding: '14px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: 20,
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Google size={18} />
              <span>Continuar con Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase' }}>o con email</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CORREO ELECTRÓNICO DEL CLUB
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@tuclub.com"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  marginTop: 8,
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {isLoggingIn ? 'Ingresando...' : 'INGRESAR A MI CLUB →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--color-ash)' }}>
              ¿Sos un complejo nuevo?{' '}
              <Link href="/registro-club" style={{ color: 'var(--color-frost)', fontWeight: 700, textDecoration: 'underline' }}>
                Registrá tu club acá
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     VIEW 2: LOGGED IN WITH GOOGLE BUT NO CLUB LINKED YET
     ──────────────────────────────────────────────────────────── */
  if (user && !isLoadingClubs && !activeClub) {
    const waHelpUrl = `https://wa.me/5492235948332?text=Hola!%20Inicié%20sesión%20con%20Google%20en%20Hay%20Equipo%20(${encodeURIComponent(user.email || '')})%20y%20quiero%20vincular%20mi%20club.`;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
        <Head>
          <title>Cuenta sin Club — Hay Equipo?</title>
        </Head>

        <header
          style={{
            height: 72,
            padding: '0 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
              HAY EQUIPO?
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-ash)', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              / Terminal de Clubes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              title={`Sesión iniciada: ${user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
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
                  {(userProfile?.name || user.displayName || user.email || 'U').substring(0, 1).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {(userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Usuario').split(' ')[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--color-ash)',
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid var(--color-graphite)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              <Icons.LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '40px 32px',
            }}
          >
            {/* User identification badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '10px 14px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: '0px', border: '1px solid var(--color-graphite)' }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>{user.displayName || 'Usuario de Google'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ash)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
              </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-frost)' }}>
              Esta cuenta aún no tiene un club asignado
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Para que tu club aparezca acá automáticamente cada vez que entres con Google, pedile al administrador de Hay Equipo que agregue tu correo <strong>({user.email})</strong> a la ficha de tu club.
            </p>

            {/* Direct WhatsApp request button */}
            <a
              href={waHelpUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#25D366',
                color: '#000000',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                marginBottom: 24,
              }}
            >
              <Icons.WhatsApp size={16} color="#000000" />
              <span>Solicitar Asignación por WhatsApp</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase' }}>o vinculá con tu código</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
            </div>

            {/* Quick claim form */}
            <form onSubmit={handleClaimClub} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CÓDIGO O SLUG DE TU CLUB (EJ: club-laverde-jara)
                </label>
                <input
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="club-..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {claimMessage && (
                <div
                  style={{
                    fontSize: 12,
                    color: claimMessage.type === 'error' ? '#ef4444' : 'var(--color-emerald)',
                    fontWeight: 600,
                  }}
                >
                  {claimMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLinkingClaim}
                style={{
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isLinkingClaim ? 'not-allowed' : 'pointer',
                }}
              >
                {isLinkingClaim ? 'Verificando...' : 'VINCULAR MI CUENTA A ESTE CLUB'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     VIEW 3: MAIN CLUB OPERATIONS TERMINAL (AUTHENTICATED & LINKED)
     ──────────────────────────────────────────────────────────── */

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
      <Head>
        <title>{pendingCount > 0 ? `(${pendingCount}) ¡SOLICITUD! — Hay Equipo Club` : `${activeClub?.name || 'Club'} — Terminal Club`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          HEADER — Exact Match with Landing Page Aesthetics
          ═══════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 72,
          padding: '0 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-ash)', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
            / Terminal de Clubes
          </span>
        </div>

        {/* Right: Club Identity & Real-time Reception Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Active Club Name Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              backgroundColor: 'var(--color-surface-elevate)',
              border: '1px solid var(--color-graphite)',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span style={{ color: 'var(--color-ash)', fontWeight: 500 }}>Club:</span>
            <span style={{ color: 'var(--color-frost)' }}>{activeClub?.name || 'Mi Club'}</span>
          </div>

          {/* Google User Profile Pill */}
          {user && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              title={`Sesión iniciada: ${user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
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
                  {(userProfile?.name || user.displayName || user.email || 'A').substring(0, 1).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {(userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Admin').split(' ')[0]}
              </span>
            </div>
          )}

          {/* Add Staff / Recepcionista Gmail Button */}
          <button
            type="button"
            onClick={() => setIsAddStaffModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'transparent',
              color: 'var(--color-ash)',
              border: '1px dashed var(--color-graphite)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Agregar otro Gmail autorizado para este club (ej: recepcionista o canchero)"
          >
            <Icons.UserCheck size={13} />
            <span>+ Encargado</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isSoundOn;
              setIsSoundOn(next);
              if (next) playRequestAlertChime();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: isSoundOn ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-elevate)',
              color: isSoundOn ? 'var(--color-emerald)' : 'var(--color-ash)',
              border: isSoundOn ? '1px solid var(--color-emerald)' : '1px solid var(--color-graphite)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title={isSoundOn ? 'Audio activo' : 'Audio silenciado'}
          >
            {isSoundOn ? <Icons.Volume size={14} /> : <Icons.VolumeX size={14} />}
            <span>{isSoundOn ? 'AUDIO' : 'MUTE'}</span>
          </button>

          {/* Reception Status Indicator */}
          <button
            type="button"
            onClick={() => setIsReceptionOpen(!isReceptionOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: isReceptionOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: isReceptionOpen ? 'var(--color-emerald)' : '#ef4444',
              border: isReceptionOpen ? '1px solid var(--color-emerald)' : '1px solid #ef4444',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isReceptionOpen ? 'var(--color-emerald)' : '#ef4444',
              }}
            />
            <span>{isReceptionOpen ? 'ONLINE' : 'PAUSADO'}</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={async () => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('hayequipo_club_session');
                localStorage.removeItem('hayequipo_club_id');
              }
              await logout();
              router.push('/club');
            }}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-ash)',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 8px',
            }}
            title="Cerrar sesión"
          >
            <Icons.LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          SUB-HEADER: Sliding Pill Navigation Bar
          ═══════════════════════════════════════════════════════ */}
      <div
        style={{
          borderBottom: '1px solid var(--color-graphite)',
          backgroundColor: 'var(--color-obsidian)',
          padding: '12px 36px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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

            <button
              ref={setItemRef('REQUESTS')}
              onClick={() => setActiveTab('REQUESTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
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
              {pendingCount > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'REQUESTS' ? '#ffffff' : 'var(--color-crimson-signal)',
                    color: activeTab === 'REQUESTS' ? 'var(--color-crimson-signal)' : '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              ref={setItemRef('PUBLISH_SLOTS')}
              onClick={() => setActiveTab('PUBLISH_SLOTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
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

            <button
              ref={setItemRef('COURTS')}
              onClick={() => setActiveTab('COURTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
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

            <button
              ref={setItemRef('PAYOUTS')}
              onClick={() => setActiveTab('PAYOUTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
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

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT AREA (ZERO MOCKS, 100% FIREBASE REAL DATA)
          ═══════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 36px 80px' }}>

        {/* ─── TAB 1: SOLICITUDES EN VIVO ─── */}
        {activeTab === 'REQUESTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(['PENDING', 'ALL', 'CONFIRMED', 'REJECTED'] as const).map((key) => {
                  const titles = {
                    PENDING: `SOLICITUDES PENDIENTES (${pendingCount})`,
                    ALL: `TODAS (${bookings.length})`,
                    CONFIRMED: `CONFIRMADAS (${bookings.filter((b) => b.status === 'CONFIRMED').length})`,
                    REJECTED: `RECHAZADAS (${bookings.filter((b) => b.status === 'REJECTED').length})`,
                  };
                  const active = requestFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRequestFilter(key)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: active ? 'var(--color-frost)' : 'var(--color-surface-elevate)',
                        color: active ? '#000000' : 'var(--color-ash)',
                        border: active ? '1px solid var(--color-frost)' : '1px solid var(--color-graphite)',
                        cursor: 'pointer',
                      }}
                    >
                      {titles[key]}
                    </button>
                  );
                })}
              </div>

              {pendingCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-crimson-signal)', fontSize: 13, fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)' }} />
                  <span>{pendingCount} {pendingCount === 1 ? 'solicitud esperando respuesta' : 'solicitudes esperando respuesta'}</span>
                </div>
              )}
            </div>

            {/* Requests list */}
            {visibleBookings.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '64px 24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', padding: 16, backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', marginBottom: 16 }}>
                  <Icons.Bell size={28} color="var(--color-ash)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                  {requestFilter === 'PENDING' ? 'No tenés solicitudes pendientes ahora mismo' : 'No hay reservas registradas en este estado'}
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
                  Cuando un jugador elija una cancha libre desde la web o app de Hay Equipo, su solicitud aparecerá acá con alerta sonora para aceptar o rechazar en 1 click.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {visibleBookings.map((b) => {
                  const isPending = b.status === 'PENDING';
                  const isConfirmed = b.status === 'CONFIRMED';
                  const cleanPhone = (b.buyer?.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(b.buyer?.name || '')},%20te%20escribimos%20desde%20${encodeURIComponent(activeClub?.name || 'el club')}%20sobre%20tu%20reserva%20en%20Hay%20Equipo.`;

                  return (
                    <div
                      key={b.id}
                      style={{
                        backgroundColor: 'var(--color-obsidian)',
                        border: isPending ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                        borderLeft: isPending ? '4px solid var(--color-crimson-signal)' : isConfirmed ? '4px solid var(--color-emerald)' : '4px solid #64748b',
                        borderRadius: '0px',
                        padding: '20px 24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: '1 1 340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: isPending ? 'rgba(252, 28, 70, 0.2)' : isConfirmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                color: isPending ? 'var(--color-crimson-signal)' : isConfirmed ? 'var(--color-emerald)' : 'var(--color-ash)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {isPending ? 'SOLICITUD ENTRANTE' : isConfirmed ? 'TURNO CONFIRMADO' : 'RECHAZADO'}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 600 }}>#{b.id}</span>
                            <SportBadge sports={[b.sport]} size="sm" />
                          </div>

                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-frost)', marginBottom: 6 }}>
                            {b.courtName}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--color-ash)', marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-frost)', fontWeight: 600 }}>
                              <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                              {b.date}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-frost)', fontWeight: 700 }}>
                              <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                              {b.startTime} hs {b.endTime ? `a ${b.endTime} hs` : ''}
                            </span>
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                              {formatCurrency(b.totalPrice)} {b.paymentType === 'SPLIT' ? '· SPLIT' : '· TOTAL'}
                            </span>
                          </div>

                          {/* Player Identity */}
                          <div
                            style={{
                              padding: '10px 14px',
                              backgroundColor: 'var(--color-surface-elevate)',
                              borderRadius: '0px',
                              border: '1px solid var(--color-graphite)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 12,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-frost)' }}>
                                {b.buyer?.name || 'Jugador'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-ash)' }}>
                                {b.buyer?.phone || 'Sin teléfono'}
                              </div>
                            </div>

                            {cleanPhone && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  backgroundColor: '#25D366',
                                  color: '#000000',
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: 12,
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

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isActionPending}
                                onClick={() => handleAccept(b.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  backgroundColor: 'var(--color-emerald)',
                                  color: '#000000',
                                  border: 'none',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '12px 20px',
                                  fontSize: 14,
                                  fontWeight: 800,
                                  cursor: isActionPending ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Icons.Check size={16} color="#000000" />
                                <span>ACEPTAR TURNO</span>
                              </button>

                              <button
                                type="button"
                                disabled={isActionPending}
                                onClick={() => setRejectBooking(b)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-ash)',
                                  border: '1px solid var(--color-graphite)',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '10px 20px',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: isActionPending ? 'not-allowed' : 'pointer',
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
                                justifyContent: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--color-emerald)',
                                border: '1px solid var(--color-emerald)',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              <Icons.Check size={14} />
                              <span>CONFIRMADO</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--color-ash)',
                                border: '1px solid var(--color-graphite)',
                                fontSize: 12,
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ color: '#ef4444', fontWeight: 700 }}>RECHAZADO</div>
                              <div style={{ fontSize: 11, opacity: 0.8 }}>{b.rejectReason || 'Cancelado'}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: PUBLICAR TURNOS VACANTES ─── */}
        {activeTab === 'PUBLISH_SLOTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header info */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: '18px 24px',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>
                PUBLICAR TURNOS VACANTES
              </h3>
              <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: 0 }}>
                Habilitá únicamente los horarios que tenés libres o que se cancelaron a último momento. Los jugadores solo verán en verde los turnos que marques acá.
              </p>
            </div>

            {/* Date Pill Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const item = getFormattedDate(offset);
                const isSelected = dateOffset === offset;
                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setDateOffset(offset)}
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
                      minWidth: 90,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{item.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{item.sublabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Court Slots Grid */}
            {courts.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--color-ash)', fontSize: 14, margin: '0 0 16px' }}>
                  No tenés canchas registradas en Firebase para este club todavía.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('COURTS')}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Ir a Mis Canchas para crear una
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {courts.map((court) => (
                  <div
                    key={court.id}
                    style={{
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      padding: '20px 24px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h4 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{court.name}</h4>
                        <SportBadge sports={[court.sportType]} size="sm" />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--color-ash)' }}>
                        Tarifa: <strong style={{ color: 'var(--color-frost)' }}>{formatCurrency(court.pricePerHour)}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                      {DEFAULT_HOURS.map((hour) => {
                        const key = `${court.id}_${hour}`;
                        const isPublished = !!publishedSlots[key];

                        return (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => handleToggleSlot(court.id, hour)}
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
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            <span>{hour} hs</span>
                            {isPublished ? <Icons.Check size={14} color="var(--color-emerald)" /> : <span style={{ fontSize: 10, opacity: 0.5 }}>LIBRE</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: MIS CANCHAS ─── */}
        {activeTab === 'COURTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
                  CANCHAS REGISTRADAS
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                  Datos reales guardados en Firebase para {activeClub?.name || 'tu club'}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCourt({
                    id: `court_${Date.now()}`,
                    clubId: activeClub?.id || 'club_1',
                    name: `Cancha ${courts.length + 1}`,
                    sportType: 'PADEL',
                    surface: 'Vidrio Panorámico 12mm · Césped Sintético',
                    pricePerHour: 32000,
                    durationMinutes: 90,
                    isCovered: true,
                    hasLighting: true,
                    active: true,
                  });
                  setIsCourtModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={15} />
                <span>+ AGREGAR CANCHA</span>
              </button>
            </div>

            {courts.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '56px 24px',
                  textAlign: 'center',
                }}
              >
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
                  No tenés canchas registradas en Firebase para este club
                </h4>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, maxWidth: 440, margin: '0 auto 20px' }}>
                  Hacé click en "+ AGREGAR CANCHA" para dar de alta tu primera cancha y asignarle su deporte y precio.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
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
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <SportBadge sports={[court.sportType]} size="sm" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: court.active ? 'var(--color-emerald)' : '#ef4444' }}>
                          {court.active ? 'ACTIVA' : 'PAUSADA'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>{court.name}</h4>
                      <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: '0 0 12px' }}>{court.surface}</p>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {court.isCovered && (
                          <span style={{ fontSize: 11, padding: '3px 8px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)' }}>
                            Techada
                          </span>
                        )}
                        {court.hasLighting && (
                          <span style={{ fontSize: 11, padding: '3px 8px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)' }}>
                            Luz LED
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-graphite)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase' }}>Precio por turno</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-emerald)' }}>
                          {formatCurrency(court.pricePerHour)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCourt(court);
                          setIsCourtModalOpen(true);
                        }}
                        style={{
                          backgroundColor: 'var(--color-surface-elevate)',
                          color: 'var(--color-frost)',
                          border: '1px solid var(--color-graphite)',
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: LIQUIDACIONES & BILLETERA ─── */}
        {activeTab === 'PAYOUTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Cobrado en Hay Equipo
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-frost)', marginTop: 4 }}>
                  {formatCurrency(confirmedRevenue)}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-emerald)', marginTop: 4, display: 'block' }}>
                  Fondos confirmados
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Turnos Concretados
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-frost)', marginTop: 4 }}>
                  {bookings.filter((b) => b.status === 'CONFIRMED').length}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', marginTop: 4, display: 'block' }}>
                  Reservas aceptadas
                </span>
              </div>
            </div>

            {/* Bank info form */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: 24,
                maxWidth: 600,
              }}
            >
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                DATOS DE TRANSFERENCIA
              </h4>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: '0 0 16px' }}>
                Ingresá el CBU o Alias donde recibirás las liquidaciones de reservas de {activeClub?.name || 'tu club'}.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="text"
                  value={cbuAlias}
                  placeholder="ALIAS.MP o CBU"
                  onChange={(e) => setCbuAlias(e.target.value.toUpperCase())}
                  style={{
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAliasSaved(true);
                      setTimeout(() => setAliasSaved(false), 3000);
                    }}
                    style={{
                      backgroundColor: 'var(--color-frost)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '9px 20px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    GUARDAR DATOS
                  </button>

                  {aliasSaved && (
                    <span style={{ fontSize: 13, color: 'var(--color-emerald)', fontWeight: 600 }}>
                      Guardado con éxito
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─── MODAL: AGREGAR GMAIL DE ENCARGADO / RECEPCIONISTA ─── */}
      {isAddStaffModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: 28,
              maxWidth: 440,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--color-frost)' }}>
                Agregar Encargado o Recepcionista
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                Ingresá el Gmail de la persona que atiende en el club para que también pueda entrar a este panel tocando &quot;Continuar con Google&quot;.
              </p>
            </div>

            <form onSubmit={handleAddStaffEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="email"
                required
                placeholder="recepcion.tuclub@gmail.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '10px 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />

              {staffModalSuccess && (
                <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 600 }}>
                  ¡Encargado vinculado correctamente!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-ash)',
                    border: '1px solid var(--color-graphite)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Guardar Encargado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECHAZAR SOLICITUD ─── */}
      {rejectBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: 28,
              maxWidth: 440,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Rechazar Solicitud</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                El dinero se le liberará al jugador inmediatamente sin costo. Seleccioná el motivo:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Cancha ocupada presencialmente en el club',
                'Horario no disponible / Cambio de turno',
                'Condiciones climáticas / Lluvia',
                'Mantenimiento en cancha',
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
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setRejectBooking(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmReject}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isActionPending ? 'not-allowed' : 'pointer',
                }}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: AGREGAR / EDITAR CANCHA ─── */}
      {isCourtModalOpen && editingCourt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: 28,
              maxWidth: 460,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Configurar Cancha</h3>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 4 }}>
                Nombre de Cancha
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
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 4 }}>
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
                    fontSize: 13,
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
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 4 }}>
                  Precio Turno ($)
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
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 4 }}>
                Superficie / Piso
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
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsCourtModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const allCourts = (await getCourtsFirestore()) || [];
                  const exists = allCourts.some((c: any) => c.id === editingCourt.id);
                  let updatedList: CourtItem[];
                  if (exists) {
                    updatedList = allCourts.map((c: any) => (c.id === editingCourt.id ? editingCourt : c));
                  } else {
                    updatedList = [...allCourts, editingCourt];
                  }
                  await saveCourtsFirestore(updatedList);
                  await loadClubCourts();
                  setIsCourtModalOpen(false);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
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
