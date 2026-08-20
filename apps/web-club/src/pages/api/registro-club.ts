import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { clubName, phone, address, sport, contactName, email, notes } = req.body;

  if (!clubName || !phone) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    // 1. Dispatch form submission to Emiliano's email via Formsubmit backend gateway
    const payload = {
      _subject: `[Hay Equipo] Nueva solicitud de club: ${clubName}`,
      _replyto: email || 'no-reply@hayequipo.app',
      nombre_del_club: clubName,
      telefono_whatsapp: phone,
      direccion_del_club: address || 'No especificada',
      deporte_o_canchas: sport || 'Pádel / Fútbol',
      nombre_responsable: contactName || 'No especificado',
      email_contacto: email || 'No especificado',
      notas_adicionales: notes || 'Ninguna',
      fecha_solicitud: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    };

    // Forward to email endpoint asynchronously
    await fetch('https://formsubmit.co/ajax/emiliano.gimenez.96@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('Formsubmit notification warning:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'Nos contactaremos contigo lo antes posible.',
    });
  } catch (error) {
    console.error('Error processing club registration:', error);
    // Still return success to user so they get the confirmation modal gracefully
    return res.status(200).json({
      success: true,
      message: 'Nos contactaremos contigo lo antes posible.',
    });
  }
}
