import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PerfilTabProps {
  onNavigateReservas: () => void;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
}

const Icons = {
  User: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Trophy: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  ShieldCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
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
  Smartphone: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Lock: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export const PerfilTab: React.FC<PerfilTabProps> = ({
  onNavigateReservas,
  buyerName = 'Emiliano',
  buyerPhone = '+54 9 11 5555-0001',
  buyerEmail = 'emiliano@hayequipo.com.ar',
}) => {
  const { user, userProfile, logout, openAuthModal, updateUserProfileData } = useAuth();

  const [name, setName] = useState(userProfile?.name || user?.displayName || buyerName);
  const [phone, setPhone] = useState(userProfile?.phone || user?.phoneNumber || buyerPhone);
  const [padelCategory, setPadelCategory] = useState(userProfile?.padelCategory || '5ta Categoría');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.padelCategory) setPadelCategory(userProfile.padelCategory);
    } else if (user) {
      if (user.displayName) setName(user.displayName);
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [userProfile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (user) {
        await updateUserProfileData({
          name: name.trim(),
          phone: phone.trim(),
          padelCategory,
        });
      } else {
        localStorage.setItem(
          'hay_equipo_user_profile',
          JSON.stringify({ name: name.trim(), phone: phone.trim(), padelCategory })
        );
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: 'var(--color-crimson-signal)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
          05 / FICHA DEPORTIVA DEL JUGADOR
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
          Mi Perfil
        </h1>
      </div>

      {!user ? (
        /* ── Si NO está autenticado: Banner de Acceso Directo ── */
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(252, 28, 70, 0.3)',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(252, 28, 70, 0.1)',
          }}
        >
          <div style={{ color: 'var(--color-crimson-signal)', marginBottom: 16 }}>
            <Icons.Lock size={44} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', marginBottom: 10 }}>
            Iniciá sesión para gestionar tu ficha deportiva
          </h2>
          <p style={{ color: 'var(--color-ash)', fontSize: 14, maxWidth: 500, margin: '0 auto 26px', lineHeight: 1.6 }}>
            Accedé con tu cuenta de Google, Email o Teléfono para sincronizar tus reservas, guardar tu categoría de juego y recibir avisos de tus partidos.
          </p>
          <button
            onClick={() => openAuthModal('Iniciá sesión para ver tu perfil deportivo')}
            style={{
              backgroundColor: 'var(--color-crimson-signal)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-buttons)',
              padding: '14px 32px',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(252, 28, 70, 0.45)',
            }}
          >
            Iniciar Sesión / Registrarme
          </button>
        </div>
      ) : (
        /* ── Si ESTÁ autenticado: Vista completa del Perfil ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* ── Tarjeta de Identidad Deportiva ── */}
          <div
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(76, 76, 76, 0.4)',
              padding: '28px',
            }}
          >
            {/* Avatar & Nombre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-crimson-signal)',
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.35)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: 'var(--color-crimson-signal)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '1px',
                    boxShadow: '0 0 20px rgba(252, 28, 70, 0.4)',
                  }}
                >
                  {name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 4px' }}>
                  {name}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--color-ash)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Jugador Verificado · Platino</span>
                </div>
                {user.email && (
                  <div style={{ fontSize: 11, color: 'var(--color-graphite)', marginTop: 2 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-frost)' }}>24</div>
                <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Partidos</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>98%</div>
                <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Puntualidad</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-crimson-signal)' }}>4.9</div>
                <div style={{ fontSize: 10, color: 'var(--color-ash)', textTransform: 'uppercase', marginTop: 4 }}>Fair Play</div>
              </div>
            </div>

            {/* Categoría y Datos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(76, 76, 76, 0.2)', paddingBottom: 10 }}>
                <span style={{ color: 'var(--color-ash)' }}>Pádel:</span>
                <span style={{ color: 'var(--color-frost)', fontWeight: 700 }}>{padelCategory}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(76, 76, 76, 0.2)', paddingBottom: 10 }}>
                <span style={{ color: 'var(--color-ash)' }}>Fútbol:</span>
                <span style={{ color: 'var(--color-frost)', fontWeight: 700 }}>Fútbol 7 · Mediocampista</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(76, 76, 76, 0.2)', paddingBottom: 10 }}>
                <span style={{ color: 'var(--color-ash)' }}>WhatsApp:</span>
                <span style={{ color: 'var(--color-frost)', fontWeight: 600 }}>{phone || 'No registrado'}</span>
              </div>
            </div>

            <button
              onClick={onNavigateReservas}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-buttons)',
                padding: '12px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
              <span>Ver Mis Reservas Activas</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-buttons)',
                padding: '11px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                marginTop: 12,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cerrar Sesión
            </button>
          </div>

          {/* ── Editar Datos ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(76, 76, 76, 0.4)',
                padding: '28px',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-frost)', margin: '0 0 16px', textTransform: 'uppercase' }}>
                Datos de Reserva y Contacto
              </h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                    Nombre y Apellido
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(76, 76, 76, 0.4)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                    WhatsApp (para confirmaciones de turno)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(76, 76, 76, 0.4)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                    Categoría de Pádel
                  </label>
                  <select
                    value={padelCategory}
                    onChange={(e) => setPadelCategory(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#141414',
                      border: '1px solid rgba(76, 76, 76, 0.4)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    <option value="7ma Categoría (Iniciación)">7ma Categoría (Iniciación)</option>
                    <option value="6ta Categoría (Principiante)">6ta Categoría (Principiante)</option>
                    <option value="5ta Categoría (Intermedio)">5ta Categoría (Intermedio)</option>
                    <option value="4ta Categoría (Avanzado)">4ta Categoría (Avanzado)</option>
                    <option value="3ra / 2da (Primera)">3ra / 2da (Primera)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-buttons)',
                    padding: '12px 24px',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: isSaving ? 'wait' : 'pointer',
                    marginTop: 6,
                  }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
                </button>

                {savedSuccess && (
                  <div style={{ fontSize: 12, color: '#10b981', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Preferencias actualizadas correctamente en tu cuenta</span>
                  </div>
                )}
              </form>
            </div>

            {/* App Mobile Callout */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icons.Smartphone size={24} color="var(--color-crimson-signal)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>
                    Llevá Hay Equipo en tu Bolsillo
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-ash)' }}>
                    Notificaciones de turnos, check-in por QR y división de pagos directa.
                  </div>
                </div>
              </div>
              <a
                href="/#descargar"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-buttons)',
                  padding: '8px 16px',
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Descargar App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
