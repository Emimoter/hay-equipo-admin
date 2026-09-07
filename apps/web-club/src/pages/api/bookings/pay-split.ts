import type { NextApiRequest, NextApiResponse } from 'next';
import { payBookingParticipantFirestore, getBookingByIdFirestore } from '../../../services/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { bookingId, participantName, phone } = req.body;

    if (!bookingId || !participantName) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (bookingId, participantName).',
      });
    }

    const booking = await getBookingByIdFirestore(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
    }

    const shareAmount = Math.round(booking.totalPrice / booking.splitPlayers);

    // ── Mercado Pago Preference Generation for Split Share ──
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    const hostHeader = req.headers.host || 'hay-equipo-admin.vercel.app';
    const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
    const appUrl = `${protocol}://${hostHeader}`;

    let preferenceId = `pref_split_${bookingId}_${Date.now()}`;
    let initPoint = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;

    if (accessToken) {
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items: [
              {
                id: `${bookingId}_split`,
                title: `Cuota Partido - ${booking.clubName} (${booking.courtName})`,
                description: `Cupo de ${participantName} · ${booking.date} ${booking.startTime} hs`,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: Math.max(1, shareAmount),
              },
            ],
            payer: {
              name: participantName,
              phone: { number: phone || '' },
            },
            back_urls: {
              success: `${appUrl}/split/${booking.splitToken}?status=success`,
              failure: `${appUrl}/split/${booking.splitToken}?status=failure`,
              pending: `${appUrl}/split/${booking.splitToken}?status=pending`,
            },
            auto_return: 'approved',
            notification_url: `${appUrl}/api/bookings/webhook`,
            external_reference: `${bookingId}_${Date.now()}`,
            metadata: {
              booking_id: bookingId,
              split_token: booking.splitToken,
              participant_name: participantName,
            },
          }),
        });

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          preferenceId = mpData.id;
          initPoint = mpData.init_point || mpData.sandbox_init_point || initPoint;
        }
      } catch (mpErr) {
        console.error('[MercadoPago Split Error]:', mpErr);
      }
    }

    // Process participant payment in Firestore
    const updateResult = await payBookingParticipantFirestore(bookingId, participantName, phone);

    if (!updateResult.success) {
      return res.status(400).json({ success: false, message: updateResult.error });
    }

    return res.status(200).json({
      success: true,
      booking: updateResult.booking,
      checkout: {
        preferenceId,
        initPoint,
      },
    });
  } catch (error: any) {
    console.error('Error processing split payment:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error al procesar pago de cuota.',
    });
  }
}
