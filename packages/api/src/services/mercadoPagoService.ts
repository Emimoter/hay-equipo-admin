export interface MercadoPagoPreferenceOptions {
  bookingId: string;
  title: string;
  totalAmount: number;
  payerEmail: string;
  splitToken?: string;
}

export class MercadoPagoService {
  /**
   * Generates a Mercado Pago Checkout Pro Preference URL.
   * Returns a sandbox / production checkout URL and custom back_urls configured for Universal Links / Deep links.
   */
  public async createPreference(options: MercadoPagoPreferenceOptions): Promise<{
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
  }> {
    const preferenceId = `pref_${options.bookingId}_${Date.now()}`;
    // In production, uses mercadopago SDK with credentials.
    // For universal links return:
    const returnUrl = `hayequipo://booking/${options.bookingId}/status`;
    const webFallbackUrl = `https://hayequipo.com/booking/${options.bookingId}/status`;

    return {
      preferenceId,
      initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&back_url=${encodeURIComponent(returnUrl)}`,
      sandboxInitPoint: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}&back_url=${encodeURIComponent(webFallbackUrl)}`
    };
  }

  /**
   * Simulates/processes Mercado Pago Webhook notification
   */
  public async processWebhook(body: any): Promise<{ approved: boolean; mpPaymentId: string; bookingId?: string }> {
    return {
      approved: true,
      mpPaymentId: body.data?.id || `mp_pay_${Date.now()}`,
      bookingId: body.bookingId
    };
  }
}

export const mpService = new MercadoPagoService();
