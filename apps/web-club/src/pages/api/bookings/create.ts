import type { NextApiRequest, NextApiResponse } from 'next';
import { createBookingFirestore, BookingRecord } from '../../../services/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { club, slot, buyer, paymentType = 'FULL', splitPlayers = 4, userId } = req.body;

    if (!club?.id || !slot?.courtName || !buyer?.name || !buyer?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios para generar la reserva.',
      });
    }

    // Generate unique booking code
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `HE-${randomNum}`;
    const splitToken = bookingId.toLowerCase();

    // Determine host app URL
    const hostHeader = req.headers.host || 'hay-equipo-admin.vercel.app';
    const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
    const appUrl = `${protocol}://${hostHeader}`;
    const splitLink = `${appUrl}/split/${splitToken}`;

    const parsedSplitPlayers = Number(splitPlayers) || (slot.sport === 'FUTBOL' ? 10 : 4);
    const totalPrice = Number(slot.price) || 28000;
    const serviceFee = paymentType === 'FULL' ? 1500 : 500;
    const sharePrice = Math.round(totalPrice / parsedSplitPlayers);
    const amountToPay = paymentType === 'FULL' ? totalPrice + serviceFee : sharePrice + serviceFee;

    // Participants initialization
    const participants = Array.from({ length: parsedSplitPlayers }).map((_, i) => ({
      id: `part_${i + 1}`,
      name: i === 0 ? buyer.name : `Jugador ${i + 1}`,
      phone: i === 0 ? buyer.phone : '',
      amount: sharePrice,
      status: (i === 0 || paymentType === 'FULL' ? 'PAID' : 'PENDING') as 'PAID' | 'PENDING',
      isHost: i === 0,
      paidAt: i === 0 || paymentType === 'FULL' ? new Date().toISOString() : '',
    }));

    // ── Mercado Pago Preference Generation ──
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    let preferenceId = `pref_${bookingId}_${Date.now()}`;
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
                id: bookingId,
                title: `Reserva ${slot.courtName} - ${club.name}`,
                description: `${slot.sport} · ${slot.date} ${slot.startTime} hs`,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: Math.max(1, amountToPay),
              },
            ],
            payer: {
              name: buyer.name,
              email: buyer.email || 'jugador@hayequipo.com.ar',
              phone: {
                number: buyer.phone,
              },
            },
            back_urls: {
              success: `${appUrl}/reservar?bookingId=${bookingId}&status=success`,
              failure: `${appUrl}/reservar?bookingId=${bookingId}&status=failure`,
              pending: `${appUrl}/reservar?bookingId=${bookingId}&status=pending`,
            },
            auto_return: 'approved',
            notification_url: `${appUrl}/api/bookings/webhook`,
            external_reference: bookingId,
            metadata: {
              booking_id: bookingId,
              club_id: club.id,
              split_token: splitToken,
              payment_type: paymentType,
            },
          }),
        });

        if (mpResponse.ok) {
          const mpData = await mpResponse.json();
          preferenceId = mpData.id;
          initPoint = mpData.init_point || mpData.sandbox_init_point || initPoint;
        } else {
          const errText = await mpResponse.text();
          console.warn('[MercadoPago API Warning]:', errText);
        }
      } catch (mpErr) {
        console.error('[MercadoPago Fetch Error]:', mpErr);
      }
    }

    // ── Create Booking in Firestore ──
    const newBooking: BookingRecord = {
      id: bookingId,
      userId: userId ? String(userId).trim() : undefined,
      clubId: club.id,
      clubName: club.name,
      clubAddress: club.address || club.city || '',
      courtId: slot.courtId || `c-${Math.random().toString(36).substring(7)}`,
      courtName: slot.courtName,
      sport: slot.sport || 'PADEL',
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      totalPrice,
      serviceFee,
      totalPaid: amountToPay,
      paymentType,
      splitPlayers: parsedSplitPlayers,
      paidPlayersCount: paymentType === 'FULL' ? parsedSplitPlayers : 1,
      status: 'CONFIRMED',
      buyer: {
        name: buyer.name,
        email: buyer.email || '',
        phone: buyer.phone,
      },
      participants,
      splitToken,
      splitLink,
      mpPreferenceId: preferenceId,
      mpInitPoint: initPoint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await createBookingFirestore(newBooking);

    return res.status(200).json({
      success: true,
      booking: newBooking,
      checkout: {
        preferenceId,
        initPoint,
      },
      firestoreSaved: saved,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error interno del servidor al crear reserva.',
    });
  }
}
