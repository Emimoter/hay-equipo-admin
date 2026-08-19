import React, { useState, useEffect } from 'react';

export default function SplitCheckoutWebPage() {
  const [token, setToken] = useState<string>('split-seed-token-123');
  const [splitData, setSplitData] = useState<any>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerPhone, setPlayerPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [paidSuccess, setPaidSuccess] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    // In real Next.js router, grabs router.query.token
    loadSplitInfo('split-seed-token-123');
  }, []);

  const loadSplitInfo = async (shareToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/split/${shareToken}`);
      const json = await res.json();
      if (json.success) {
        setSplitData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch(`http://localhost:4000/api/split/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName || 'Jugador Invitado',
          playerPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaidSuccess(true);
      }
    } catch (e) {
      alert('Error procesando pago');
    }
    setProcessing(false);
  };

  const shareAmount = splitData?.participants?.[0]?.amount || 11250;

  return (
    <div style={{ backgroundColor: '#0B0F17', color: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#161F30', border: '1px solid #23324A', borderRadius: '20px', padding: '28px', boxSizing: 'border-box' }}>
        {/* Header Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ background: '#22C55E', color: '#0B0F17', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px' }}>
            HE
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#FFF', letterSpacing: '-0.5px' }}>HAY EQUIPO</span>
        </div>

        {!paidSuccess ? (
          <div>
            {/* Invitation Info */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎾</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>Emiliano te invitó a jugar</h2>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
                {splitData?.club?.name || 'Arena Pádel Palermo'} · {splitData?.booking?.date || 'Hoy'} a las {splitData?.booking?.startTime || '19:30'} hs
              </p>
            </div>

            {/* Price Box */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Tu parte a pagar</span>
              <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#22C55E', margin: '4px 0 0 0' }}>
                ${shareAmount.toLocaleString('es-AR')}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Tu Nombre completo:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Juan Silva"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>Tu Celular (WhatsApp):</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 ..."
                  value={playerPhone}
                  onChange={(e) => setPlayerPhone(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  backgroundColor: '#22C55E',
                  color: '#0B0F17',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processing ? 'Procesando...' : `💳 Pagar $${shareAmount.toLocaleString('es-AR')} con Mercado Pago`}
              </button>

              <span style={{ color: '#64748B', fontSize: '11px', textAlign: 'center' }}>
                🔒 Pago seguro sin necesidad de registrarte ni descargar la app
              </span>
            </form>
          </div>
        ) : (
          /* Post Payment Conversion Screen */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#22C55E', margin: '0 0 8px 0' }}>¡Pago Confirmado!</h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '20px', marginBottom: '24px' }}>
              Ya tenés tu lugar reservado en la cancha. Te enviamos el comprobante y la ubicación por WhatsApp.
            </p>

            <div style={{ backgroundColor: '#1E293B', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '1px solid #334155' }}>
              <span style={{ color: '#CCFF00', fontSize: '13px', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                📲 DESCARGÁ LA APP HAY EQUIPO
              </span>
              <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>
                Para ver el partido en vivo, cómo llegar con GPS, próximos partidos y organizar tus propios turnos.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <a
                  href="#"
                  style={{ flex: 1, backgroundColor: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, border: '1px solid #334155' }}
                >
                  🍏 App Store
                </a>
                <a
                  href="#"
                  style={{ flex: 1, backgroundColor: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, border: '1px solid #334155' }}
                >
                  🤖 Google Play
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
