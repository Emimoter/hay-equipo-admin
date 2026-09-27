import type { NextApiRequest, NextApiResponse } from 'next';
import { updateBookingStatusFirestore, getBookingByIdFirestore } from '../../../services/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { bookingId, status, reason } = req.body;

    if (!bookingId || !status || (status !== 'CONFIRMED' && status !== 'REJECTED' && status !== 'EXPIRED')) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos. bookingId y status ("CONFIRMED" | "REJECTED" | "EXPIRED") son obligatorios.',
      });
    }

    const bookingBefore = await getBookingByIdFirestore(bookingId);
    if (!bookingBefore) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva.',
      });
    }

    // ── Execute Mercado Pago Capture or Release/Refund ──
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    if (accessToken && bookingBefore.mpPaymentId) {
      try {
        if (status === 'CONFIRMED') {
          // Capture authorized hold
          await fetch(`https://api.mercadopago.com/v1/payments/${bookingBefore.mpPaymentId}/capture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ capture: true }),
          });
        } else if (status === 'REJECTED' || status === 'EXPIRED') {
          // Try cancelling pre-authorization first
          const cancelRes = await fetch(`https://api.mercadopago.com/v1/payments/${bookingBefore.mpPaymentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ status: 'cancelled' }),
          });

          // If not cancellable (e.g. captured payment), issue refund
          if (!cancelRes.ok) {
            await fetch(`https://api.mercadopago.com/v1/payments/${bookingBefore.mpPaymentId}/refunds`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            });
          }
        }
      } catch (mpErr) {
        console.warn('[MercadoPago status execution warning]:', mpErr);
      }
    }

    const updated = await updateBookingStatusFirestore(bookingId, status, reason);
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo actualizar el estado de la reserva en base de datos.',
      });
    }

    const booking = await getBookingByIdFirestore(bookingId);

    return res.status(200).json({
      success: true,
      message:
        status === 'CONFIRMED'
          ? 'Turno confirmado y pago capturado con éxito.'
          : status === 'EXPIRED'
          ? 'Solicitud expirada por tiempo límite (15 min).'
          : 'Solicitud rechazada y fondos liberados.',
      booking,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error interno al procesar el estado de la reserva.',
    });
  }
}
