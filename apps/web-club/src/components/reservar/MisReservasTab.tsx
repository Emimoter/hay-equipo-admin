import React, { useState, useEffect } from 'react';
import { BookingRecord, getBookingByIdFirestore, getUserBookingsFirestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

interface MisReservasTabProps {
  onNavigateSearch: () => void;
}

const Icons = {
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
  MapPin: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
  Zap: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Search: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ExternalLink: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = '#25D366' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  CheckCircle: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  ),
  Copy: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
};

export const MisReservasTab: React.FC<MisReservasTabProps> = ({ onNavigateSearch }) => {
  const { user, userProfile, openAuthModal } = useAuth();
  const [subTab, setSubTab] = useState<'UPCOMING' | 'FIXED' | 'PAST'>('UPCOMING');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load and sync bookings (localStorage + Firestore)
  useEffect(() => {
    // 1. Initial quick load from local storage
    try {
      const stored = localStorage.getItem('hay_equipo_user_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookings(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading stored bookings:', e);
    }

    // 2. Fetch from Firestore if user is authenticated
    if (user) {
      setIsLoadingCloud(true);
      getUserBookingsFirestore(user.uid, user.email || undefined)
        .then((cloudBookings) => {
          if (cloudBookings && cloudBookings.length > 0) {
            setBookings((prev) => {
              const map = new Map<string, BookingRecord>();
              prev.forEach((b) => map.set(b.id.toLowerCase(), b));
              cloudBookings.forEach((b) => map.set(b.id.toLowerCase(), b));
              const merged = Array.from(map.values()).sort((a, b) => {
                const tA = new Date(a.createdAt || 0).getTime();
                const tB = new Date(b.createdAt || 0).getTime();
                return tB - tA;
              });
              try {
                localStorage.setItem('hay_equipo_user_bookings', JSON.stringify(merged));
              } catch (err) {}
              return merged;
            });
          }
        })
        .catch((err) => console.error('Error loading cloud bookings:', err))
        .finally(() => setIsLoadingCloud(false));
    }
  }, [user]);

  // Handle Search by Code (e.g. HE-65300) or Phone
  const handleSearchBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchMessage(null);

    try {
      // 1. Direct fetch by booking code
      const foundBooking = await getBookingByIdFirestore(query);
      if (foundBooking) {
        setBookings((prev) => {
          const exists = prev.some((b) => b.id.toLowerCase() === foundBooking.id.toLowerCase());
          const updated = exists ? prev.map((b) => (b.id.toLowerCase() === foundBooking.id.toLowerCase() ? foundBooking : b)) : [foundBooking, ...prev];
          try {
            localStorage.setItem('hay_equipo_user_bookings', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
        setSearchMessage({ text: `¡Reserva ${foundBooking.id} sincronizada con éxito!`, type: 'success' });
        setSearchQuery('');
      } else {
        setSearchMessage({
          text: `No se encontró ninguna reserva activa con el código "${query}". Verificá que comience con HE-`,
          type: 'error',
        });
      }
    } catch (err) {
      setSearchMessage({ text: 'Error al consultar la base de datos de reservas.', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopySplit = (splitLink: string, id: string) => {
    navigator.clipboard.writeText(splitLink);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    if (subTab === 'FIXED') return false; // Turnos fijos recurren en pestaña fijos
    if (subTab === 'PAST') return b.status === 'CANCELLED';
    return b.status === 'CONFIRMED' || b.status === 'PENDING';
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* ── Header de Sección ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
          02 / PANEL DE JUGADOR
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
              Mis Reservas
            </h1>
            <p style={{ color: 'var(--color-ash)', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
              Gestioná tus partidos confirmados, invitaciones de pago dividido y accesos directos al complejo.
            </p>
          </div>

          <button
            onClick={onNavigateSearch}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '11px 22px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
            }}
          >
            <Icons.Calendar size={14} color="#ffffff" />
            <span>Reservar Nuevo Turno</span>
          </button>
        </div>
      </div>

      {/* ── Status de Sincronización de Cuenta o Invitación al Login ── */}
      {user ? (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)' }}>
                Sincronizado con tu cuenta: {userProfile?.name || user.displayName || user.email}
              </div>
              <div style={{ fontSize: 11, color: '#a7f3d0' }}>
                {isLoadingCloud ? 'Consultando últimas reservas en tiempo real...' : `${bookings.length} ${bookings.length === 1 ? 'reserva registrada' : 'reservas registradas'} en la nube`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(252, 28, 70, 0.08)',
            border: '1px solid rgba(252, 28, 70, 0.3)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-crimson-signal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Sincronizá tus reservas con tu cuenta</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ash)' }}>
              Iniciá sesión o registrate para acceder a tus turnos confirmados y pagos divididos desde cualquier dispositivo.
            </div>
          </div>

          <button
            onClick={() => openAuthModal('Iniciá sesión para ver tus reservas sincronizadas')}
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-buttons)',
              padding: '9px 18px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(252, 28, 70, 0.4)',
            }}
          >
            Iniciar Sesión / Registrarme
          </button>
        </div>
      )}

      {/* ── Buscador de Reserva por Código HE-XXXXX ── */}
      <div
        style={{
          backgroundColor: '#0d0d0d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px 24px',
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 12 }}>
          ¿Hiciste una reserva desde otro dispositivo o con amigos? Consultala aquí:
        </div>
        <form onSubmit={handleSearchBooking} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-graphite)' }}>
              <Icons.Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Ingresá tu código de reserva (ej: HE-65300)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                color: 'var(--color-frost)',
                padding: '12px 14px 12px 42px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                textTransform: 'uppercase',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--color-frost)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-buttons)',
              padding: '12px 28px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
              opacity: isSearching ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isSearching ? 'Buscando...' : 'Sincronizar Reserva'}
          </button>
        </form>

        {searchMessage && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: searchMessage.type === 'success' ? '#10b981' : '#f87171',
              fontWeight: 600,
            }}
          >
            {searchMessage.text}
          </div>
        )}
      </div>

      {/* ── Sub-Tabs de Reservas (Pills) ── */}
      <div style={{ display: 'flex', gap: 10, paddingBottom: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSubTab('UPCOMING')}
          style={{
            background: subTab === 'UPCOMING' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
            border: subTab === 'UPCOMING' ? '1px solid var(--color-crimson-signal)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-buttons)',
            color: subTab === 'UPCOMING' ? '#ffffff' : 'var(--color-ash)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 18px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}
        >
          Próximas ({filteredBookings.length})
        </button>

        <button
          onClick={() => setSubTab('PAST')}
          style={{
            background: subTab === 'PAST' ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
            border: subTab === 'PAST' ? '1px solid var(--color-crimson-signal)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-buttons)',
            color: subTab === 'PAST' ? '#ffffff' : 'var(--color-ash)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 18px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}
        >
          Historial / Canceladas
        </button>
      </div>

      {/* ── Lista de Reservas ── */}
      {filteredBookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#0a0a0a',
            border: '1px dashed rgba(76, 76, 76, 0.4)',
          }}
        >
          <div style={{ marginBottom: 16, color: 'var(--color-graphite)' }}>
            <Icons.Calendar size={42} />
          </div>
          <h3 style={{ fontSize: 18, color: 'var(--color-frost)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>
            No tenés reservas registradas
          </h3>
          <p style={{ color: 'var(--color-ash)', fontSize: 13, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Tus partidos reservados con confirmación inmediata o pago dividido aparecerán aquí automáticamente para que puedas gestionar tus turnos.
          </p>
          <button
            onClick={onNavigateSearch}
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '12px 28px',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
            }}
          >
            Buscar Canchas Libres Ahora
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {filteredBookings.map((b) => {
            const isSplit = b.paymentType === 'SPLIT';
            const paidCount = b.paidPlayersCount || 1;
            const totalPlayers = b.splitPlayers || 4;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${b.clubName} ${b.clubAddress || ''}`
            )}`;
            const waHelpUrl = `https://wa.me/5492235550199?text=${encodeURIComponent(
              `Hola! Necesito consultar sobre mi reserva ${b.id} en ${b.clubName}.`
            )}`;

            return (
              <div
                key={b.id}
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(76, 76, 76, 0.5)',
                  padding: '24px 28px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  alignItems: 'center',
                }}
              >
                <div>
                  {/* Badge & Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        backgroundColor: b.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(252, 28, 70, 0.15)',
                        color: b.status === 'CONFIRMED' ? '#10b981' : 'var(--color-crimson-signal)',
                        border: `1px solid ${b.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(252, 28, 70, 0.3)'}`,
                        borderRadius: 'var(--radius-full)',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 10px',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {b.status === 'CONFIRMED' ? 'CONFIRMADA' : 'PENDIENTE'}
                    </span>

                    <span style={{ fontSize: 12, color: 'var(--color-ash)', fontFamily: 'Space Grotesk, monospace', fontWeight: 600 }}>
                      ID: {b.id}
                    </span>

                    <span style={{ fontSize: 11, color: 'var(--color-graphite)' }}>·</span>

                    <span style={{ fontSize: 11, color: 'var(--color-graphite)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {b.sport || 'PÁDEL'}
                    </span>
                  </div>

                  {/* Club & Court Title */}
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 6px' }}>
                    {b.courtName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ash)', fontSize: 13, marginBottom: 16 }}>
                    <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                    <span>{b.clubName}</span>
                    {b.clubAddress && <span>· {b.clubAddress}</span>}
                  </div>

                  {/* Schedule & Price Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-frost)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                      <span>{b.date}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                      <span>{b.startTime} – {b.endTime} hs</span>
                    </div>

                    <div style={{ color: 'var(--color-ash)', fontWeight: 600 }}>
                      Total: ${b.totalPrice?.toLocaleString('es-AR')}
                    </div>
                  </div>

                  {/* Split Payment Banner if applicable */}
                  {isSplit && (
                    <div
                      style={{
                        marginTop: 18,
                        backgroundColor: 'rgba(252, 28, 70, 0.05)',
                        border: '1px solid rgba(252, 28, 70, 0.25)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icons.Zap size={14} color="var(--color-crimson-signal)" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase' }}>
                            Pago Dividido Activo ({paidCount} de {totalPlayers} Pagados)
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                            Cada jugador abona ${(b.totalPrice / totalPlayers)?.toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={b.splitLink || `/split/${b.splitToken || b.id.toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: 'var(--color-crimson-signal)',
                            color: '#ffffff',
                            borderRadius: 'var(--radius-buttons)',
                            padding: '6px 14px',
                            fontSize: 11,
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}
                        >
                          <Icons.ExternalLink size={12} color="#ffffff" />
                          <span>Lobby de Split</span>
                        </a>

                        <button
                          onClick={() => handleCopySplit(b.splitLink || `https://hay-equipo-admin.vercel.app/split/${b.splitToken || b.id.toLowerCase()}`, b.id)}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--color-frost)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 'var(--radius-buttons)',
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Icons.Copy size={12} />
                          <span>{copiedToken === b.id ? '¡Copiado!' : 'Copiar Link'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Action Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--color-frost)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-buttons)',
                      padding: '10px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      letterSpacing: '0.4px',
                    }}
                  >
                    <Icons.MapPin size={13} color="var(--color-crimson-signal)" />
                    <span>Cómo Llegar</span>
                  </a>

                  <a
                    href={waHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: 'rgba(37, 211, 102, 0.08)',
                      color: '#25D366',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      borderRadius: 'var(--radius-buttons)',
                      padding: '10px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      letterSpacing: '0.4px',
                    }}
                  >
                    <Icons.WhatsApp size={13} color="#25D366" />
                    <span>Ayuda / Club</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
