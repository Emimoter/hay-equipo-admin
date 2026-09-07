import type { NextApiRequest, NextApiResponse } from 'next';
import { getBookingByIdFirestore, createBookingFirestore } from '../../../services/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Respond 200 immediately to Mercado Pago
  try {
    const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id || req.body?.id;
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

    if (accessToken && paymentId) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (mpResponse.ok) {
        const paymentData = await mpResponse.json();
        const bookingId = paymentData.metadata?.booking_id || paymentData.external_reference;

        if (bookingId && paymentData.status === 'approved') {
          const booking = await getBookingByIdFirestore(bookingId);
          if (booking) {
            booking.status = 'CONFIRMED';
            booking.updatedAt = new Date().toISOString();
            await createBookingFirestore(booking);
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ received: true });
  }
}
