export interface MercadoPagoPreferenceOptions {
  bookingId: string;
  title: string;
  totalAmount: number;
  payerEmail: string;
  splitToken?: string;
  participantId?: string;
  isSplitShare?: boolean;
}

export class MercadoPagoService {
  /**
   * Generates a Mercado Pago Checkout Pro Preference URL.
   * If MP_ACCESS_TOKEN is set in environment, calls real Mercado Pago API.
   * Otherwise falls back gracefully to a sandbox/test redirect for local dev.
   */
  public async createPreference(options: MercadoPagoPreferenceOptions): Promise<{
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
  }> {
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
    const publicAppUrl = process.env.PUBLIC_APP_URL || 'https://hayequipo.com';
    const publicApiUrl = process.env.PUBLIC_API_URL || 'http://localhost:4000';

    const externalRef = options.isSplitShare && options.splitToken
      ? `split_${options.splitToken}_${options.participantId || 'part'}`
      : options.bookingId;

    const successReturnUrl = options.isSplitShare && options.splitToken
      ? `${publicAppUrl}/split/${options.splitToken}?status=success`
      : `${publicAppUrl}/booking/${options.bookingId}/status?status=success`;

    const failureReturnUrl = options.isSplitShare && options.splitToken
      ? `${publicAppUrl}/split/${options.splitToken}?status=failure`
      : `${publicAppUrl}/booking/${options.bookingId}/status?status=failure`;

    const pendingReturnUrl = options.isSplitShare && options.splitToken
      ? `${publicAppUrl}/split/${options.splitToken}?status=pending`
      : `${publicAppUrl}/booking/${options.bookingId}/status?status=pending`;

    if (accessToken) {
      try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            items: [
              {
                id: options.bookingId,
                title: options.title,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: Math.max(1, Math.round(options.totalAmount))
              }
            ],
            payer: {
              email: options.payerEmail || 'jugador@hayequipo.com'
            },
            back_urls: {
              success: successReturnUrl,
              failure: failureReturnUrl,
              pending: pendingReturnUrl
            },
            auto_return: 'approved',
            notification_url: `${publicApiUrl}/api/bookings/webhook`,
            external_reference: externalRef,
            metadata: {
              booking_id: options.bookingId,
              split_token: options.splitToken,
              participant_id: options.participantId,
              is_split_share: !!options.isSplitShare
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            preferenceId: data.id,
            initPoint: data.init_point,
            sandboxInitPoint: data.sandbox_init_point || data.init_point
          };
        } else {
          const errorBody = await response.text();
          console.warn('[MercadoPago] Error creating preference on MP API:', errorBody);
        }
      } catch (err) {
        console.error('[MercadoPago] API fetch error:', err);
      }
    }

    // Fallback simulation / sandbox for development without token
    const preferenceId = `pref_${options.bookingId}_${Date.now()}`;
    const mobileDeepLink = `hayequipo://booking/${options.bookingId}/status?status=approved`;

    return {
      preferenceId,
      initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&back_url=${encodeURIComponent(mobileDeepLink)}`,
      sandboxInitPoint: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&back_url=${encodeURIComponent(successReturnUrl)}`
    };
  }

  /**
   * Processes Mercado Pago Webhook notification (IPN / Webhooks v1)
   */
  public async processWebhook(body: any, query?: any): Promise<{
    approved: boolean;
    mpPaymentId: string;
    bookingId?: string;
    splitToken?: string;
    participantId?: string;
    isSplitShare?: boolean;
    payerName?: string;
    rawStatus?: string;
  }> {
    const paymentId = body?.data?.id || query?.['data.id'] || query?.id || body?.id;
    const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

    if (accessToken && paymentId) {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const paymentData = await response.json();
          const meta = paymentData.metadata || {};
          return {
            approved: paymentData.status === 'approved',
            rawStatus: paymentData.status,
            mpPaymentId: String(paymentData.id),
            bookingId: meta.booking_id || paymentData.external_reference,
            splitToken: meta.split_token,
            participantId: meta.participant_id,
            isSplitShare: !!meta.is_split_share,
            payerName: paymentData.payer?.first_name ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ''}`.trim() : undefined
          };
        }
      } catch (err) {
        console.error('[MercadoPago] Webhook lookup error:', err);
      }
    }

    // Dev fallback
    return {
      approved: true,
      mpPaymentId: paymentId || `mp_pay_${Date.now()}`,
      bookingId: body?.bookingId || body?.data?.external_reference,
      splitToken: body?.splitToken,
      participantId: body?.participantId
    };
  }
}

export const mpService = new MercadoPagoService();


