import React, { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Icons = {
  Close: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Mail: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Lock: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ShieldCheck: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

function getSpanishAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Contraseña o email incorrectos. Verificá tus datos.';
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con este email. ¿Deseás registrarte?';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este email. Probá iniciar sesión o usar Google.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del email no es válido.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de finalizar. Intentá nuevamente.';
    case 'auth/cancelled-popup-request':
      return 'Operación cancelada por otra solicitud simultánea.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por favor aguardá unos instantes.';
    case 'auth/invalid-verification-code':
      return 'El código SMS ingresado no es correcto.';
    case 'auth/code-expired':
      return 'El código SMS expiró. Solicitá uno nuevo.';
    case 'auth/invalid-phone-number':
      return 'Número de teléfono no válido. Recordá incluir el código de país (ej: +54 9 11...).';
    default:
      return error?.message || 'Ocurrió un error inesperado al autenticar.';
  }
}

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPhoneVerification,
    confirmPhoneCode,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setErrorMessage(null);
      setLoading(false);
      setCodeSent(false);
      setConfirmationResult(null);
      setSmsCode('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // 1. Google One-Click Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(getSpanishAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 2. Email Login / Register
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Completá tu email y contraseña.');
      return;
    }

    if (isRegisterMode && !displayName.trim()) {
      setErrorMessage('Por favor ingresá tu nombre y apellido.');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password, displayName, phone);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMessage(getSpanishAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone SMS Flow
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let cleanNumber = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanNumber) {
      setErrorMessage('Ingresá tu número de teléfono.');
      return;
    }

    // Auto-prefix Argentine country code if missing
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('15')) {
        cleanNumber = '+549' + cleanNumber.substring(2);
      } else if (cleanNumber.startsWith('11') || cleanNumber.startsWith('223') || cleanNumber.startsWith('351')) {
        cleanNumber = '+549' + cleanNumber;
      } else {
        cleanNumber = '+54' + cleanNumber;
      }
    }

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const confirmation = await sendPhoneVerification(cleanNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setCodeSent(true);
    } catch (err: any) {
      console.error('Phone SMS error:', err);
      setErrorMessage(getSpanishAuthError(err));
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySmsCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!confirmationResult || !smsCode.trim()) {
      setErrorMessage('Ingresá el código SMS de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await confirmPhoneCode(confirmationResult, smsCode, phoneName);
    } catch (err: any) {
      setErrorMessage(getSpanishAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0c0c0c',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9), 0 0 30px rgba(252, 28, 70, 0.15)',
          padding: '32px 28px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        {/* Invisible Recaptcha target */}
        <div id="recaptcha-container" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            color: 'var(--color-ash)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ash)')}
          aria-label="Cerrar ventana"
        >
          <Icons.Close size={18} />
        </button>

        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              fontSize: 10,
              color: 'var(--color-crimson-signal)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            HAY EQUIPO? · ACCESO
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-frost)',
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
              margin: 0,
            }}
          >
            {isRegisterMode ? 'Crear Tu Cuenta' : 'Iniciar Sesión'}
          </h2>
        </div>

        {/* Reason banner (e.g. from checkout) */}
        {authModalReason && (
          <div
            style={{
              backgroundColor: 'rgba(252, 28, 70, 0.08)',
              border: '1px solid rgba(252, 28, 70, 0.3)',
              padding: '10px 14px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: 'var(--color-frost)',
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: 'var(--color-crimson-signal)', flexShrink: 0 }}>
              <Icons.Lock size={15} />
            </span>
            <span>{authModalReason}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              fontSize: 12.5,
              marginBottom: 18,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* ── GOOGLE SIGN-IN (PRIMARY ONE-CLICK OPTION) ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: 'var(--radius-buttons)',
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.2px',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f1f1f1';
              e.currentTarget.style.transform = 'scale(1.01)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <GoogleIcon />
          <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
        </button>

        {/* ── DIVIDER ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '22px 0 16px',
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-graphite)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 700,
            }}
          >
            O CON OTRO MÉTODO
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* ── METHOD TABS (EMAIL VS TELEFONO) ── */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: 20,
            padding: 3,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('EMAIL');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'EMAIL' ? 'var(--color-crimson-signal)' : 'transparent',
              color: activeTab === 'EMAIL' ? '#ffffff' : 'var(--color-ash)',
              border: 'none',
              borderRadius: 'var(--radius-buttons)',
              padding: '8px 12px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <Icons.Mail size={13} />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PHONE');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'PHONE' ? 'var(--color-crimson-signal)' : 'transparent',
              color: activeTab === 'PHONE' ? '#ffffff' : 'var(--color-ash)',
              border: 'none',
              borderRadius: 'var(--radius-buttons)',
              padding: '8px 12px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <Icons.Phone size={13} />
            <span>Teléfono Móvil</span>
          </button>
        </div>

        {/* ── TAB 1: EMAIL & PASSWORD ── */}
        {activeTab === 'EMAIL' && (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isRegisterMode && (
              <>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--color-ash)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Emiliano Martínez"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--color-ash)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    WhatsApp (para confirmar reservas)
                  </label>
                  <input
                    type="tel"
                    placeholder="+54 9 11 5555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  color: 'var(--color-ash)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 5,
                  fontWeight: 700,
                }}
              >
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  color: 'var(--color-ash)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 5,
                  fontWeight: 700,
                }}
              >
                Contraseña *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  fontSize: 13,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: '100%',
                backgroundColor: 'var(--color-crimson-signal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-buttons)',
                padding: '13px',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'filter 0.2s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              {loading
                ? 'Procesando...'
                : isRegisterMode
                ? 'Crear Cuenta y Continuar →'
                : 'Ingresar →'}
            </button>

            {/* Toggle Login / Register */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ash)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 4,
                }}
              >
                {isRegisterMode
                  ? '¿Ya tenés cuenta? Iniciá sesión'
                  : '¿No tenés cuenta aún? Registrate aquí'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 2: PHONE SMS OTP ── */}
        {activeTab === 'PHONE' && (
          <div>
            {!codeSent ? (
              <form onSubmit={handleSendSms} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--color-ash)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    Tu Número de Celular
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+54 9 11 5555-0100"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--color-graphite)', marginTop: 4 }}>
                    Te enviaremos un código SMS de 6 dígitos para validar tu turno.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-buttons)',
                    padding: '13px',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? 'Enviando código...' : 'Enviar Código SMS →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySmsCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#10b981',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Código enviado a {phoneNumber}</span>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--color-ash)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    Nombre para tus Reservas
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre y apellido"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '10px 12px',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--color-ash)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    Código de 6 Dígitos
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '12px',
                      fontSize: 18,
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-buttons)',
                    padding: '13px',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? 'Verificando...' : 'Confirmar e Ingresar →'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSent(false);
                      setSmsCode('');
                      setErrorMessage(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-ash)',
                      fontSize: 11,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Reintentar con otro número
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security badge note */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 10,
            color: 'var(--color-graphite)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          <Icons.ShieldCheck size={13} />
          <span>Autenticación Segura · Red Deportiva Oficial</span>
        </div>
      </div>
    </div>
  );
};
