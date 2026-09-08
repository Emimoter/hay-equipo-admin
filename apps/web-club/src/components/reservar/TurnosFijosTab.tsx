import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSlidingIndicator } from '../../hooks/useSlidingIndicator';
import {
  getClubsFirestore,
  saveUserFixedSlotFirestore,
  getUserFixedSlotsFirestore,
  liberateOccurrenceFirestore,
  FixedSlotSubscriptionFirestore,
  RecurringOccurrenceFirestore,
} from '../../services/firebase';

interface TurnosFijosTabProps {
  onNavigateHome: () => void;
  clubs?: any[];
}

/* ────────────────────────────────────────────────────────────
   100% Custom Vector SVG Icons — Strict Zero Emojis
   ──────────────────────────────────────────────────────────── */
const Icons = {
  Repeat: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Zap: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
  Clock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Check: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Lock: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Tag: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Sparkles: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Close: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Padel: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="18" y1="18" x2="22" y2="22" strokeWidth="3" />
    </svg>
  ),
  Soccer: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15.5 9.5 14 13.5 10 13.5 8.5 9.5" />
    </svg>
  ),
};

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DEFAULT_TIMES = ['18:00', '19:30', '21:00', '22:30'];

export const TurnosFijosTab: React.FC<TurnosFijosTabProps> = ({ onNavigateHome, clubs: propClubs }) => {
  const { user, openAuthModal } = useAuth();

  // Navigation tabs matching mobile FixedSlotScreen: 'MY_SLOTS' | 'NEW_SLOT'
  const [activeTab, setActiveTab] = useState<'MY_SLOTS' | 'NEW_SLOT'>('MY_SLOTS');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Subscriptions & Occurrences
  const [subscriptions, setSubscriptions] = useState<FixedSlotSubscriptionFirestore[]>([]);
  const [occurrences, setOccurrences] = useState<RecurringOccurrenceFirestore[]>([]);

  // Club & Court data for new subscription form
  const [availableClubs, setAvailableClubs] = useState<any[]>(propClubs || []);
  const [selectedClubId, setSelectedClubId] = useState<string>('club-laverde-jara');
  const [selectedCourtName, setSelectedCourtName] = useState<string>('Cancha 1 — Pádel Panorámica Cristal');
  const [selectedSport, setSelectedSport] = useState<'PADEL' | 'FUTBOL_5'>('PADEL');

  // Sliding Indicators (hay-equipo-system)
  const {
    containerRef: tabsContainerRef,
    setItemRef: setTabsItemRef,
    indicatorStyle: tabsIndicatorStyle,
  } = useSlidingIndicator(activeTab);

  const {
    containerRef: sportContainerRef,
    setItemRef: setSportItemRef,
    indicatorStyle: sportIndicatorStyle,
  } = useSlidingIndicator(selectedSport);

  // New Subscription Form State
  const [selectedDay, setSelectedDay] = useState<number>(4); // Jueves
  const [selectedTime, setSelectedTime] = useState<string>('21:00');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');

  // Liberation Modal State
  const [liberateModalOcc, setLiberateModalOcc] = useState<RecurringOccurrenceFirestore | null>(null);
  const [liberatingLoading, setLiberatingLoading] = useState<boolean>(false);

  // Success message banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load clubs & subscriptions on mount and when user changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Load clubs if not passed as prop
        if (!propClubs || propClubs.length === 0) {
          const fetchedClubs = await getClubsFirestore();
          if (fetchedClubs && fetchedClubs.length > 0) {
            setAvailableClubs(fetchedClubs);
            setSelectedClubId(fetchedClubs[0].id);
          }
        } else {
          setAvailableClubs(propClubs);
          setSelectedClubId(propClubs[0].id);
        }

        // 2. Load user subscriptions if logged in
        if (user) {
          const { subscriptions: subs, occurrences: occs } = await getUserFixedSlotsFirestore(user.uid);
          setSubscriptions(subs);
          setOccurrences(occs);
          if (user.displayName) setApplicantName(user.displayName);
          if (user.phoneNumber) setApplicantPhone(user.phoneNumber);
        } else {
          setSubscriptions([]);
          setOccurrences([]);
        }
      } catch (e) {
        console.error('Error loading fixed slot data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, propClubs]);

  // Selected Club details
  const currentClub = availableClubs.find((c) => c.id === selectedClubId) || availableClubs[0] || {
    id: 'club-laverde-jara',
    name: 'Laverde Jara - Canchas de Césped Sintético',
    minPrice: 32000,
  };

  // Pricing calculation matching mobile app
  const basePricePerMatch = currentClub.minPrice || 32000;
  const discountRate = durationMonths === 1 ? 0.05 : durationMonths === 3 ? 0.12 : 0.15;
  const discountedPrice = Math.round(basePricePerMatch * (1 - discountRate));
  const matchesPerMonth = 4;
  const monthlySavings = (basePricePerMatch - discountedPrice) * matchesPerMonth;

  // Handle Liberation of an occurrence
  const handleConfirmLiberate = async () => {
    if (!liberateModalOcc || !user) return;
    setLiberatingLoading(true);
    try {
      const ok = await liberateOccurrenceFirestore(user.uid, liberateModalOcc.subscriptionId, liberateModalOcc.id);
      if (ok) {
        setOccurrences((prev) =>
          prev.map((o) => (o.id === liberateModalOcc.id ? { ...o, status: 'RELEASED_TO_MARKETPLACE' } : o))
        );
        setSubscriptions((prev) =>
          prev.map((s) => {
            if (s.id === liberateModalOcc.subscriptionId) {
              return {
                ...s,
                occurrences: s.occurrences.map((o) =>
                  o.id === liberateModalOcc.id ? { ...o, status: 'RELEASED_TO_MARKETPLACE' } : o
                ),
              };
            }
            return s;
          })
        );
        setSuccessMessage('Fecha liberada al Marketplace. Si otro grupo la reserva, recibirás el reintegro directo.');
      }
    } catch (err) {
      console.error('Error liberating occurrence:', err);
    } finally {
      setLiberatingLoading(false);
      setLiberateModalOcc(null);
    }
  };

  // Handle Contract / Subscribe Fixed Slot
  const handleCreateFixedSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require Auth
    if (!user) {
      openAuthModal();
      return;
    }

    if (!applicantName.trim() || !applicantPhone.trim()) {
      alert('Por favor completá tu nombre y teléfono de WhatsApp.');
      return;
    }

    setSubmitting(true);
    try {
      const subId = `sub_${Date.now()}`;
      const startDate = new Date().toISOString().split('T')[0];

      // End time (90 min padel / 60 min futbol)
      const durationMins = selectedSport === 'PADEL' ? 90 : 60;
      const [h, m] = selectedTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + durationMins;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // Generate 4 weekly occurrences per month
      const totalWeeks = durationMonths * 4;
      const generatedOccurrences: RecurringOccurrenceFirestore[] = [];

      for (let i = 0; i < totalWeeks; i++) {
        const occDate = new Date();
        occDate.setDate(occDate.getDate() + i * 7 + ((selectedDay - occDate.getDay() + 7) % 7));
        const occDateStr = occDate.toISOString().split('T')[0];

        generatedOccurrences.push({
          id: `occ_${subId}_${i + 1}`,
          subscriptionId: subId,
          date: occDateStr,
          dayOfWeek: selectedDay,
          startTime: selectedTime,
          endTime,
          courtName: selectedCourtName,
          clubName: currentClub.name,
          status: 'SCHEDULED',
          isPaid: i === 0,
          price: discountedPrice,
        });
      }

      const newSub: Omit<FixedSlotSubscriptionFirestore, 'occurrences'> = {
        id: subId,
        userId: user.uid,
        userName: applicantName,
        userPhone: applicantPhone,
        clubId: currentClub.id,
        clubName: currentClub.name,
        courtId: `court_${selectedClubId}_1`,
        courtName: selectedCourtName,
        sportType: selectedSport,
        dayOfWeek: selectedDay,
        startTime: selectedTime,
        endTime,
        startDate,
        durationMonths,
        pricePerOccurrence: discountedPrice,
        discountMonthlyTotal: monthlySavings,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      const saved = await saveUserFixedSlotFirestore(user.uid, newSub, generatedOccurrences);

      if (saved) {
        setSubscriptions((prev) => [{ ...newSub, occurrences: generatedOccurrences }, ...prev]);
        setOccurrences((prev) => [...generatedOccurrences, ...prev]);
        setActiveTab('MY_SLOTS');
        setSuccessMessage(`Turno Fijo confirmado. Ahorro estimado de $${monthlySavings.toLocaleString('es-AR')} por mes.`);
      }
    } catch (err) {
      console.error('Error creating fixed slot:', err);
      alert('Hubo un error al guardar el turno fijo. Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="turnos-fijos-container" style={{ maxWidth: 1240, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* ── Encabezado Estilo Swiss Brutalist ── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-crimson-signal)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          04 / SISTEMA DE TURNOS PERMANENTES
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: 'var(--color-frost)',
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            margin: 0,
          }}
        >
          Turnos Fijos Semanales
        </h1>
        <p style={{ color: 'var(--color-ash)', fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: 680 }}>
          Cancha fija asegurada todos los meses con tarifa congelada, bonificación por frecuencia y garantía de liberación al marketplace si una semana tu grupo no asiste.
        </p>
      </div>

      {/* ── Banner de Éxito ── */}
      {successMessage && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '12px 18px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.Check size={16} color="#10b981" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 4 }}
          >
            <Icons.Close size={14} color="#10b981" />
          </button>
        </div>
      )}

      {/* ── Sub-Tabs con Píldora Deslizante Fluida (hay-equipo-system) ── */}
      <div
        ref={tabsContainerRef as any}
        className="turnos-fijos-tabs-track"
        style={{
          position: 'relative',
          display: 'inline-flex',
          gap: 4,
          padding: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          marginBottom: 32,
          maxWidth: '100%',
        }}
      >
        {/* Píldora deslizante activa */}
        <div style={tabsIndicatorStyle} />

        <button
          type="button"
          ref={setTabsItemRef('MY_SLOTS')}
          onClick={() => setActiveTab('MY_SLOTS')}
          className="turnos-fijos-tab-btn"
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            border: 'none',
            borderRadius: '9999px',
            color: activeTab === 'MY_SLOTS' ? '#ffffff' : 'var(--color-ash)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 18px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Icons.Repeat size={14} color={activeTab === 'MY_SLOTS' ? '#ffffff' : 'var(--color-ash)'} />
          <span className="turnos-fijos-tab-desktop">Mis Turnos Activos ({subscriptions.length})</span>
          <span className="turnos-fijos-tab-mobile">Mis Turnos ({subscriptions.length})</span>
        </button>

        <button
          type="button"
          ref={setTabsItemRef('NEW_SLOT')}
          onClick={() => setActiveTab('NEW_SLOT')}
          className="turnos-fijos-tab-btn"
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            border: 'none',
            borderRadius: '9999px',
            color: activeTab === 'NEW_SLOT' ? '#ffffff' : 'var(--color-ash)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 18px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Icons.Calendar size={14} color={activeTab === 'NEW_SLOT' ? '#ffffff' : 'var(--color-ash)'} />
          <span className="turnos-fijos-tab-desktop">+ Contratar Turno Fijo</span>
          <span className="turnos-fijos-tab-mobile">+ Contratar</span>
        </button>
      </div>

      <div className="turnos-fijos-grid">
        {/* ── Columna Izquierda: Mis Turnos Activos O Formulario ── */}
        <div>
          {activeTab === 'MY_SLOTS' ? (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-ash)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cargando abonos permanentes...
                </div>
              ) : !user ? (
                /* Estado no autenticado */
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    backgroundColor: '#0a0a0a',
                    border: '1px dashed rgba(76, 76, 76, 0.4)',
                  }}
                >
                  <div style={{ marginBottom: 16, color: 'var(--color-graphite)' }}>
                    <Icons.Lock size={38} color="var(--color-ash)" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Iniciá sesión para ver tus turnos
                  </h3>
                  <p style={{ color: 'var(--color-ash)', fontSize: 13, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Accedé a tus abonos mensuales activos, consultá tus próximas fechas o liberá tu cancha si esta semana no juegan.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuthModal()}
                    style={{
                      backgroundColor: 'var(--color-crimson-signal)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-buttons)',
                      padding: '12px 26px',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    Iniciar Sesión / Registrarme
                  </button>
                </div>
              ) : subscriptions.length === 0 ? (
                /* Estado vacío idéntico a MisReservasTab */
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    backgroundColor: '#0a0a0a',
                    border: '1px dashed rgba(76, 76, 76, 0.4)',
                  }}
                >
                  <div style={{ marginBottom: 16, color: 'var(--color-graphite)' }}>
                    <Icons.Calendar size={42} color="var(--color-ash)" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 8 }}>
                    No tenés turnos fijos registrados
                  </h3>
                  <p style={{ color: 'var(--color-ash)', fontSize: 13, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Asegurá un horario semanal para jugar siempre con tu grupo con tarifa congelada y 12% de bonificación mensual.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('NEW_SLOT')}
                    style={{
                      backgroundColor: 'var(--color-crimson-signal)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-buttons)',
                      padding: '12px 26px',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                    }}
                  >
                    Contratar Turno Fijo
                  </button>
                </div>
              ) : (
                /* Lista de Subscriptions Activas con estética MisReservasTab */
                <div style={{ display: 'grid', gap: 20 }}>
                  {subscriptions.map((sub) => {
                    const subOccurrences = occurrences.filter((o) => o.subscriptionId === sub.id);
                    return (
                      <div
                        key={sub.id}
                        style={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(76, 76, 76, 0.5)',
                          padding: '24px 28px',
                        }}
                      >
                        {/* Sub Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(252, 28, 70, 0.15)',
                                color: 'var(--color-crimson-signal)',
                                border: '1px solid rgba(252, 28, 70, 0.3)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '3px 10px',
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                              }}
                            >
                              ACTIVO
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--color-ash)', fontFamily: 'Space Grotesk, monospace', fontWeight: 600 }}>
                              ID: {sub.id}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-graphite)' }}>·</span>
                            <span style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 700 }}>
                              {sub.sportType === 'PADEL' ? 'PÁDEL' : 'FÚTBOL'}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-frost)' }}>
                            ${sub.pricePerOccurrence?.toLocaleString('es-AR')} <span style={{ fontSize: 11, color: 'var(--color-ash)', fontWeight: 400 }}>/ partido</span>
                          </div>
                        </div>

                        {/* Court & Club Name */}
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 4px', textTransform: 'uppercase' }}>
                          {sub.courtName}
                        </h3>
                        <div style={{ fontSize: 13, color: 'var(--color-ash)', marginBottom: 16 }}>
                          {sub.clubName}
                        </div>

                        {/* Schedule Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-frost)', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                            <span>Todos los {DAYS_OF_WEEK[sub.dayOfWeek]}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                            <span>{sub.startTime} hs ({sub.durationMonths} meses)</span>
                          </div>
                        </div>

                        {/* Savings Banner */}
                        <div
                          style={{
                            backgroundColor: 'rgba(252, 28, 70, 0.08)',
                            border: '1px solid rgba(252, 28, 70, 0.25)',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#ff6b8b',
                            fontWeight: 600,
                            marginBottom: 20,
                          }}
                        >
                          <Icons.Sparkles size={14} color="var(--color-crimson-signal)" />
                          <span>Bonificación activa: Ahorrás ${sub.discountMonthlyTotal?.toLocaleString('es-AR')} por mes respecto a la tarifa estándar</span>
                        </div>

                        {/* Upcoming Occurrences */}
                        <div style={{ fontSize: 11, color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                          Próximas Fechas del Abono:
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {subOccurrences.slice(0, 4).map((occ) => {
                            const isLiberated = occ.status === 'RELEASED_TO_MARKETPLACE';
                            return (
                              <div
                                key={occ.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '10px 14px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(76, 76, 76, 0.25)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <Icons.Calendar size={13} color={isLiberated ? '#f59e0b' : '#10b981'} />
                                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-frost)' }}>
                                    {occ.date} · {occ.startTime} hs
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      color: isLiberated ? '#f59e0b' : '#10b981',
                                      backgroundColor: isLiberated ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                      padding: '3px 8px',
                                      borderRadius: 'var(--radius-full)',
                                      border: `1px solid ${isLiberated ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                    }}
                                  >
                                    {isLiberated ? 'EN VENTA' : 'CONFIRMADO'}
                                  </span>
                                </div>

                                {!isLiberated ? (
                                  <button
                                    type="button"
                                    onClick={() => setLiberateModalOcc(occ)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      color: 'var(--color-ash)',
                                      border: '1px solid rgba(76, 76, 76, 0.5)',
                                      borderRadius: 'var(--radius-buttons)',
                                      padding: '6px 14px',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.4px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = 'var(--color-crimson-signal)';
                                      e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = 'var(--color-ash)';
                                      e.currentTarget.style.borderColor = 'rgba(76, 76, 76, 0.5)';
                                    }}
                                  >
                                    Liberar esta semana
                                  </button>
                                ) : (
                                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                    Publicado en Marketplace
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── TAB 2: Formulario de Contratación (Estilo Swiss Brutalist) ── */
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(76, 76, 76, 0.5)',
                padding: '30px 32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Icons.Repeat size={18} color="var(--color-crimson-signal)" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                  Configurá tu Turno Semanal
                </h2>
              </div>

              <form onSubmit={handleCreateFixedSlot} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Deporte (Sliding Pill Switch — hay-equipo-system) */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Deporte
                  </label>
                  <div
                    ref={sportContainerRef as any}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      gap: 4,
                      padding: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '9999px',
                      width: '100%',
                    }}
                  >
                    <div style={sportIndicatorStyle} />
                    {(['PADEL', 'FUTBOL_5'] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        ref={setSportItemRef(s)}
                        onClick={() => setSelectedSport(s)}
                        style={{
                          flex: 1,
                          position: 'relative',
                          zIndex: 2,
                          backgroundColor: 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '10px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {s === 'PADEL' ? <Icons.Padel size={15} color="#fff" /> : <Icons.Soccer size={15} color="#fff" />}
                        <span>{s === 'PADEL' ? 'Pádel' : 'Fútbol'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Club y Cancha */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Club / Complejo Seleccionado
                  </label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => {
                      setSelectedClubId(e.target.value);
                      const club = availableClubs.find((c) => c.id === e.target.value);
                      if (club) {
                        setSelectedCourtName(`Cancha 1 — ${selectedSport === 'PADEL' ? 'Pádel Panorámica Cristal' : 'Fútbol Césped Sintético'}`);
                      }
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(76, 76, 76, 0.4)',
                      color: 'var(--color-frost)',
                      padding: '11px 14px',
                      fontSize: 13,
                      fontFamily: 'Space Grotesk, sans-serif',
                      outline: 'none',
                    }}
                  >
                    {availableClubs.map((club) => (
                      <option key={club.id} value={club.id} style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
                        {club.name} ({club.city || 'Mar del Plata'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Día de la semana */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Día de la semana
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {DAYS_OF_WEEK.map((dayName, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedDay(idx)}
                        style={{
                          backgroundColor: selectedDay === idx ? 'rgba(252, 28, 70, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: selectedDay === idx ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                          border: `1px solid ${selectedDay === idx ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                          borderRadius: 'var(--radius-buttons)',
                          padding: '8px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {dayName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horario */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Horario Semanal
                  </label>
                  <div className="turnos-fijos-times-grid">
                    {DEFAULT_TIMES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        style={{
                          flex: 1,
                          backgroundColor: selectedTime === t ? 'rgba(252, 28, 70, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: selectedTime === t ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                          border: `1px solid ${selectedTime === t ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                          borderRadius: 'var(--radius-buttons)',
                          padding: '8px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {t} hs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duración */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    Duración del Abono
                  </label>
                  <div className="turnos-fijos-durations-grid">
                    {[
                      { m: 1, label: '1 Mes' },
                      { m: 3, label: '3 Meses (-12% OFF)' },
                      { m: 6, label: '6 Meses (-15% OFF)' },
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.m}
                        onClick={() => setDurationMonths(d.m)}
                        style={{
                          flex: 1,
                          backgroundColor: durationMonths === d.m ? 'rgba(252, 28, 70, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: durationMonths === d.m ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                          border: `1px solid ${durationMonths === d.m ? 'var(--color-crimson-signal)' : 'rgba(76, 76, 76, 0.4)'}`,
                          borderRadius: 'var(--radius-buttons)',
                          padding: '8px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cotizador y Ahorro */}
                <div
                  style={{
                    backgroundColor: 'rgba(252, 28, 70, 0.06)',
                    border: '1px solid rgba(252, 28, 70, 0.3)',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-ash)' }}>Tarifa estándar por partido:</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-ash)' }}>${basePricePerMatch.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-frost)' }}>Tarifa con Turno Fijo (-{Math.round(discountRate * 100)}%):</span>
                    <span style={{ color: 'var(--color-crimson-signal)' }}>${discountedPrice.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ height: 1, backgroundColor: 'rgba(252, 28, 70, 0.2)', marginBottom: 10 }} />
                  <div style={{ color: '#ff6b8b', fontSize: 13, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icons.Tag size={13} color="var(--color-crimson-signal)" />
                    <span>Ahorro mensual del grupo: ${monthlySavings.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* Datos del Titular */}
                <div className="turnos-fijos-titular-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Emiliano"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: 'var(--color-frost)',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: +54 9 223 555-0199"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(76, 76, 76, 0.4)',
                        color: 'var(--color-frost)',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Botón Contratar */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-buttons)',
                    padding: '14px 28px',
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 6,
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  <Icons.Check size={16} color="#fff" />
                  <span>
                    {submitting ? 'Asegurando Turno...' : user ? 'Asegurar Turno Fijo' : 'Iniciar Sesión y Asegurar Turno'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Columna Derecha: Tarjetas Explicativas y Garantías ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card: Liberación al Marketplace */}
          <div
            style={{
              backgroundColor: 'rgba(252, 28, 70, 0.04)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Icons.Zap size={18} color="var(--color-crimson-signal)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                Liberación al Marketplace
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, margin: 0 }}>
              ¿Te vas de viaje o una semana no juntan los 4 jugadores? <strong>No perdés tu dinero</strong>. Con 1 solo clic en la web o app liberás esa fecha específica al marketplace de Hay Equipo. Si otro grupo la reserva, recibís el <strong>100% de reintegro</strong> en tu cuenta.
            </p>
          </div>

          {/* Card: Beneficios incluidos */}
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(76, 76, 76, 0.4)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Icons.ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: 0, textTransform: 'uppercase' }}>
                Beneficios del Turno Fijo
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Tarifa mensual congelada por todo el período contratado.',
                'Prioridad número 1 en la mejor cancha del complejo.',
                'Opción de Split automático: el cobro se divide entre los 4 titulares.',
                'Acceso preferencial a torneos internos y eventos del club.',
              ].map((benefit, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-frost)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Modal de Confirmación para Liberar Ocurrencia ── */}
      {liberateModalOcc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(252, 28, 70, 0.4)',
              maxWidth: 480,
              width: '100%',
              padding: 28,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <Icons.Tag size={24} color="var(--color-crimson-signal)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', marginBottom: 8 }}>
              ¿Liberar esta fecha al Marketplace?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, marginBottom: 16 }}>
              Vas a poner en venta el turno del <strong>{liberateModalOcc.date} a las {liberateModalOcc.startTime} hs</strong> en {liberateModalOcc.clubName}.
            </p>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '12px 14px',
                fontSize: 12,
                color: '#10b981',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icons.Zap size={14} color="#10b981" />
              <span>Si otro grupo reserva tu cancha, no se te cobrará penalización y recibirás el reintegro directo en tu Mercado Pago.</span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setLiberateModalOcc(null)}
                disabled={liberatingLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLiberate}
                disabled={liberatingLoading}
                style={{
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '10px 18px',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  cursor: liberatingLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(252, 28, 70, 0.4)',
                }}
              >
                {liberatingLoading ? 'Liberando...' : 'Confirmar y Liberar Fecha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive Styling (hay-equipo-system) ── */}
      <style jsx>{`
        .turnos-fijos-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }

        .turnos-fijos-tab-mobile {
          display: none;
        }
        .turnos-fijos-tab-desktop {
          display: inline;
        }

        .turnos-fijos-times-grid {
          display: flex;
          gap: 10px;
        }

        .turnos-fijos-durations-grid {
          display: flex;
          gap: 10px;
        }

        .turnos-fijos-titular-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 900px) {
          .turnos-fijos-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 768px) {
          .turnos-fijos-container {
            padding: 96px 16px 110px !important;
          }
        }

        @media (max-width: 600px) {
          .turnos-fijos-tabs-track {
            display: flex !important;
            width: 100% !important;
          }
          .turnos-fijos-tab-btn {
            flex: 1 !important;
            padding: 8px 6px !important;
            font-size: 11px !important;
            gap: 6px !important;
          }
          .turnos-fijos-tab-desktop {
            display: none !important;
          }
          .turnos-fijos-tab-mobile {
            display: inline !important;
          }
          .turnos-fijos-titular-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .turnos-fijos-times-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .turnos-fijos-durations-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};
