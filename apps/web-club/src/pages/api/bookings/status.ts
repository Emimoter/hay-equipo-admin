import type { NextApiRequest, NextApiResponse } from 'next';
import { updateBookingStatusFirestore, getBookingByIdFirestore } from '../../../services/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { bookingId, status, reason } = req.body;

    if (!bookingId || !status || (status !== 'CONFIRMED' && status !== 'REJECTED')) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos. bookingId y status ("CONFIRMED" | "REJECTED") son obligatorios.',
      });
    }

    const updated = await updateBookingStatusFirestore(bookingId, status, reason);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva o no se pudo actualizar su estado.',
      });
    }

    const booking = await getBookingByIdFirestore(bookingId);

    return res.status(200).json({
      success: true,
      message: status === 'CONFIRMED' ? 'Turno confirmado con éxito.' : 'Solicitud rechazada.',
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
