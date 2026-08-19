export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private sentNotifications: NotificationPayload[] = [];

  public async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    this.sentNotifications.push(payload);
    console.log(`[PUSH NOTIFICATION] To: ${payload.userId} | ${payload.title}: ${payload.body}`);
    return true;
  }

  public async notifyBookingConfirmed(userId: string, clubName: string, date: string, startTime: string) {
    return this.sendPushNotification({
      userId,
      title: '¡Reserva Confirmada! 🎾⚽',
      body: `Tenés cancha en ${clubName} para el ${date} a las ${startTime} hs. ¡A jugar!`,
      data: { type: 'BOOKING_CONFIRMED' }
    });
  }

  public async notifyWaitlistAvailable(userId: string, clubName: string, courtName: string, date: string, startTime: string) {
    return this.sendPushNotification({
      userId,
      title: '¡Cancha liberada! 🚀',
      body: `Se liberó un turno en ${clubName} (${courtName}) para el ${date} a las ${startTime} hs. ¡Apurate a reservar!`,
      data: { type: 'WAITLIST_FREE' }
    });
  }

  public getHistory(): NotificationPayload[] {
    return [...this.sentNotifications];
  }
}

export const notificationService = new NotificationService();
