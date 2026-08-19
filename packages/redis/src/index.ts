import { EventEmitter } from 'events';

export interface LockEntry {
  userId: string;
  expiresAt: number; // Unix timestamp in ms
}

class RedisLockManager {
  private locks: Map<string, LockEntry> = new Map();
  public events: EventEmitter = new EventEmitter();

  private getLockKey(courtId: string, date: string, startTime: string): string {
    return `lock:court:${courtId}:${date}:${startTime}`;
  }

  /**
   * Tenta adquirir o bloqueio temporário (Hold de 7 minutos)
   * Retorna true se adquirido, false se já bloqueado por outro usuário
   */
  public acquireCourtHold(
    courtId: string,
    date: string,
    startTime: string,
    userId: string,
    ttlSeconds = 420 // 7 minutes
  ): { success: boolean; expiresAt?: string; message?: string } {
    const key = this.getLockKey(courtId, date, startTime);
    const now = Date.now();
    const existing = this.locks.get(key);

    if (existing) {
      if (existing.expiresAt > now && existing.userId !== userId) {
        return {
          success: false,
          message: 'Este turno está siendo reservado por otro jugador en este momento (bloqueo temporal de 7 min).'
        };
      }
    }

    const expiresAtMs = now + ttlSeconds * 1000;
    this.locks.set(key, { userId, expiresAt: expiresAtMs });

    // Emite evento para sincronização em tempo real (SSE / WebSocket)
    this.events.emit('slot:held', {
      courtId,
      date,
      startTime,
      userId,
      expiresAt: new Date(expiresAtMs).toISOString()
    });

    return {
      success: true,
      expiresAt: new Date(expiresAtMs).toISOString()
    };
  }

  /**
   * Libera o bloqueio temporário
   */
  public releaseCourtHold(courtId: string, date: string, startTime: string, userId?: string): boolean {
    const key = this.getLockKey(courtId, date, startTime);
    const existing = this.locks.get(key);

    if (existing) {
      if (!userId || existing.userId === userId) {
        this.locks.delete(key);
        this.events.emit('slot:released', { courtId, date, startTime });
        return true;
      }
    }
    return false;
  }

  /**
   * Consulta se o slot está em hold ativo
   */
  public getActiveHold(courtId: string, date: string, startTime: string): LockEntry | null {
    const key = this.getLockKey(courtId, date, startTime);
    const existing = this.locks.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      return existing;
    }
    if (existing && existing.expiresAt <= Date.now()) {
      this.locks.delete(key);
      this.events.emit('slot:released', { courtId, date, startTime });
    }
    return null;
  }
}

export const redisLock = new RedisLockManager();
