import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  getClubsFirestore,
  getAllActiveSlotsFirestore,
  saveUserFixedSlotFirestore,
  BookingRecord,
  FixedSlotSubscriptionFirestore,
  RecurringOccurrenceFirestore,
} from '../services/firebase';

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
  ShieldCheck: ({ size = 16, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Lock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
  Repeat: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  CheckCircle: ({ size = 18, color = '#10b981' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  WhatsApp: ({ size = 15, color = '#25D366' }: { size?: number; color?: string }) => (
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
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userProfile, openAuthModal } = useAuth();

  // Query parameters
  const {
    clubId: queryClubId,
    slotId: querySlotId,
    date: queryDate,
    time: queryTime,
    price: queryPrice,
    court: queryCourt,
    sport: querySport,
    isFixed: queryIsFixed,
  } = router.query;

  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any | null>(null);
  const [slot, setSlot] = useState<any | null>(null);

  // Checkout configuration options
  const [paymentType, setPaymentType] = useState<'FULL' | 'SPLIT'>('SPLIT');
  const [splitPlayers, setSplitPlayers] = useState<number>(4);
  const [slotBookingMode, setSlotBookingMode] = useState<'SINGLE' | 'FIXED_RECURRING'>('SINGLE');
  const [fixedDurationMonths, setFixedDurationMonths] = useState<1 | 3 | 6>(1);

  // Buyer Info
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Processing & Confirmation state
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
  const [copiedSplitLink, setCopiedSplitLink] = useState(false);

  // 7-minute countdown hold timer
  const [holdTimer, setHoldTimer] = useState<number>(420);
  useEffect(() => {
    if (confirmedBooking) return;
    const interval = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmedBooking]);

  const timerDisplay = useMemo(() => {
    const mins = Math.floor(holdTimer / 60);
    const secs = holdTimer % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [holdTimer]);

  // Autofill buyer info when auth state is ready
  useEffect(() => {
    if (userProfile?.name && !buyerName) setBuyerName(userProfile.name);
    if (user?.displayName && !buyerName) setBuyerName(user.displayName);
    if (userProfile?.phone && !buyerPhone) setBuyerPhone(userProfile.phone);
    if (user?.email && !buyerEmail) setBuyerEmail(user.email);
  }, [user, userProfile]);

  // Load club & slot details
  useEffect(() => {
    if (!router.isReady) return;

    const clubId = typeof queryClubId === 'string' ? queryClubId : '';
    const slotId = typeof querySlotId === 'string' ? querySlotId : '';

    async function loadData() {
      setLoading(true);
      try {
        const [allClubs, allSlots] = await Promise.all([
          getClubsFirestore(),
          getAllActiveSlotsFirestore(),
        ]);

        const matchedClub = allClubs.find((c: any) => c.id === clubId);
        const matchedSlot = allSlots.find((s: any) => s.id === slotId);

        if (matchedClub) {
          setClub(matchedClub);
        } else if (clubId) {
          setClub({
            id: clubId,
            name: typeof router.query.clubName === 'string' ? router.query.clubName : 'Club Deportivo',
            address: 'Mar del Plata',
            city: 'Mar del Plata',
          });
        }

        if (matchedSlot) {
          setSlot(matchedSlot);
          const isPadel = (matchedSlot.sportType || (matchedSlot as any).sport || '').toUpperCase().includes('PADEL');
          setSplitPlayers(isPadel ? 4 : (matchedSlot.courtName?.includes('7') ? 14 : 10));
          if (matchedSlot.isFixedSlot || queryIsFixed === 'true') {
            setSlotBookingMode('FIXED_RECURRING');
          }
        } else {
          // Fallback from query params for instant load
          const parsedPrice = typeof queryPrice === 'string' ? parseInt(queryPrice, 10) : 28000;
          const isPadel = (typeof querySport === 'string' ? querySport : 'PADEL').toUpperCase().includes('PADEL');
          setSlot({
            id: slotId || 'slot-selected',
            courtName: typeof queryCourt === 'string' ? queryCourt : 'Cancha Principal',
            date: typeof queryDate === 'string' ? queryDate : 'Hoy',
            startTime: typeof queryTime === 'string' ? queryTime : '19:00',
            endTime: '20:30',
            price: parsedPrice,
            sport: isPadel ? 'PADEL' : 'FUTBOL',
            isFixedSlot: queryIsFixed === 'true',
          });
          setSplitPlayers(isPadel ? 4 : 10);
          if (queryIsFixed === 'true') {
            setSlotBookingMode('FIXED_RECURRING');
          }
        }
      } catch (e) {
        console.error('Error loading checkout slot:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router.isReady, queryClubId, querySlotId]);

  // Calculations
  const basePrice = slot ? slot.price : 28000;
  const isRecurring = slotBookingMode === 'FIXED_RECURRING';
  const discountRate = isRecurring
    ? (fixedDurationMonths === 1 ? 0.05 : fixedDurationMonths === 3 ? 0.12 : 0.15)
    : 0;
  const effectiveTotalPrice = Math.round(basePrice * (1 - discountRate));
  const amountToPayNow = paymentType === 'FULL' ? effectiveTotalPrice : Math.round(effectiveTotalPrice / splitPlayers);

  // Submit payment & booking creation
  const handleExecutePayment = async () => {
    if (!slot || !club) return;
    setBookingError(null);

    // Require Auth
    if (!user) {
      openAuthModal(
        `Para confirmar tu reserva en ${club.name}, por favor iniciá sesión. Tu turno quedará asegurado inmediatamente.`,
        () => {}
      );
      return;
    }

    if (!buyerName.trim()) {
      setBookingError('Por favor ingresá tu nombre y apellido para la reserva.');
      return;
    }
    if (!buyerPhone.trim()) {
      setBookingError('Por favor ingresá tu número de WhatsApp para enviarte el código de cancha.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club: {
            id: club.id,
            name: club.name,
            address: `${club.address || ''} · ${club.city || 'Mar del Plata'}`,
          },
          slot: {
            id: slot.id,
            courtName: slot.courtName || 'Cancha',
            date: slot.date || 'Hoy',
            startTime: slot.startTime || '19:00',
            endTime: slot.endTime || '20:30',
            sport: slot.sport || 'PADEL',
            price: effectiveTotalPrice,
            isFixedSlot: isRecurring,
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
        throw new Error(data.message || 'No se pudo generar la reserva.');
      }

      setConfirmedBooking({
        bookingCode: data.booking.id,
        clubName: data.booking.clubName || club.name,
        courtName: data.booking.courtName || slot.courtName,
        time: `${data.booking.date} · ${data.booking.startTime} hs`,
        totalPaid: data.booking.totalPaid || amountToPayNow,
        splitLink: data.booking.splitLink,
        mpInitPoint: data.checkout?.initPoint,
      });

      // Save fixed slot occurrence if recurring
      if (isRecurring && user?.uid) {
        try {
          const generatedOccurrences: RecurringOccurrenceFirestore[] = [];
          const occurrencesCount = fixedDurationMonths * 4;
          const baseDate = new Date();
          const dayOfWeek = baseDate.getDay();

          for (let i = 0; i < occurrencesCount; i++) {
            const occDate = new Date(baseDate);
            occDate.setDate(baseDate.getDate() + i * 7);
            const y = occDate.getFullYear();
            const m = String(occDate.getMonth() + 1).padStart(2, '0');
            const d = String(occDate.getDate()).padStart(2, '0');

            generatedOccurrences.push({
              id: `${data.booking.id}_occ_${i + 1}`,
              subscriptionId: `sub_${data.booking.id}`,
              date: `${y}-${m}-${d}`,
              dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              courtName: slot.courtName,
              clubName: club.name,
              status: i === 0 ? 'COMPLETED' : 'SCHEDULED',
              isPaid: i === 0,
              price: effectiveTotalPrice,
            });
          }

          const isPadel = (slot.sport || '').toUpperCase().includes('PADEL');
          const newSub: Omit<FixedSlotSubscriptionFirestore, 'occurrences'> = {
            id: `sub_${data.booking.id}`,
            clubId: club.id,
            clubName: club.name,
            courtId: slot.courtId || 'c1',
            courtName: slot.courtName,
            sportType: isPadel ? 'PADEL' : 'FUTBOL_5',
            dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            startDate: generatedOccurrences[0]?.date || new Date().toISOString().split('T')[0],
            userId: user.uid,
            userName: buyerName.trim(),
            userPhone: buyerPhone.trim(),
            durationMonths: fixedDurationMonths as 1 | 3 | 6,
            pricePerOccurrence: effectiveTotalPrice,
            discountMonthlyTotal: (slot.price - effectiveTotalPrice) * 4,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };

          await saveUserFixedSlotFirestore(user.uid, newSub, generatedOccurrences);
        } catch (subErr) {
          console.error('Error saving subscription to Firestore:', subErr);
        }
      }

      // Local storage backup
      try {
        const newRecord: BookingRecord = {
          id: data.booking.id,
          clubId: club.id,
          clubName: club.name,
          clubAddress: `${club.address || ''} · ${club.city || 'Mar del Plata'}`,
          courtId: slot.courtId || 'c1',
          courtName: slot.courtName,
          sport: slot.sport || 'PADEL',
          date: slot.date || 'Hoy',
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalPrice: effectiveTotalPrice,
          serviceFee: 0,
          totalPaid: amountToPayNow,
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
        localStorage.setItem('hay_equipo_user_bookings', JSON.stringify([newRecord, ...existing.filter((b: any) => b.id !== newRecord.id)]));
      } catch (e) {}

      // If Mercado Pago URL provided, navigate
      if (data.checkout?.initPoint) {
        window.location.href = data.checkout.initPoint;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setBookingError(err?.message || 'Error al procesar la reserva. Por favor reintentá.');
    } finally {
      setIsProcessing(false);
    }
  };

  const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Head>
          <title>Preparando Checkout Seguro... | Hay Equipo</title>
        </Head>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(252, 28, 70, 0.2)', borderTopColor: 'var(--color-crimson-signal)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 18, color: 'var(--color-ash)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Preparando cancha y reserva segura...
        </p>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: 'var(--font-sui)' }}>
      <Head>
        <title>Checkout Seguro de Turno | Hay Equipo</title>
      </Head>

      {/* ═══════════════════════════════════════════════════════
          HEADER — Fixed ThoughtLab Glass Navigation
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
        <Link href="/reservar" style={{ display: 'flex', alignItems: 'baseline', gap: 22, textDecoration: 'none' }}>
          <span className="landing-header-logo" style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
            HAY EQUIPO?
          </span>
          <span className="landing-header-logo-sub" style={{ fontSize: 10, color: 'var(--color-graphite)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            / Checkout Seguro
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Icons.ShieldCheck size={14} color="#10b981" />
            <span>Reserva Oficial 256-Bit SSL</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN CHECKOUT CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '108px 20px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--color-ash)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-frost)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ash)')}
          >
            <Icons.ArrowLeft size={14} />
            <span>Volver a Explorar Canchas</span>
          </button>
        </div>

        {/* ── SUCCESS STATE POST-BOOKING ── */}
        {confirmedBooking ? (
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '48px 36px',
              textAlign: 'center',
              maxWidth: 640,
              margin: '20px auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.1)',
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icons.CheckCircle size={32} color="#10b981" />
            </div>

            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              ¡Turno Confirmado! Ya estás en la cancha
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.8px', margin: '0 0 12px', color: 'var(--color-frost)' }}>
              {confirmedBooking.clubName}
            </h1>
            <p style={{ color: 'var(--color-ash)', fontSize: 14, margin: '0 0 24px' }}>
              {confirmedBooking.courtName} · {confirmedBooking.time}
            </p>

            <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--color-ash)' }}>Código de Reserva:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-frost)', letterSpacing: '1px' }}>{confirmedBooking.bookingCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-ash)' }}>Abonado con Mercado Pago:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>{formatCurrency(confirmedBooking.totalPaid)}</span>
              </div>
            </div>

            {confirmedBooking.splitLink && (
              <div style={{ marginBottom: 28, textAlign: 'left' }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-ash)', display: 'block', marginBottom: 8 }}>
                  Link para invitar y cobrar a tus amigos (WhatsApp):
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={confirmedBooking.splitLink}
                    style={{
                      flex: 1,
                      backgroundColor: '#050505',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-none)',
                      padding: '10px 14px',
                      color: 'var(--color-frost)',
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.splitLink || '');
                      setCopiedSplitLink(true);
                      setTimeout(() => setCopiedSplitLink(false), 2500);
                    }}
                    style={{
                      backgroundColor: copiedSplitLink ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-full)',
                      padding: '10px 18px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Copy size={13} />
                    <span>{copiedSplitLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/reservar?tab=reservas"
                style={{
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-full)',
                  padding: '12px 28px',
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textDecoration: 'none',
                }}
              >
                Ver Mis Reservas
              </Link>
              <Link
                href="/reservar"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-frost)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-full)',
                  padding: '12px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  textDecoration: 'none',
                }}
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CHECKOUT TWO-COLUMN LAYOUT ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
            {/* ── COLUMNA IZQUIERDA: CONFIGURACIÓN DE RESERVA & COMPRADOR ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card 1: Ficha del Turno y Cancha */}
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      Cancha Seleccionada
                    </span>
                    <h2 style={{ fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: '4px 0 2px', color: 'var(--color-frost)' }}>
                      {club?.name || 'Club'}
                    </h2>
                    <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                      <span>{club?.address || 'Mar del Plata'}</span>
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px 14px', borderRadius: 'var(--radius-none)', textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      {slot?.sport || 'PÁDEL'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-frost)' }}>
                      {slot?.courtName || 'Cancha'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Calendar size={16} color="var(--color-crimson-signal)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: 'var(--color-ash)', textTransform: 'uppercase' }}>Fecha</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>{slot?.date || 'Hoy'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Clock size={16} color="var(--color-crimson-signal)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: 'var(--color-ash)', textTransform: 'uppercase' }}>Horario</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>{slot?.startTime || '19:00'} a {slot?.endTime || '20:30'} hs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Modalidad de Pago (Split vs Total) */}
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 28px' }}>
                <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, display: 'block', marginBottom: 4 }}>
                  Paso 1
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.3px', margin: '0 0 14px', color: 'var(--color-frost)' }}>
                  Modalidad de Pago
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentType('SPLIT')}
                    style={{
                      backgroundColor: paymentType === 'SPLIT' ? 'rgba(252, 28, 70, 0.12)' : '#121212',
                      border: `1.5px solid ${paymentType === 'SPLIT' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 'var(--radius-none)',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Icons.Users size={16} color={paymentType === 'SPLIT' ? 'var(--color-crimson-signal)' : '#ffffff'} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-frost)', textTransform: 'uppercase' }}>
                        Dividir Pago (Split)
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--color-ash)', margin: 0, lineHeight: 1.4 }}>
                      Pagás solo tu parte ({formatCurrency(Math.round(effectiveTotalPrice / splitPlayers))}) y recibís un link de WhatsApp para que tus amigos paguen el resto.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('FULL')}
                    style={{
                      backgroundColor: paymentType === 'FULL' ? 'rgba(252, 28, 70, 0.12)' : '#121212',
                      border: `1.5px solid ${paymentType === 'FULL' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 'var(--radius-none)',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Icons.Lock size={16} color={paymentType === 'FULL' ? 'var(--color-crimson-signal)' : '#ffffff'} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-frost)', textTransform: 'uppercase' }}>
                        Pago Total (100%)
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--color-ash)', margin: 0, lineHeight: 1.4 }}>
                      Abonás el valor completo de la cancha ({formatCurrency(effectiveTotalPrice)}) y la asegurás al instante para todo tu grupo.
                    </p>
                  </button>
                </div>

                {paymentType === 'SPLIT' && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-ash)' }}>
                      Dividir entre:
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[2, 4, 10, 14].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSplitPlayers(n)}
                          style={{
                            backgroundColor: splitPlayers === n ? 'var(--color-crimson-signal)' : '#161616',
                            color: '#ffffff',
                            border: `1px solid ${splitPlayers === n ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.15)'}`,
                            borderRadius: 'var(--radius-full)',
                            padding: '4px 12px',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          {n} personas
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Tipo de Reserva (Único vs Turno Fijo) */}
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 28px' }}>
                <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, display: 'block', marginBottom: 4 }}>
                  Paso 2
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.3px', margin: '0 0 14px', color: 'var(--color-frost)' }}>
                  Tipo de Reserva
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setSlotBookingMode('SINGLE')}
                    style={{
                      backgroundColor: slotBookingMode === 'SINGLE' ? 'rgba(252, 28, 70, 0.12)' : '#121212',
                      border: `1.5px solid ${slotBookingMode === 'SINGLE' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 'var(--radius-none)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Turno Único
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-ash)' }}>
                      Solo para esta fecha. Sin compromiso futuro.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlotBookingMode('FIXED_RECURRING')}
                    style={{
                      backgroundColor: slotBookingMode === 'FIXED_RECURRING' ? 'rgba(252, 28, 70, 0.12)' : '#121212',
                      border: `1.5px solid ${slotBookingMode === 'FIXED_RECURRING' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 'var(--radius-none)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-frost)', textTransform: 'uppercase' }}>
                        Turno Fijo Semanal
                      </span>
                      <span style={{ fontSize: 9, backgroundColor: 'var(--color-crimson-signal)', color: '#fff', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                        HASTA 15% OFF
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-ash)' }}>
                      Asegurá esta cancha todas las semanas en este mismo horario.
                    </div>
                  </button>
                </div>

                {slotBookingMode === 'FIXED_RECURRING' && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-ash)', marginBottom: 8 }}>
                      Seleccioná la duración del abono fijo:
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([1, 3, 6] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFixedDurationMonths(m)}
                          style={{
                            flex: 1,
                            backgroundColor: fixedDurationMonths === m ? 'var(--color-crimson-signal)' : '#161616',
                            color: '#ffffff',
                            border: `1px solid ${fixedDurationMonths === m ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.15)'}`,
                            borderRadius: 'var(--radius-full)',
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          {m} {m === 1 ? 'Mes (5% OFF)' : m === 3 ? 'Meses (12% OFF)' : 'Meses (15% OFF)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Datos del Titular de la Reserva */}
              <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, display: 'block' }}>
                      Paso 3
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0, color: 'var(--color-frost)' }}>
                      Datos del Titular
                    </h3>
                  </div>

                  {!user && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('Iniciá sesión para autocompletar tus datos y guardar tu turno.')}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-crimson-signal)',
                        border: '1px solid var(--color-crimson-signal)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Ingresar con Google
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Emiliano M."
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#141414',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-none)',
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 223 555-0199"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#141414',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-none)',
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Email para comprobante
                  </label>
                  <input
                    type="email"
                    placeholder="tuemail@ejemplo.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#141414',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-none)',
                      padding: '11px 14px',
                      color: '#ffffff',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: RESUMEN DE COMPRA STICKY (ESTILO E-COMMERCE) ── */}
            <div style={{ position: 'sticky', top: 96 }}>
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  padding: '28px 24px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                }}
              >
                {/* Hold Timer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(252, 28, 70, 0.1)', border: '1px solid rgba(252, 28, 70, 0.3)', padding: '8px 14px', borderRadius: 'var(--radius-none)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--color-crimson-signal)', textTransform: 'uppercase' }}>
                    <Icons.Clock size={13} color="var(--color-crimson-signal)" />
                    <span>Cancha Retenida</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                    {timerDisplay}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.4px', margin: '0 0 16px', color: 'var(--color-frost)' }}>
                  Resumen de Pago
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)' }}>
                    <span>Valor Cancha (Turno)</span>
                    <span style={{ color: 'var(--color-frost)', fontWeight: 600 }}>{formatCurrency(basePrice)}</span>
                  </div>

                  {discountRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Descuento Turno Fijo ({discountRate * 100}%)</span>
                      <span style={{ fontWeight: 700 }}>-{formatCurrency(basePrice - effectiveTotalPrice)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ash)' }}>
                    <span>Modalidad</span>
                    <span style={{ color: 'var(--color-frost)', fontWeight: 600 }}>
                      {paymentType === 'SPLIT' ? `Dividido en ${splitPlayers} jugadores` : 'Pago Total (100%)'}
                    </span>
                  </div>

                  <div style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-frost)' }}>
                        Total a Pagar Ahora
                      </span>
                      {paymentType === 'SPLIT' && (
                        <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>Tu parte como organizador</div>
                      )}
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-crimson-signal)', letterSpacing: '-0.5px' }}>
                      {formatCurrency(amountToPayNow)}
                    </span>
                  </div>
                </div>

                {bookingError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: 'var(--radius-none)', color: '#f87171', fontSize: 12, marginBottom: 16 }}>
                    {bookingError}
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecutePayment}
                  style={{
                    width: '100%',
                    backgroundColor: isProcessing ? '#404040' : 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '15px 20px',
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 20px rgba(252, 28, 70, 0.45)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  <Icons.Lock size={15} color="#ffffff" />
                  <span>{isProcessing ? 'Procesando Reserva...' : `PAGAR ${formatCurrency(amountToPayNow)} CON MERCADO PAGO`}</span>
                </button>

                {/* Trust Badges */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--color-ash)' }}>
                    <Icons.ShieldCheck size={14} color="#10b981" />
                    <span>Confirmación instantánea en la agenda del club</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--color-ash)' }}>
                    <Icons.CheckCircle size={14} color="#10b981" />
                    <span>Cancelación sin costo hasta 2 hs antes del partido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
