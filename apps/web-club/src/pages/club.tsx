import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  getClubsFirestore,
  getCourtsFirestore,
  saveCourtsFirestore,
  listenClubBookingsFirestore,
  updateBookingStatusFirestore,
  getClubPublishedSlotsFirestore,
  saveClubPublishedSlotsFirestore,
  getClubActiveSlotsFirestore,
  saveClubActiveSlotFirestore,
  deleteClubActiveSlotFirestore,
  linkClubAdminEmailFirestore,
  BookingRecord,
  PublishedSlotRecord,
} from '../services/firebase';
import { SportBadge } from '../components/SportBadge';

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

type ClubTab = 'DASHBOARD' | 'REQUESTS' | 'PUBLISH_SLOTS' | 'COURTS' | 'PAYOUTS';

interface CourtItem {
  id: string;
  clubId: string;
  name: string;
  sportType: string;
  surface?: string;
  pricePerHour: number;
  durationMinutes?: number;
  isCovered: boolean;
  hasLighting: boolean;
  hasCameras?: boolean;
  hasHeating?: boolean;
  openTime?: string;
  closeTime?: string;
  active: boolean;
}

const DEFAULT_HOURS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30',
  '17:00', '18:30', '20:00', '21:30', '23:00'
];

/* ────────────────────────────────────────────────────────────
   Vector Icons (Strict Zero-Emoji Compliance)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  Dashboard: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="3" y="3" width="7" height="7" rx="0" />
      <rect x="14" y="3" width="7" height="7" rx="0" />
      <rect x="14" y="14" width="7" height="7" rx="0" />
      <rect x="3" y="14" width="7" height="7" rx="0" />
    </svg>
  ),
  Pitch: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="2" y="4" width="20" height="16" rx="0" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="12" cy="12" r="3" />
      <path d="M2 9h3v6H2" />
      <path d="M22 9h-3v6h3" />
    </svg>
  ),
  Bell: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Volume: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeX: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  Check: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Close: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Clock: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Calendar: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Repeat: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.3z" />
    </svg>
  ),
  Plus: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  DollarSign: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  LogOut: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Google: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  ),
  UserCheck: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  Trash: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  ChevronLeft: ({ size = 14, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: ({ size = 14, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronDown: ({ size = 14, color = 'currentColor', style }: { size?: number; color?: string; style?: React.CSSProperties }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  SettingsSliders: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Indoor: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Outdoor: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Lighting: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.92 1.6 3.9.7.7 1.13 1.56 1.3 2.5" />
    </svg>
  ),
  NoLighting: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Camera: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  CameraOff: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="1" y1="1" x2="23" y2="23" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /><polygon points="23 7 16 12 23 17 23 7" />
    </svg>
  ),
  Climate: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
    </svg>
  ),
  Wind: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" /><path d="M12.59 19.41A2 2 0 1 0 14 16H2" /><path d="M15.73 8.27A2.5 2.5 0 1 1 17.5 12H2" />
    </svg>
  ),
  Moon: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────
   Audio Chime (Web Audio API)
   ──────────────────────────────────────────────────────────── */

function playRequestAlertChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(740, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(988, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getFormattedDate(offsetDays: number = 0): { value: string; label: string; sublabel: string } {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const val = `${year}-${month}-${day}`;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayName = dayNames[d.getDay()];

  let label = `${dayName} ${day}/${month}`;
  if (offsetDays === 0) label = 'Hoy';
  if (offsetDays === 1) label = 'Mañana';

  return { value: val, label, sublabel: `${day}/${month}` };
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getAfterTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function formatSlotDateBadge(dateStr: string): { main: string; sub: string; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) return { main: 'FECHA', sub: '', isToday: false, isTomorrow: false };
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  const dayName = dayNames[target.getDay()];
  const monthName = monthNames[target.getMonth()];

  if (diffDays === 0) {
    return { main: `HOY · ${d} ${monthName}`, sub: dayName, isToday: true, isTomorrow: false };
  }
  if (diffDays === 1) {
    return { main: `MAÑANA · ${d} ${monthName}`, sub: dayName, isToday: false, isTomorrow: true };
  }
  return { main: `${dayName} ${d} ${monthName}`, sub: `${d}/${m}`, isToday: false, isTomorrow: false };
}

function getSportLabel(sport?: string): string {
  if (!sport) return 'Pádel';
  if (sport === 'PADEL') return 'Pádel';
  if (sport.startsWith('FUTBOL_5')) return 'Fútbol 5';
  if (sport.startsWith('FUTBOL_7')) return 'Fútbol 7';
  if (sport.startsWith('FUTBOL_11')) return 'Fútbol 11';
  if (sport.startsWith('FUTBOL')) return 'Fútbol';
  return sport;
}

const AVAILABLE_START_HOURS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

interface CalendarWidgetProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  calendarMonth: Date;
  onChangeMonth: (delta: number) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onSelectDate,
  calendarMonth,
  onChangeMonth,
}) => {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingDay = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = getTodayString();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-elevate)',
        border: '1px solid var(--color-graphite)',
        borderRadius: '0px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChangeMonth(-1);
          }}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--color-graphite)',
            borderRadius: 'var(--radius-full)',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-ash)',
            cursor: 'pointer',
          }}
          title="Mes anterior"
        >
          <Icons.ChevronLeft size={14} />
        </button>

        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {monthNames[month]} {year}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChangeMonth(1);
          }}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--color-graphite)',
            borderRadius: 'var(--radius-full)',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-ash)',
            cursor: 'pointer',
          }}
          title="Mes siguiente"
        >
          <Icons.ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6, textAlign: 'center' }}>
        {weekDays.map((wd) => (
          <span key={wd} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase' }}>
            {wd}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`blank_${i}`} style={{ height: 32 }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isPast = dayStr < todayStr;
          const isSelected = dayStr === selectedDate;
          const isToday = dayStr === todayStr;

          return (
            <button
              key={dayStr}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(dayStr)}
              style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSelected
                  ? 'var(--color-crimson-signal)'
                  : isToday
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isPast
                  ? 'var(--color-ash)'
                  : 'var(--color-frost)',
                border: isSelected
                  ? '1px solid var(--color-crimson-signal)'
                  : isToday
                  ? '1px solid var(--color-graphite)'
                  : '1px solid transparent',
                fontSize: 12,
                fontWeight: isSelected || isToday ? 700 : 500,
                opacity: isPast ? 0.25 : 1,
                cursor: isPast ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   Tactical Pitch Watermark (Sports Blueprint SVG)
   ──────────────────────────────────────────────────────────── */

const TacticalPitchWatermark: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' }}>
    {/* Left court tactical lines */}
    <svg
      style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', opacity: 0.14 }}
      width="320"
      height="260"
      viewBox="0 0 320 260"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.2"
    >
      <ellipse cx="80" cy="130" rx="100" ry="70" strokeDasharray="5 5" />
      <line x1="20" y1="30" x2="260" y2="75" />
      <line x1="20" y1="230" x2="260" y2="185" />
      <line x1="260" y1="75" x2="260" y2="185" />
      <circle cx="260" cy="130" r="36" />
    </svg>

    {/* Right court tactical lines */}
    <svg
      style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', opacity: 0.14 }}
      width="320"
      height="260"
      viewBox="0 0 320 260"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.2"
    >
      <line x1="60" y1="75" x2="300" y2="30" />
      <line x1="60" y1="185" x2="300" y2="230" />
      <line x1="60" y1="75" x2="60" y2="185" />
      <ellipse cx="240" cy="130" rx="100" ry="70" strokeDasharray="5 5" />
      <circle cx="60" cy="130" r="36" />
    </svg>
  </div>
);

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT: /club (TERMINAL EXCLUSIVA DE CLUBES)
   ──────────────────────────────────────────────────────────── */

export default function ClubPage() {
  const router = useRouter();
  const { user, userProfile, loginWithGoogle, loginWithEmail, logout, loading: authLoading } = useAuth();

  // Club session state
  const [activeClub, setActiveClub] = useState<any | null>(null);
  const [clubsList, setClubsList] = useState<any[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);

  // Manual linking claim input
  const [claimInput, setClaimInput] = useState('');
  const [claimMessage, setClaimMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isLinkingClaim, setIsLinkingClaim] = useState(false);

  // Add staff email modal
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [staffModalSuccess, setStaffModalSuccess] = useState(false);

  // Reception controls
  const [isReceptionOpen, setIsReceptionOpen] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Tabs (Dashboard, Solicitudes, Publicar Turnos, Mis Canchas, Liquidaciones)
  const [activeTab, setActiveTab] = useState<ClubTab>('REQUESTS');

  // Real Data (100% Firebase, ZERO MOCKS)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Solicitudes Filter
  const [requestFilter, setRequestFilter] = useState<'PENDING' | 'ALL' | 'CONFIRMED' | 'REJECTED'>('PENDING');

  // Rejection modal
  const [rejectBooking, setRejectBooking] = useState<BookingRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Cancha ocupada presencialmente en el club');
  const [isActionPending, setIsActionPending] = useState(false);

  // Active published slots (rich records)
  const [activeSlots, setActiveSlots] = useState<PublishedSlotRecord[]>([]);
  const [activeSlotsFilter, setActiveSlotsFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'UPCOMING'>('ALL');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Publish new slot modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCourtId, setPublishCourtId] = useState('');
  const [publishDate, setPublishDate] = useState(() => getTodayString());
  const [publishStartTime, setPublishStartTime] = useState('19:00');
  const [publishDuration, setPublishDuration] = useState<number>(90);
  const [publishPrice, setPublishPrice] = useState<number>(24000);
  const [publishIsCovered, setPublishIsCovered] = useState(true);
  const [publishHasLighting, setPublishHasLighting] = useState(true);
  const [publishIsFixedSlot, setPublishIsFixedSlot] = useState(false);
  const [isPublishingSlot, setIsPublishingSlot] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Slot delete confirmation state
  const [slotToDelete, setSlotToDelete] = useState<PublishedSlotRecord | null>(null);
  const [isDeletingSlot, setIsDeletingSlot] = useState(false);

  // Court edit/add modal (matching /panel design)
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtItem | null>(null);
  const [courtNameInput, setCourtNameInput] = useState('');
  const [courtSportInput, setCourtSportInput] = useState('Pádel');
  const [courtIndoorInput, setCourtIndoorInput] = useState(true);
  const [courtLightingInput, setCourtLightingInput] = useState(true);
  const [courtCamerasInput, setCourtCamerasInput] = useState(true);
  const [courtHeatingInput, setCourtHeatingInput] = useState(false);
  const [courtSurfaceInput, setCourtSurfaceInput] = useState('');
  const [isCourtSaving, setIsCourtSaving] = useState(false);

  // Payout alias
  const [cbuAlias, setCbuAlias] = useState('');
  const [aliasSaved, setAliasSaved] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Audio alert tracking
  const knownPendingIds = useRef<Set<string>>(new Set());

  // 1. Fetch available clubs from Firestore and detect match with user's Google Account
  const loadClubsAndMatch = useCallback(async () => {
    setIsLoadingClubs(true);
    const data = await getClubsFirestore();
    const loadedList = Array.isArray(data) ? data : [];
    setClubsList(loadedList);

    // If user is authenticated, resolve their club
    if (user?.email) {
      const userEmail = user.email.trim().toLowerCase();
      const userUid = user.uid;

      // Check URL for auto-claim / linking param
      const claimParam = (router.query.vincular || router.query.claim) as string;
      if (claimParam) {
        const targetClub = loadedList.find(
          (c: any) => c.id === claimParam || c.slug === claimParam
        );
        if (targetClub) {
          await linkClubAdminEmailFirestore(targetClub.id, userEmail, userUid);
          setActiveClub(targetClub);
          setIsLoadingClubs(false);
          return;
        }
      }

      // Normal lookup: match adminEmails array or adminEmail or ownerUid
      const matched = loadedList.find((c: any) => {
        const emails: string[] = Array.isArray(c.adminEmails)
          ? c.adminEmails.map((e: string) => String(e).trim().toLowerCase())
          : c.adminEmail ? [String(c.adminEmail).trim().toLowerCase()] : [];

        const matchesEmail = emails.includes(userEmail);
        const matchesUid = c.ownerUid && c.ownerUid === userUid;
        return matchesEmail || matchesUid;
      });

      if (matched) {
        setActiveClub(matched);
      } else {
        setActiveClub(null);
      }
    } else {
      setActiveClub(null);
    }

    setIsLoadingClubs(false);
  }, [user, router.query]);

  useEffect(() => {
    loadClubsAndMatch();
  }, [loadClubsAndMatch]);

  // 2. Load Real Courts for Active Club ONLY (No mocks)
  const loadClubCourts = useCallback(async () => {
    if (!activeClub?.id) return;
    setIsLoadingData(true);
    const allCourts = await getCourtsFirestore();
    if (Array.isArray(allCourts)) {
      const filtered = allCourts.filter((c: any) => c.clubId === activeClub.id);
      setCourts(filtered);
    } else {
      setCourts([]);
    }
    setIsLoadingData(false);
  }, [activeClub?.id]);

  useEffect(() => {
    loadClubCourts();
  }, [loadClubCourts]);

  // 3. Listen to Real-time Bookings for Active Club ONLY
  useEffect(() => {
    if (!activeClub?.id) return;

    const unsubscribe = listenClubBookingsFirestore(activeClub.id, (clubBookings) => {
      setBookings(clubBookings);

      // Trigger audio chime only on brand new PENDING requests
      const pendings = clubBookings.filter((b) => b.status === 'PENDING');
      const brandNew = pendings.filter((b) => !knownPendingIds.current.has(b.id));

      if (brandNew.length > 0 && isSoundOn) {
        playRequestAlertChime();
      }

      knownPendingIds.current = new Set(pendings.map((b) => b.id));
    });

    return () => {
      unsubscribe();
    };
  }, [activeClub?.id, isSoundOn]);

  // 4. Update Tab Title with pending counter
  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'PENDING').length;
  }, [bookings]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) ¡SOLICITUD! — Hay Equipo Club`;
    } else {
      document.title = activeClub?.name ? `${activeClub.name} — Terminal Club` : 'Terminal Club — Hay Equipo?';
    }
  }, [pendingCount, activeClub?.name]);

  // 5. Load Active Published Slots from Firestore
  const loadActiveSlots = useCallback(async () => {
    if (!activeClub?.id) return;
    setIsLoadingSlots(true);
    try {
      const list = await getClubActiveSlotsFirestore(activeClub.id);
      setActiveSlots(list || []);
    } catch (err) {
      console.error('Error fetching active slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [activeClub?.id]);

  useEffect(() => {
    loadActiveSlots();
  }, [loadActiveSlots]);

  // Publish a new slot handler
  const handlePublishNewSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClub?.id) return;

    const targetCourt = courts.find((c) => c.id === publishCourtId) || courts[0];
    if (!targetCourt) {
      setPublishError('Debés registrar o seleccionar una cancha antes de publicar.');
      return;
    }
    if (!publishDate) {
      setPublishError('Seleccioná la fecha del turno.');
      return;
    }
    if (!publishStartTime) {
      setPublishError('Seleccioná la hora de inicio del turno.');
      return;
    }

    setIsPublishingSlot(true);
    setPublishError('');

    const calculatedEnd = calculateEndTime(publishStartTime, publishDuration);
    const newSlotId = `slot_${activeClub.id}_${targetCourt.id}_${publishDate}_${publishStartTime.replace(':', '')}_${Date.now()}`;

    const newRecord: PublishedSlotRecord = JSON.parse(
      JSON.stringify({
        id: newSlotId,
        clubId: activeClub.id,
        clubName: activeClub.name || 'Club de Prueba',
        courtId: targetCourt.id,
        courtName: targetCourt.name || 'Cancha',
        sportType: targetCourt.sportType || 'PADEL',
        date: publishDate,
        startTime: publishStartTime,
        endTime: calculatedEnd,
        durationMinutes: publishDuration,
        price: Number(publishPrice) || targetCourt.pricePerHour || 24000,
        isCovered: Boolean(publishIsCovered),
        hasLighting: Boolean(publishHasLighting),
        isFixedSlot: Boolean(publishIsFixedSlot),
        surface: targetCourt.surface || 'Césped Sintético',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      })
    );

    try {
      const ok = await saveClubActiveSlotFirestore(activeClub.id, newRecord);
      if (ok) {
        setActiveSlots((prev) => [newRecord, ...prev.filter((s) => s.id !== newSlotId)]);
        setIsPublishModalOpen(false);
      } else {
        setPublishError('No se pudo guardar el turno en Firebase. Intente nuevamente.');
      }
    } catch (err: any) {
      console.error('Error publishing slot:', err);
      setPublishError(err?.message || 'Error al guardar el turno');
    } finally {
      setIsPublishingSlot(false);
    }
  };

  // Delete an active slot
  const handleConfirmDeleteSlot = async () => {
    if (!activeClub?.id || !slotToDelete) return;
    setIsDeletingSlot(true);
    try {
      const ok = await deleteClubActiveSlotFirestore(activeClub.id, slotToDelete.id);
      if (ok) {
        setActiveSlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
        setSlotToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting active slot:', err);
    } finally {
      setIsDeletingSlot(false);
    }
  };

  const todayStr = useMemo(() => getTodayString(), []);
  const tomorrowStr = useMemo(() => getTomorrowString(), []);

  const filteredActiveSlots = useMemo(() => {
    return activeSlots.filter((slot) => {
      if (activeSlotsFilter === 'TODAY') return slot.date === todayStr;
      if (activeSlotsFilter === 'TOMORROW') return slot.date === tomorrowStr;
      if (activeSlotsFilter === 'UPCOMING') return slot.date > tomorrowStr;
      return true;
    });
  }, [activeSlots, activeSlotsFilter, todayStr, tomorrowStr]);

  const todaySlotsCount = useMemo(() => {
    return activeSlots.filter((s) => s.date === todayStr).length;
  }, [activeSlots, todayStr]);

  const tomorrowSlotsCount = useMemo(() => {
    return activeSlots.filter((s) => s.date === tomorrowStr).length;
  }, [activeSlots, tomorrowStr]);

  const upcomingSlotsCount = useMemo(() => {
    return activeSlots.filter((s) => s.date > tomorrowStr).length;
  }, [activeSlots, tomorrowStr]);

  // Court Form Handlers (matching /panel design)
  const isDuplicateCourtName = useMemo(() => {
    const clean = courtNameInput.trim().toLowerCase();
    if (!clean) return false;
    return courts.some((c) => {
      if (editingCourt && c.id === editingCourt.id) return false;
      return c.name.trim().toLowerCase() === clean;
    });
  }, [courtNameInput, courts, editingCourt]);

  const handleOpenAddCourt = () => {
    setEditingCourt(null);
    setCourtNameInput(`Cancha ${courts.length + 1}`);
    setCourtSportInput('Pádel');
    setCourtSurfaceInput('Vidrio Panorámico 12mm · Césped Texturado');
    setCourtIndoorInput(true);
    setCourtLightingInput(true);
    setCourtCamerasInput(true);
    setCourtHeatingInput(false);
    setIsCourtModalOpen(true);
  };

  const handleOpenEditCourt = (court: CourtItem) => {
    setEditingCourt(court);
    setCourtNameInput(court.name || '');
    let sportLabel = 'Pádel';
    if (court.sportType === 'FUTBOL_5') sportLabel = 'Fútbol 5';
    else if (court.sportType === 'FUTBOL_7') sportLabel = 'Fútbol 7';
    else if (court.sportType === 'FUTBOL_11') sportLabel = 'Fútbol 11';
    else if (court.sportType === 'TENIS') sportLabel = 'Tenis';
    else if (court.sportType === 'BASQUET') sportLabel = 'Básquet';
    else if (court.sportType === 'PADEL') sportLabel = 'Pádel';
    else if (court.sportType) sportLabel = court.sportType;

    setCourtSportInput(sportLabel);
    setCourtSurfaceInput(court.surface || '');
    setCourtIndoorInput(court.isCovered ?? true);
    setCourtLightingInput(court.hasLighting ?? true);
    setCourtCamerasInput(court.hasCameras ?? true);
    setCourtHeatingInput(court.hasHeating ?? false);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourtConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClub?.id) return;
    if (!courtNameInput.trim() || isDuplicateCourtName) return;

    setIsCourtSaving(true);
    try {
      const courtId = editingCourt?.id || `court_${activeClub.id}_${Date.now()}`;

      let sportType = 'PADEL';
      if (courtSportInput === 'Fútbol 5') sportType = 'FUTBOL_5';
      else if (courtSportInput === 'Fútbol 7') sportType = 'FUTBOL_7';
      else if (courtSportInput === 'Fútbol 11') sportType = 'FUTBOL_11';
      else if (courtSportInput === 'Tenis') sportType = 'TENIS';
      else if (courtSportInput === 'Básquet') sportType = 'BASQUET';
      else if (courtSportInput === 'Pádel') sportType = 'PADEL';

      let surface = courtSurfaceInput.trim();
      if (!surface) {
        if (sportType === 'PADEL') {
          surface = courtIndoorInput
            ? 'Vidrio Panorámico 12mm · Césped Texturado Techada'
            : 'Vidrio Templado 10mm · Césped Descubierta';
        } else if (sportType.startsWith('FUTBOL')) {
          surface = 'Césped Sintético Monofilamento 50mm con Caucho';
        } else if (sportType === 'TENIS') {
          surface = 'Polvo de Ladrillo';
        } else {
          surface = 'Superficie Pro';
        }
      }

      const cleanCourt: CourtItem = JSON.parse(
        JSON.stringify({
          id: courtId,
          clubId: activeClub.id,
          name: courtNameInput.trim(),
          sportType,
          surface,
          pricePerHour: editingCourt?.pricePerHour || 24000,
          durationMinutes: editingCourt?.durationMinutes || 90,
          isCovered: Boolean(courtIndoorInput),
          hasLighting: Boolean(courtLightingInput),
          hasCameras: Boolean(courtCamerasInput),
          hasHeating: Boolean(courtHeatingInput),
          openTime: editingCourt?.openTime || '08:00',
          closeTime: editingCourt?.closeTime || '23:30',
          active: editingCourt ? editingCourt.active : true,
        })
      );

      const allCourts = (await getCourtsFirestore()) || [];
      const exists = allCourts.some((c: any) => c.id === courtId);
      let updatedList: CourtItem[];
      if (exists) {
        updatedList = allCourts.map((c: any) => (c.id === courtId ? cleanCourt : c));
      } else {
        updatedList = [...allCourts, cleanCourt];
      }

      await saveCourtsFirestore(updatedList);
      await loadClubCourts();
      setIsCourtModalOpen(false);
    } catch (err) {
      console.error('Error saving court:', err);
    } finally {
      setIsCourtSaving(false);
    }
  };

  // Actions: Accept / Reject Booking
  const handleAccept = async (bookingId: string) => {
    setIsActionPending(true);
    try {
      await updateBookingStatusFirestore(bookingId, 'CONFIRMED');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : b))
      );
    } catch (err) {
      console.error('Error accepting:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectBooking) return;
    setIsActionPending(true);
    try {
      await updateBookingStatusFirestore(rejectBooking.id, 'REJECTED', rejectReason);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rejectBooking.id
            ? { ...b, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectReason }
            : b
        )
      );
      setRejectBooking(null);
    } catch (err) {
      console.error('Error rejecting:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  // Self-claim handler when user types club slug or ID
  const handleClaimClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim() || !user?.email) return;

    setIsLinkingClaim(true);
    setClaimMessage(null);

    const clean = claimInput.trim().toLowerCase();
    const target = clubsList.find(
      (c) => c.id.toLowerCase() === clean || (c.slug && c.slug.toLowerCase() === clean) || c.name.toLowerCase() === clean
    );

    if (!target) {
      setClaimMessage({
        text: `No encontramos ningún club con el código o nombre "${claimInput}". Verificalo o pedíselo al soporte de Hay Equipo.`,
        type: 'error',
      });
      setIsLinkingClaim(false);
      return;
    }

    const success = await linkClubAdminEmailFirestore(target.id, user.email, user.uid);
    if (success) {
      setClaimMessage({
        text: `¡Vinculación exitosa con ${target.name}! Ingresando al panel...`,
        type: 'success',
      });
      await loadClubsAndMatch();
    } else {
      setClaimMessage({
        text: 'Hubo un inconveniente al guardar la vinculación. Reintentá en unos segundos.',
        type: 'error',
      });
    }
    setIsLinkingClaim(false);
  };

  // Add staff email to active club
  const handleAddStaffEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !activeClub?.id) return;
    const success = await linkClubAdminEmailFirestore(activeClub.id, newStaffEmail.trim());
    if (success) {
      setStaffModalSuccess(true);
      setTimeout(() => {
        setStaffModalSuccess(false);
        setIsAddStaffModalOpen(false);
        setNewStaffEmail('');
      }, 2000);
      await loadClubsAndMatch();
    }
  };

  // Login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Ingresá tu correo y contraseña.');
      return;
    }
    setIsLoggingIn(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filtered requests list
  const visibleBookings = useMemo(() => {
    if (requestFilter === 'PENDING') return bookings.filter((b) => b.status === 'PENDING');
    if (requestFilter === 'CONFIRMED') return bookings.filter((b) => b.status === 'CONFIRMED');
    if (requestFilter === 'REJECTED') return bookings.filter((b) => b.status === 'REJECTED');
    return bookings;
  }, [bookings, requestFilter]);

  const confirmedRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((acc, b) => acc + (Number(b.totalPrice) || 0), 0);
  }, [bookings]);

  /* ────────────────────────────────────────────────────────────
     VIEW 1: NO USER LOGGED IN -> Clean Google & Email Login
     ──────────────────────────────────────────────────────────── */
  if (!authLoading && !user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
        <Head>
          <title>Acceso Clubes — Hay Equipo?</title>
        </Head>

        {/* Minimal High-End Header */}
        <header
          style={{
            height: 72,
            padding: '0 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
              HAY EQUIPO?
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-ash)', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              / Terminal Exclusiva Clubes
            </span>
          </div>

          <Link
            href="/"
            style={{
              color: 'var(--color-ash)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-graphite)',
            }}
          >
            ← Volver al Inicio
          </Link>
        </header>

        {/* Login Box */}
        <div style={{ maxWidth: 460, margin: '80px auto', padding: '0 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '40px 32px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-crimson-signal)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                TERMINAL DE DESPACHO
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 6px', color: 'var(--color-frost)' }}>
                Ingresá con tu Cuenta
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                Entrá con tu cuenta de Google para acceder a las solicitudes y turnos de tu club.
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  backgroundColor: 'rgba(252, 28, 70, 0.12)',
                  border: '1px solid var(--color-crimson-signal)',
                  color: 'var(--color-crimson-signal)',
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: '0px',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                {loginError}
              </div>
            )}

            {/* Google 1-Click Login (Primary Action) */}
            <button
              type="button"
              onClick={async () => {
                setLoginError('');
                try {
                  await loginWithGoogle();
                } catch (err: any) {
                  setLoginError(err?.message || 'Error al conectar con Google.');
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                backgroundColor: 'var(--color-surface-elevate)',
                color: 'var(--color-frost)',
                border: '1px solid var(--color-graphite)',
                borderRadius: 'var(--radius-full)',
                padding: '14px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: 20,
                transition: 'all 0.2s ease',
              }}
            >
              <Icons.Google size={18} />
              <span>Continuar con Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase' }}>o con email</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CORREO ELECTRÓNICO DEL CLUB
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@tuclub.com"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  marginTop: 8,
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {isLoggingIn ? 'Ingresando...' : 'INGRESAR A MI CLUB →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--color-ash)' }}>
              ¿Sos un complejo nuevo?{' '}
              <Link href="/registro-club" style={{ color: 'var(--color-frost)', fontWeight: 700, textDecoration: 'underline' }}>
                Registrá tu club acá
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     VIEW 2: LOGGED IN WITH GOOGLE BUT NO CLUB LINKED YET
     ──────────────────────────────────────────────────────────── */
  if (user && !isLoadingClubs && !activeClub) {
    const waHelpUrl = `https://wa.me/5492235948332?text=Hola!%20Inicié%20sesión%20con%20Google%20en%20Hay%20Equipo%20(${encodeURIComponent(user.email || '')})%20y%20quiero%20vincular%20mi%20club.`;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
        <Head>
          <title>Cuenta sin Club — Hay Equipo?</title>
        </Head>

        <header
          style={{
            height: 72,
            padding: '0 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(76, 76, 76, 0.4)',
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-frost)', letterSpacing: '-0.9px' }}>
              HAY EQUIPO?
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-ash)', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              / Terminal de Clubes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--color-frost)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              title={`Sesión iniciada: ${user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
                  style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {(userProfile?.name || user.displayName || user.email || 'U').substring(0, 1).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {(userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Usuario').split(' ')[0]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--color-ash)',
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: '1px solid var(--color-graphite)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              <Icons.LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '40px 32px',
            }}
          >
            {/* User identification badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '10px 14px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: '0px', border: '1px solid var(--color-graphite)' }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-crimson-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-frost)' }}>{user.displayName || 'Usuario de Google'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ash)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
              </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-frost)' }}>
              Esta cuenta aún no tiene un club asignado
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Para que tu club aparezca acá automáticamente cada vez que entres con Google, pedile al administrador de Hay Equipo que agregue tu correo <strong>({user.email})</strong> a la ficha de tu club.
            </p>

            {/* Direct WhatsApp request button */}
            <a
              href={waHelpUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#25D366',
                color: '#000000',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                marginBottom: 24,
              }}
            >
              <Icons.WhatsApp size={16} color="#000000" />
              <span>Solicitar Asignación por WhatsApp</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase' }}>o vinculá con tu código</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-graphite)' }} />
            </div>

            {/* Quick claim form */}
            <form onSubmit={handleClaimClub} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ash)', marginBottom: 6, fontWeight: 600 }}>
                  CÓDIGO O SLUG DE TU CLUB (EJ: club-laverde-jara)
                </label>
                <input
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="club-..."
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {claimMessage && (
                <div
                  style={{
                    fontSize: 12,
                    color: claimMessage.type === 'error' ? '#ef4444' : 'var(--color-emerald)',
                    fontWeight: 600,
                  }}
                >
                  {claimMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLinkingClaim}
                style={{
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isLinkingClaim ? 'not-allowed' : 'pointer',
                }}
              >
                {isLinkingClaim ? 'Verificando...' : 'VINCULAR MI CUENTA A ESTE CLUB'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     VIEW 3: MAIN CLUB OPERATIONS TERMINAL (AUTHENTICATED & LINKED)
     ──────────────────────────────────────────────────────────── */

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-void)', color: 'var(--color-frost)', fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
      <Head>
        <title>{pendingCount > 0 ? `(${pendingCount}) ¡SOLICITUD! — Hay Equipo Club` : `${activeClub?.name || 'Club'} — Terminal Club`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* ═══════════════════════════════════════════════════════
          HEADER — Exact Match with Landing Page Aesthetics
          ═══════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════
          HEADER — Exact Match with Reference Screenshot
          ═══════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 68,
          padding: '0 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.6px', fontFamily: "'Space Grotesk', sans-serif" }}>
            HAY EQUIPO?
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.8 }}>
            / Terminal de Clubes
          </span>
        </div>

        {/* Right: Club Identity & Real-time Reception Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Active Club Name Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 9999,
              fontSize: 12,
              color: '#ffffff',
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Club:</span>
            <span style={{ fontWeight: 700 }}>{activeClub?.name || 'Mi Club'}</span>
            <Icons.ChevronRight size={12} color="#94a3b8" style={{ transform: 'rotate(90deg)' }} />
          </div>

          {/* Google User Profile Pill */}
          {user && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 9999,
                padding: '4px 12px 4px 5px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              title={`Sesión iniciada: ${user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google'}
                  referrerPolicy="no-referrer"
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#fc1c46',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {(userProfile?.name || user.displayName || user.email || 'A').substring(0, 1).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {(userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Admin').split(' ')[0]}
              </span>
            </div>
          )}

          {/* Add Staff / Recepcionista Gmail Button */}
          <button
            type="button"
            onClick={() => setIsAddStaffModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 9999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Agregar otro Gmail autorizado para este club (ej: recepcionista o canchero)"
          >
            <Icons.UserCheck size={14} color="#94a3b8" />
            <span>+ Encargado</span>
          </button>

          {/* Sound Alert Toggle Switch */}
          <div
            onClick={() => {
              const next = !isSoundOn;
              setIsSoundOn(next);
              if (next) playRequestAlertChime();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 6px',
            }}
            title={isSoundOn ? 'Alerta sonora activada' : 'Alerta sonora silenciada'}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.6px' }}>AUDIO</span>
            <div
              style={{
                width: 36,
                height: 20,
                borderRadius: 9999,
                backgroundColor: isSoundOn ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                position: 'relative',
                transition: 'background-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: 2,
                  left: isSoundOn ? 18 : 2,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>

          {/* Reception Status Indicator */}
          <button
            type="button"
            onClick={() => setIsReceptionOpen(!isReceptionOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: isReceptionOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isReceptionOpen ? '#10b981' : '#ef4444',
              border: isReceptionOpen ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 9999,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isReceptionOpen ? 'Recepción activa para recibir solicitudes' : 'Recepción en pausa'}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isReceptionOpen ? '#10b981' : '#ef4444',
                boxShadow: isReceptionOpen ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span>{isReceptionOpen ? 'ONLINE' : 'PAUSADO'}</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={async () => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('hayequipo_club_session');
                localStorage.removeItem('hayequipo_club_id');
              }
              await logout();
              router.push('/club');
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Cerrar sesión"
          >
            <Icons.LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          2-COLUMN LAYOUT: SIDEBAR (LEFT) + CONTENT (RIGHT)
          ═══════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)', backgroundColor: '#070707' }}>
        {/* SIDEBAR NAVIGATION (LEFT) */}
        <aside
          style={{
            width: 220,
            minWidth: 220,
            backgroundColor: '#0a0a0a',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('DASHBOARD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: activeTab === 'DASHBOARD' ? '#fc1c46' : 'transparent',
                color: activeTab === 'DASHBOARD' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'DASHBOARD' ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: activeTab === 'DASHBOARD' ? '0 4px 20px rgba(252, 28, 70, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icons.Dashboard size={16} color={activeTab === 'DASHBOARD' ? '#ffffff' : '#94a3b8'} />
              <span>Dashboard</span>
            </button>

            {/* 2. Solicitudes */}
            <button
              type="button"
              onClick={() => setActiveTab('REQUESTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: activeTab === 'REQUESTS' ? '#fc1c46' : 'transparent',
                color: activeTab === 'REQUESTS' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'REQUESTS' ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: activeTab === 'REQUESTS' ? '0 4px 20px rgba(252, 28, 70, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icons.Bell size={16} color={activeTab === 'REQUESTS' ? '#ffffff' : '#94a3b8'} />
                <span>Solicitudes</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: activeTab === 'REQUESTS' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: activeTab === 'REQUESTS' ? '#ffffff' : '#94a3b8',
                }}
              >
                ({pendingCount})
              </span>
            </button>

            {/* 3. Publicar Turnos */}
            <button
              type="button"
              onClick={() => setActiveTab('PUBLISH_SLOTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: activeTab === 'PUBLISH_SLOTS' ? '#fc1c46' : 'transparent',
                color: activeTab === 'PUBLISH_SLOTS' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'PUBLISH_SLOTS' ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: activeTab === 'PUBLISH_SLOTS' ? '0 4px 20px rgba(252, 28, 70, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icons.Calendar size={16} color={activeTab === 'PUBLISH_SLOTS' ? '#ffffff' : '#94a3b8'} />
              <span>Publicar Turnos</span>
            </button>

            {/* 4. Mis Canchas */}
            <button
              type="button"
              onClick={() => setActiveTab('COURTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: activeTab === 'COURTS' ? '#fc1c46' : 'transparent',
                color: activeTab === 'COURTS' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'COURTS' ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: activeTab === 'COURTS' ? '0 4px 20px rgba(252, 28, 70, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icons.Pitch size={16} color={activeTab === 'COURTS' ? '#ffffff' : '#94a3b8'} />
                <span>Mis Canchas</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: activeTab === 'COURTS' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: activeTab === 'COURTS' ? '#ffffff' : '#94a3b8',
                }}
              >
                ({courts.length})
              </span>
            </button>

            {/* 5. Liquidaciones */}
            <button
              type="button"
              onClick={() => setActiveTab('PAYOUTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderRadius: 9999,
                border: 'none',
                backgroundColor: activeTab === 'PAYOUTS' ? '#fc1c46' : 'transparent',
                color: activeTab === 'PAYOUTS' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'PAYOUTS' ? 800 : 600,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: activeTab === 'PAYOUTS' ? '0 4px 20px rgba(252, 28, 70, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icons.DollarSign size={16} color={activeTab === 'PAYOUTS' ? '#ffffff' : '#94a3b8'} />
              <span>Liquidaciones</span>
            </button>
          </div>

          {/* Footer Badge */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 0,
              fontSize: 11,
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffffff', fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fc1c46' }} />
              <span>Terminal Activa</span>
            </div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>v2.4 · 100% Firebase</div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (RIGHT) */}
        <main style={{ flex: 1, padding: '32px 40px 80px', overflowY: 'auto', minWidth: 0 }}>
          {/* ─── TAB 0: DASHBOARD ─── */}
          {activeTab === 'DASHBOARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px', color: '#ffffff', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  DASHBOARD
                </h2>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  Resumen operativo en tiempo real de {activeClub?.name || 'tu club'}.
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div
                  onClick={() => setActiveTab('REQUESTS')}
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: pendingCount > 0 ? '1px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 0,
                    padding: '22px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Solicitudes Pendientes
                    </span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: pendingCount > 0 ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pendingCount > 0 ? '#fc1c46' : '#94a3b8' }}>
                      <Icons.Bell size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: pendingCount > 0 ? '#fc1c46' : '#ffffff' }}>
                    {pendingCount}
                  </div>
                  <span style={{ fontSize: 12, color: pendingCount > 0 ? '#fc1c46' : '#94a3b8', marginTop: 4, display: 'block' }}>
                    {pendingCount > 0 ? 'Esperando tu confirmación' : 'Al día, sin pendientes'}
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('PUBLISH_SLOTS')}
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 0,
                    padding: '22px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Turnos a la Venta
                    </span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Icons.Calendar size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>
                    {activeSlots.length}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Turnos libres publicados
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('COURTS')}
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 0,
                    padding: '22px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Canchas Habilitadas
                    </span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Icons.Pitch size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>
                    {courts.length}
                  </div>
                  <span style={{ fontSize: 12, color: '#10b981', marginTop: 4, display: 'block' }}>
                    {courts.filter(c => c.active).length} activas en Firebase
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('PAYOUTS')}
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 0,
                    padding: '22px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Recaudación Total
                    </span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Icons.DollarSign size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
                    {formatCurrency(confirmedRevenue)}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    {bookings.filter((b) => b.status === 'CONFIRMED').length} reservas completadas
                  </span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (courts.length > 0) {
                      const defaultCourt = courts[0];
                      setPublishCourtId(defaultCourt.id);
                      setPublishPrice(defaultCourt.pricePerHour || 24000);
                      setPublishIsCovered(defaultCourt.isCovered ?? true);
                      setPublishHasLighting(defaultCourt.hasLighting ?? true);
                    }
                    setPublishDate(getTodayString());
                    setPublishStartTime('19:00');
                    setPublishDuration(90);
                    setPublishIsFixedSlot(false);
                    setPublishError('');
                    setCalendarMonth(new Date());
                    setIsPublishModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#fc1c46',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '12px 24px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(252, 28, 70, 0.35)',
                  }}
                >
                  <Icons.Plus size={15} />
                  <span>Publicar Turno Nuevo</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddCourt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#141414',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 9999,
                    padding: '12px 22px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Plus size={15} />
                  <span>Agregar Cancha</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('REQUESTS')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 9999,
                    padding: '12px 22px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Bell size={14} />
                  <span>Ver Solicitudes ({pendingCount})</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 1: SOLICITUDES EN VIVO ─── */}
          {activeTab === 'REQUESTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title & Filter pills */}
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px', color: '#ffffff', margin: '0 0 16px', textTransform: 'uppercase' }}>
                  SOLICITUDES
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {(['PENDING', 'ALL', 'CONFIRMED', 'REJECTED'] as const).map((key) => {
                    const countMap = {
                      PENDING: pendingCount,
                      ALL: bookings.length,
                      CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
                      REJECTED: bookings.filter((b) => b.status === 'REJECTED').length,
                    };
                    const labelMap = {
                      PENDING: 'PENDIENTES',
                      ALL: 'TODAS',
                      CONFIRMED: 'CONFIRMADAS',
                      REJECTED: 'RECHAZADAS',
                    };
                    const active = requestFilter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRequestFilter(key)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: active ? 800 : 700,
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          backgroundColor: active ? 'rgba(252, 28, 70, 0.12)' : '#111111',
                          color: active ? '#ffffff' : '#94a3b8',
                          border: active ? '1px solid #fc1c46' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {labelMap[key]} ({countMap[key]})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Requests list or Empty State Card */}
              {visibleBookings.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#0f1115',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '72px 32px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TacticalPitchWatermark />

                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(252, 28, 70, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        boxShadow: '0 0 24px rgba(252, 28, 70, 0.3)',
                      }}
                    >
                      <Icons.Bell size={24} color="#fc1c46" />
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {requestFilter === 'PENDING' ? 'No tenés solicitudes pendientes ahora mismo' : 'No hay reservas registradas en este estado'}
                    </h3>

                    <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
                      Cuando un jugador elija una cancha libre desde la web o app de Hay Equipo, su solicitud aparecerá acá con alerta sonora para aceptar o rechazar en 1 click.
                    </p>
                  </div>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {visibleBookings.map((b) => {
                  const isPending = b.status === 'PENDING';
                  const isConfirmed = b.status === 'CONFIRMED';
                  const cleanPhone = (b.buyer?.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(b.buyer?.name || '')},%20te%20escribimos%20desde%20${encodeURIComponent(activeClub?.name || 'el club')}%20sobre%20tu%20reserva%20en%20Hay%20Equipo.`;

                  return (
                    <div
                      key={b.id}
                      style={{
                        backgroundColor: 'var(--color-obsidian)',
                        border: isPending ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                        borderLeft: isPending ? '4px solid var(--color-crimson-signal)' : isConfirmed ? '4px solid var(--color-emerald)' : '4px solid #64748b',
                        borderRadius: '0px',
                        padding: '20px 24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: '1 1 340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: isPending ? 'rgba(252, 28, 70, 0.2)' : isConfirmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                color: isPending ? 'var(--color-crimson-signal)' : isConfirmed ? 'var(--color-emerald)' : 'var(--color-ash)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {isPending ? 'SOLICITUD ENTRANTE' : isConfirmed ? 'TURNO CONFIRMADO' : 'RECHAZADO'}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 600 }}>#{b.id}</span>
                            <SportBadge sports={[b.sport]} size="sm" />
                          </div>

                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-frost)', marginBottom: 6 }}>
                            {b.courtName}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--color-ash)', marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-frost)', fontWeight: 600 }}>
                              <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                              {b.date}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-frost)', fontWeight: 700 }}>
                              <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                              {b.startTime} hs {b.endTime ? `a ${b.endTime} hs` : ''}
                            </span>
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                              {formatCurrency(b.totalPrice)} {b.paymentType === 'SPLIT' ? '· SPLIT' : '· TOTAL'}
                            </span>
                          </div>

                          {/* Player Identity */}
                          <div
                            style={{
                              padding: '10px 14px',
                              backgroundColor: 'var(--color-surface-elevate)',
                              borderRadius: '0px',
                              border: '1px solid var(--color-graphite)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 12,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-frost)' }}>
                                {b.buyer?.name || 'Jugador'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-ash)' }}>
                                {b.buyer?.phone || 'Sin teléfono'}
                              </div>
                            </div>

                            {cleanPhone && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  backgroundColor: '#25D366',
                                  color: '#000000',
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                }}
                              >
                                <Icons.WhatsApp size={13} color="#000000" />
                                <span>Abrir WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isActionPending}
                                onClick={() => handleAccept(b.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  backgroundColor: 'var(--color-emerald)',
                                  color: '#000000',
                                  border: 'none',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '12px 20px',
                                  fontSize: 14,
                                  fontWeight: 800,
                                  cursor: isActionPending ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Icons.Check size={16} color="#000000" />
                                <span>ACEPTAR TURNO</span>
                              </button>

                              <button
                                type="button"
                                disabled={isActionPending}
                                onClick={() => setRejectBooking(b)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-ash)',
                                  border: '1px solid var(--color-graphite)',
                                  borderRadius: 'var(--radius-full)',
                                  padding: '10px 20px',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: isActionPending ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Icons.Close size={14} />
                                <span>RECHAZAR</span>
                              </button>
                            </>
                          ) : isConfirmed ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--color-emerald)',
                                border: '1px solid var(--color-emerald)',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              <Icons.Check size={14} />
                              <span>CONFIRMADO</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--color-ash)',
                                border: '1px solid var(--color-graphite)',
                                fontSize: 12,
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ color: '#ef4444', fontWeight: 700 }}>RECHAZADO</div>
                              <div style={{ fontSize: 11, opacity: 0.8 }}>{b.rejectReason || 'Cancelado'}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: GESTIÓN Y PUBLICACIÓN DE TURNOS LIBRES ─── */}
        {activeTab === 'PUBLISH_SLOTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Header & CTA Banner */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div style={{ maxWidth: 680 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '1.2px',
                    color: 'var(--color-crimson-signal)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  02 / GESTIÓN DE DISPONIBILIDAD
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-frost)', letterSpacing: '-0.5px' }}>
                  PUBLICAR TURNOS LIBRES A LA VENTA
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  Subí únicamente los turnos que tenés libres o que se cancelaron a último momento. Los jugadores de la comunidad podrán encontrarlos y reservarlos directamente desde la web.
                </p>
              </div>

              {/* Prominent CTA: + Publicar turno nuevo */}
              <button
                type="button"
                onClick={() => {
                  if (courts.length > 0) {
                    const defaultCourt = courts[0];
                    setPublishCourtId(defaultCourt.id);
                    setPublishPrice(defaultCourt.pricePerHour || 24000);
                    setPublishIsCovered(defaultCourt.isCovered ?? true);
                    setPublishHasLighting(defaultCourt.hasLighting ?? true);
                  }
                  setPublishDate(getTodayString());
                  setPublishStartTime('19:00');
                  setPublishDuration(90);
                  setPublishIsFixedSlot(false);
                  setPublishError('');
                  setCalendarMonth(new Date());
                  setIsPublishModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '14px 28px',
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(252, 28, 70, 0.4)',
                }}
              >
                <Icons.Plus size={16} />
                <span>Publicar Turno Nuevo</span>
              </button>
            </div>

            {/* Active Published Slots Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--color-frost)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Turnos Publicados y Activos
                  </h4>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: activeSlots.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-elevate)',
                      color: activeSlots.length > 0 ? 'var(--color-emerald)' : 'var(--color-ash)',
                      border: activeSlots.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--color-graphite)',
                    }}
                  >
                    {activeSlots.length} {activeSlots.length === 1 ? 'TURNO DISPONIBLE' : 'TURNOS DISPONIBLES'}
                  </span>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
                  {[
                    { key: 'ALL', label: `Todos (${activeSlots.length})` },
                    { key: 'TODAY', label: `Hoy (${todaySlotsCount})` },
                    { key: 'TOMORROW', label: `Mañana (${tomorrowSlotsCount})` },
                    { key: 'UPCOMING', label: `Próximos Días (${upcomingSlotsCount})` },
                  ].map((filterItem) => {
                    const isSelected = activeSlotsFilter === filterItem.key;
                    return (
                      <button
                        key={filterItem.key}
                        type="button"
                        onClick={() => setActiveSlotsFilter(filterItem.key as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: isSelected ? 'var(--color-frost)' : 'var(--color-surface-elevate)',
                          color: isSelected ? '#000000' : 'var(--color-ash)',
                          border: isSelected ? '1px solid var(--color-frost)' : '1px solid var(--color-graphite)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {filterItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots List / Grid */}
              {isLoadingSlots ? (
                <div
                  style={{
                    backgroundColor: 'var(--color-obsidian)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    color: 'var(--color-ash)',
                    fontSize: 13,
                  }}
                >
                  Cargando turnos activos desde Firebase...
                </div>
              ) : filteredActiveSlots.length === 0 ? (
                <div
                  style={{
                    backgroundColor: 'var(--color-obsidian)',
                    border: '1px dashed var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '56px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-elevate)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'var(--color-ash)',
                    }}
                  >
                    <Icons.Calendar size={24} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--color-frost)' }}>
                    {activeSlotsFilter === 'ALL'
                      ? 'No tenés turnos publicados actualmente'
                      : 'No hay turnos publicados para el filtro seleccionado'}
                  </h4>
                  <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: '0 auto 20px', maxWidth: 460, lineHeight: 1.5 }}>
                    Subí los horarios vacantes de tus canchas con un click. Cuando un jugador reserve, te llegará una solicitud para aceptar o rechazar.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (courts.length > 0) {
                        const defaultCourt = courts[0];
                        setPublishCourtId(defaultCourt.id);
                        setPublishPrice(defaultCourt.pricePerHour || 24000);
                        setPublishIsCovered(defaultCourt.isCovered ?? true);
                        setPublishHasLighting(defaultCourt.hasLighting ?? true);
                      }
                      setPublishDate(getTodayString());
                      setPublishStartTime('19:00');
                      setPublishDuration(90);
                      setPublishIsFixedSlot(false);
                      setPublishError('');
                      setCalendarMonth(new Date());
                      setIsPublishModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'var(--color-surface-elevate)',
                      color: 'var(--color-frost)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: 'var(--radius-full)',
                      padding: '10px 22px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Icons.Plus size={14} />
                    <span>Publicar Turno Nuevo</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                  {filteredActiveSlots.map((slot) => {
                    const badge = formatSlotDateBadge(slot.date);
                    const perPlayer = Math.round(slot.price / (slot.sportType === 'PADEL' ? 4 : 10));

                    return (
                      <div
                        key={slot.id}
                        style={{
                          backgroundColor: 'var(--color-obsidian)',
                          border: '1px solid var(--color-graphite)',
                          borderRadius: '0px',
                          padding: '22px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 16,
                          position: 'relative',
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        {/* ── 1. Top Header: Fecha (Izq) y Estado Único (Der) ── */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Icons.Calendar size={13} color="var(--color-ash)" />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                color: badge.isToday ? 'var(--color-frost)' : 'var(--color-ash)',
                              }}
                            >
                              {badge.main}
                            </span>
                          </div>

                          {slot.isFixedSlot ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                backgroundColor: 'rgba(252, 28, 70, 0.12)',
                                color: 'var(--color-crimson-signal)',
                                border: '1px solid rgba(252, 28, 70, 0.3)',
                                borderRadius: 'var(--radius-full)',
                                padding: '3px 10px',
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              <Icons.Repeat size={10} color="var(--color-crimson-signal)" />
                              <span>Turno Fijo</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                color: 'var(--color-emerald)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: 'var(--radius-full)',
                                padding: '3px 9px',
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-emerald)' }} />
                              <span>Disponible</span>
                            </div>
                          )}
                        </div>

                        {/* ── 2. Horario Principal (Hero) & Cancha ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 26,
                                fontWeight: 800,
                                color: 'var(--color-frost)',
                                letterSpacing: '-0.5px',
                                lineHeight: 1.1,
                              }}
                            >
                              {slot.startTime} — {slot.endTime}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ash)' }}>
                              ({slot.durationMinutes} min)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-frost)' }}>
                              {slot.courtName}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: 'var(--color-ash)',
                                backgroundColor: 'var(--color-surface-elevate)',
                                border: '1px solid var(--color-graphite)',
                                borderRadius: 'var(--radius-full)',
                                padding: '2px 8px',
                              }}
                            >
                              {getSportLabel(slot.sportType)}
                            </span>
                          </div>
                        </div>

                        {/* ── 3. Footer: Tarifa y Botón de Eliminar Sobrio ── */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 14,
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-frost)', letterSpacing: '-0.3px', lineHeight: 1 }}>
                              {formatCurrency(slot.price)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-ash)', marginTop: 4 }}>
                              {formatCurrency(perPlayer)} por jugador
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSlotToDelete(slot)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: 'transparent',
                              color: 'var(--color-ash)',
                              border: '1px solid var(--color-graphite)',
                              borderRadius: 'var(--radius-full)',
                              padding: '7px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = 'var(--color-graphite)';
                              e.currentTarget.style.color = 'var(--color-ash)';
                            }}
                            title="Eliminar turno si ya se reservó por teléfono o mostrador"
                          >
                            <Icons.Trash size={12} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: MIS CANCHAS ─── */}
        {activeTab === 'COURTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
                  CANCHAS REGISTRADAS
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                  Datos reales guardados en Firebase para {activeClub?.name || 'tu club'}.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCourt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--color-crimson-signal)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={15} />
                <span>+ AGREGAR CANCHA</span>
              </button>
            </div>

            {courts.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '56px 24px',
                  textAlign: 'center',
                }}
              >
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
                  No tenés canchas registradas en Firebase para este club
                </h4>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, maxWidth: 440, margin: '0 auto 20px' }}>
                  Hacé click en "+ AGREGAR CANCHA" para dar de alta tu primera cancha y asignarle su deporte y precio.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {courts.map((court) => (
                  <div
                    key={court.id}
                    style={{
                      backgroundColor: 'var(--color-obsidian)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <SportBadge sports={[court.sportType]} size="sm" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: court.active ? 'var(--color-emerald)' : '#ef4444' }}>
                          {court.active ? 'ACTIVA' : 'PAUSADA'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>{court.name}</h4>
                      {court.surface && (
                        <p style={{ fontSize: 12, color: 'var(--color-ash)', margin: '0 0 12px' }}>{court.surface}</p>
                      )}

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)', border: '1px solid var(--color-graphite)' }}>
                          {court.isCovered ? 'Techada' : 'Descubierta'}
                        </span>
                        <span style={{ fontSize: 11, padding: '3px 9px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)', border: '1px solid var(--color-graphite)' }}>
                          {court.hasLighting ? 'Con Iluminación' : 'Sin Iluminación'}
                        </span>
                        {court.hasCameras && (
                          <span style={{ fontSize: 11, padding: '3px 9px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)', border: '1px solid var(--color-graphite)' }}>
                            Con Cámaras
                          </span>
                        )}
                        {court.hasHeating && (
                          <span style={{ fontSize: 11, padding: '3px 9px', backgroundColor: 'var(--color-surface-elevate)', borderRadius: 'var(--radius-full)', color: 'var(--color-ash)', border: '1px solid var(--color-graphite)' }}>
                            Climatizada
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-graphite)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-ash)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Tarifa definida al publicar cada turno
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCourt(court)}
                        style={{
                          backgroundColor: 'var(--color-surface-elevate)',
                          color: 'var(--color-frost)',
                          border: '1px solid var(--color-graphite)',
                          borderRadius: 'var(--radius-full)',
                          padding: '7px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Editar Cancha
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: LIQUIDACIONES & BILLETERA ─── */}
        {activeTab === 'PAYOUTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Cobrado en Hay Equipo
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-frost)', marginTop: 4 }}>
                  {formatCurrency(confirmedRevenue)}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-emerald)', marginTop: 4, display: 'block' }}>
                  Fondos confirmados
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--color-obsidian)', border: '1px solid var(--color-graphite)', borderRadius: '0px', padding: '20px 24px' }}>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Turnos Concretados
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-frost)', marginTop: 4 }}>
                  {bookings.filter((b) => b.status === 'CONFIRMED').length}
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-ash)', marginTop: 4, display: 'block' }}>
                  Reservas aceptadas
                </span>
              </div>
            </div>

            {/* Bank info form */}
            <div
              style={{
                backgroundColor: 'var(--color-obsidian)',
                border: '1px solid var(--color-graphite)',
                borderRadius: '0px',
                padding: 24,
                maxWidth: 600,
              }}
            >
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                DATOS DE TRANSFERENCIA
              </h4>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: '0 0 16px' }}>
                Ingresá el CBU o Alias donde recibirás las liquidaciones de reservas de {activeClub?.name || 'tu club'}.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="text"
                  value={cbuAlias}
                  placeholder="ALIAS.MP o CBU"
                  onChange={(e) => setCbuAlias(e.target.value.toUpperCase())}
                  style={{
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAliasSaved(true);
                      setTimeout(() => setAliasSaved(false), 3000);
                    }}
                    style={{
                      backgroundColor: 'var(--color-frost)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '9px 20px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    GUARDAR DATOS
                  </button>

                  {aliasSaved && (
                    <span style={{ fontSize: 13, color: 'var(--color-emerald)', fontWeight: 600 }}>
                      Guardado con éxito
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* ─── MODAL: AGREGAR GMAIL DE ENCARGADO / RECEPCIONISTA ─── */}
      {isAddStaffModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: 28,
              maxWidth: 440,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--color-frost)' }}>
                Agregar Encargado o Recepcionista
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                Ingresá el Gmail de la persona que atiende en el club para que también pueda entrar a este panel tocando &quot;Continuar con Google&quot;.
              </p>
            </div>

            <form onSubmit={handleAddStaffEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="email"
                required
                placeholder="recepcion.tuclub@gmail.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-surface-elevate)',
                  color: 'var(--color-frost)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: '0px',
                  padding: '10px 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />

              {staffModalSuccess && (
                <div style={{ color: 'var(--color-emerald)', fontSize: 12, fontWeight: 600 }}>
                  ¡Encargado vinculado correctamente!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-ash)',
                    border: '1px solid var(--color-graphite)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Guardar Encargado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECHAZAR SOLICITUD ─── */}
      {rejectBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: 28,
              maxWidth: 440,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Rechazar Solicitud</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ash)', margin: 0 }}>
                El dinero se le liberará al jugador inmediatamente sin costo. Seleccioná el motivo:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Cancha ocupada presencialmente en el club',
                'Horario no disponible / Cambio de turno',
                'Condiciones climáticas / Lluvia',
                'Mantenimiento en cancha',
              ].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRejectReason(m)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: rejectReason === m ? 'rgba(252, 28, 70, 0.15)' : 'var(--color-surface-elevate)',
                    color: rejectReason === m ? 'var(--color-crimson-signal)' : 'var(--color-frost)',
                    border: rejectReason === m ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setRejectBooking(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Volver
              </button>
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmReject}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isActionPending ? 'not-allowed' : 'pointer',
                }}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CONFIGURAR / EDITAR CANCHA (Diseño de /panel)
          ═══════════════════════════════════════════════════════ */}
      {isCourtModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 0,
              padding: '26px 28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 19, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {editingCourt ? 'Editar Cancha' : 'Configurar Nueva Cancha'}
                </h3>
                <div style={{ fontSize: 11, color: '#fc1c46', marginTop: 2 }}>
                  Establecé el nombre personalizado, deporte y características
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCourtModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <Icons.Close size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveCourtConfig} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Nombre Personalizado */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Nombre Personalizado de la Cancha
                </label>
                <input
                  type="text"
                  value={courtNameInput}
                  onChange={(e) => setCourtNameInput(e.target.value)}
                  placeholder="ej. Cancha 1 — Panorámica WPT"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#141414',
                    border: isDuplicateCourtName ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 0,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {isDuplicateCourtName && (
                  <div style={{ color: '#fc1c46', fontSize: 11.5, marginTop: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icons.Close size={12} color="#fc1c46" />
                    <span>Ya existe una cancha con este nombre. Elegí otro nombre diferente.</span>
                  </div>
                )}
              </div>

              {/* Deporte */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Deporte
                </label>
                <select
                  value={courtSportInput}
                  onChange={(e) => setCourtSportInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 0,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    outline: 'none',
                  }}
                >
                  <option value="Pádel">Pádel</option>
                  <option value="Fútbol 5">Fútbol 5</option>
                  <option value="Fútbol 7">Fútbol 7</option>
                  <option value="Fútbol 11">Fútbol 11</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Básquet">Básquet</option>
                </select>
              </div>

              {/* Características y Servicios de la Cancha */}
              <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fc1c46', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.SettingsSliders /> Características y Servicios de la Cancha
                </div>

                {/* Row 1: Techada vs Descubierta */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCourtIndoorInput(true)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: courtIndoorInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: courtIndoorInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: courtIndoorInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Indoor /> Techada
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourtIndoorInput(false)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: !courtIndoorInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: !courtIndoorInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: !courtIndoorInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Outdoor /> Descubierta
                  </button>
                </div>

                {/* Row 2: Con Iluminación vs Sin Iluminación */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCourtLightingInput(true)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: courtLightingInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: courtLightingInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: courtLightingInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Lighting /> Con Iluminación
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourtLightingInput(false)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: !courtLightingInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: !courtLightingInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: !courtLightingInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.NoLighting /> Sin Iluminación
                  </button>
                </div>

                {/* Row 3: Con Cámaras vs Sin Cámaras */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCourtCamerasInput(true)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: courtCamerasInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: courtCamerasInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: courtCamerasInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Camera /> Con Cámaras
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourtCamerasInput(false)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: !courtCamerasInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: !courtCamerasInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: !courtCamerasInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.CameraOff /> Sin Cámaras
                  </button>
                </div>

                {/* Row 4: Climatizada vs Ventilación Natural */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCourtHeatingInput(true)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: courtHeatingInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: courtHeatingInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: courtHeatingInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Climate /> Climatizada
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourtHeatingInput(false)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9999,
                      border: !courtHeatingInput ? '1px solid #fc1c46' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: !courtHeatingInput ? 'rgba(252,28,70,0.15)' : 'rgba(255,255,255,0.02)',
                      color: !courtHeatingInput ? '#fc1c46' : '#9ca3af',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Icons.Wind /> Ventilación Natural
                  </button>
                </div>
              </div>

              {/* Superficie / Descripción de la Cancha */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                  Superficie o Descripción de la Cancha
                </label>
                <input
                  type="text"
                  value={courtSurfaceInput}
                  onChange={(e) => setCourtSurfaceInput(e.target.value)}
                  placeholder="ej. Césped Sintético Monofilamento / Vidrio Panorámico 12mm"
                  style={{
                    width: '100%',
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 0,
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={isDuplicateCourtName || isCourtSaving}
                style={{
                  marginTop: 6,
                  padding: '13px',
                  backgroundColor: isDuplicateCourtName ? '#141414' : '#fc1c46',
                  color: isDuplicateCourtName ? '#9ca3af' : '#ffffff',
                  border: 'none',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isDuplicateCourtName || isCourtSaving ? 'not-allowed' : 'pointer',
                  opacity: isDuplicateCourtName || isCourtSaving ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isCourtSaving ? 'Guardando Cancha...' : 'Guardar Cancha'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: PUBLICAR TURNO NUEVO (CALENDARIO Y ESPECIFICACIONES)
          ═══════════════════════════════════════════════════════ */}
      {isPublishModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '36px',
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--color-crimson-signal)',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  DISPATCHER / PUBLICACIÓN DIRECTA
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--color-frost)' }}>
                  PUBLICAR TURNO NUEVO
                </h3>
                <p style={{ color: 'var(--color-ash)', fontSize: 13, margin: '4px 0 0' }}>
                  Configurá los datos para habilitar el turno libre a la venta en la plataforma.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-full)',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-ash)',
                  cursor: 'pointer',
                }}
              >
                <Icons.Close size={15} />
              </button>
            </div>

            <form onSubmit={handlePublishNewSlot} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Field 1: Court Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                  1. Cancha
                </label>
                {courts.length === 0 ? (
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--color-surface-elevate)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      fontSize: 13,
                      color: 'var(--color-ash)',
                    }}
                  >
                    No tenés canchas creadas aún.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPublishModalOpen(false);
                        setActiveTab('COURTS');
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--color-crimson-signal)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Ir a Mis Canchas para crear una
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                    {courts.map((court) => {
                      const isSelected = publishCourtId === court.id;
                      return (
                        <button
                          key={court.id}
                          type="button"
                          onClick={() => {
                            setPublishCourtId(court.id);
                            setPublishPrice(court.pricePerHour || 24000);
                            setPublishIsCovered(court.isCovered ?? true);
                            setPublishHasLighting(court.hasLighting ?? true);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.12)' : 'var(--color-surface-elevate)',
                            border: isSelected ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                            color: isSelected ? '#ffffff' : 'var(--color-ash)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{court.name}</span>
                            <SportBadge sports={[court.sportType]} size="sm" />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
                            {formatCurrency(court.pricePerHour)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Field 2: Date Selector with Interactive Calendar */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                  2. Fecha del Turno (Calendario)
                </label>

                {/* Quick Pick Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Hoy', val: getTodayString() },
                    { label: 'Mañana', val: getTomorrowString() },
                    { label: 'Pasado Mañana', val: getAfterTomorrowString() },
                  ].map((quick) => {
                    const isSelected = publishDate === quick.val;
                    return (
                      <button
                        key={quick.val}
                        type="button"
                        onClick={() => setPublishDate(quick.val)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: isSelected ? 'var(--color-frost)' : 'var(--color-surface-elevate)',
                          color: isSelected ? '#000000' : 'var(--color-ash)',
                          border: isSelected ? '1px solid var(--color-frost)' : '1px solid var(--color-graphite)',
                          cursor: 'pointer',
                        }}
                      >
                        {quick.label}
                      </button>
                    );
                  })}
                </div>

                {/* Visual Monthly Calendar Grid */}
                <CalendarWidget
                  selectedDate={publishDate}
                  onSelectDate={(dateStr) => setPublishDate(dateStr)}
                  calendarMonth={calendarMonth}
                  onChangeMonth={(delta) => {
                    const next = new Date(calendarMonth);
                    next.setMonth(next.getMonth() + delta);
                    setCalendarMonth(next);
                  }}
                />

                {/* Selected Date Confirmation Pill */}
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--color-frost)',
                  }}
                >
                  <Icons.Calendar size={14} color="var(--color-crimson-signal)" />
                  <span>
                    Fecha seleccionada: <strong>{formatSlotDateBadge(publishDate).main}</strong> ({publishDate})
                  </span>
                </div>
              </div>

              {/* Field 3: Time & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>
                    3. Hora de Inicio
                  </label>
                  <select
                    value={publishStartTime}
                    onChange={(e) => setPublishStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-surface-elevate)',
                      color: 'var(--color-frost)',
                      border: '1px solid var(--color-graphite)',
                      borderRadius: '0px',
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    {AVAILABLE_START_HOURS.map((hr) => (
                      <option key={hr} value={hr} style={{ backgroundColor: '#141414', color: '#ffffff' }}>
                        {hr} hs
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>
                    Duración
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[60, 90, 120].map((dur) => {
                      const isSelected = publishDuration === dur;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setPublishDuration(dur)}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isSelected ? 'var(--color-crimson-signal)' : 'var(--color-surface-elevate)',
                            color: isSelected ? '#ffffff' : 'var(--color-ash)',
                            border: isSelected ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {dur} min
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Range Calculation Feedback */}
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: 'var(--color-frost)',
                }}
              >
                <Icons.Clock size={14} color="var(--color-crimson-signal)" />
                <span>
                  Horario resultante: <strong>{publishStartTime} a {calculateEndTime(publishStartTime, publishDuration)} hs</strong> ({publishDuration} minutos)
                </span>
              </div>

              {/* Field 4: Price */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>
                  4. Tarifa del Turno ($ ARS)
                </label>
                <input
                  type="number"
                  value={publishPrice}
                  onChange={(e) => setPublishPrice(Math.max(0, Number(e.target.value)))}
                  placeholder="24000"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface-elevate)',
                    color: 'var(--color-frost)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    padding: '10px 14px',
                    fontSize: 15,
                    fontWeight: 800,
                    outline: 'none',
                  }}
                />
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-ash)', marginTop: 4 }}>
                  Precio estimado por jugador: <strong>{formatCurrency(Math.round(publishPrice / (publishCourtId && courts.find(c => c.id === publishCourtId)?.sportType === 'PADEL' ? 4 : 10)))}</strong>
                </span>
              </div>

              {/* Field 5: Disponibilidad como Turno Fijo */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-ash)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
                  5. Modalidad de Reserva
                </label>

                {/* Interactive Checkbox Card */}
                <div
                  onClick={() => setPublishIsFixedSlot(!publishIsFixedSlot)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px 16px',
                    backgroundColor: publishIsFixedSlot ? 'rgba(252, 28, 70, 0.1)' : 'var(--color-surface-elevate)',
                    border: publishIsFixedSlot ? '1px solid var(--color-crimson-signal)' : '1px solid var(--color-graphite)',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '2px',
                      backgroundColor: publishIsFixedSlot ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.05)',
                      border: publishIsFixedSlot ? '2px solid var(--color-crimson-signal)' : '2px solid var(--color-ash)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {publishIsFixedSlot && <Icons.Check size={14} color="#ffffff" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: publishIsFixedSlot ? '#ffffff' : 'var(--color-frost)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Disponible para reservar como Turno Fijo</span>
                      {publishIsFixedSlot && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: 'var(--color-crimson-signal)',
                            backgroundColor: 'rgba(252, 28, 70, 0.18)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid rgba(252, 28, 70, 0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}
                        >
                          Visible en Turnos Fijos Web
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-ash)', lineHeight: 1.4 }}>
                      Al activar este casillero, el turno aparecerá en la sección de <strong>Turnos Fijos</strong> de la web para que los jugadores puedan abonarse semanalmente a este día y horario.
                    </p>
                  </div>
                </div>
              </div>

              {publishError && (
                <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
                  {publishError}
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-ash)',
                    border: '1px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-full)',
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPublishingSlot || courts.length === 0}
                  style={{
                    backgroundColor: 'var(--color-crimson-signal)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '12px 28px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: isPublishingSlot || courts.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: isPublishingSlot || courts.length === 0 ? 0.6 : 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  {isPublishingSlot ? 'Publicando...' : 'PUBLICAR TURNO A LA VENTA →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CONFIRMAR ELIMINACIÓN DE TURNO PUBLICADO
          ═══════════════════════════════════════════════════════ */}
      {slotToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-obsidian)',
              border: '1px solid var(--color-graphite)',
              borderRadius: '0px',
              padding: '32px',
              maxWidth: 480,
              width: '100%',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: 16 }}>
              <Icons.Trash size={20} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--color-frost)' }}>
              ¿Eliminar este turno publicado?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-ash)', lineHeight: 1.6, margin: '0 0 20px' }}>
              El turno de <strong>{slotToDelete.courtName}</strong> para el <strong>{formatSlotDateBadge(slotToDelete.date).main}</strong> ({slotToDelete.startTime} a {slotToDelete.endTime} hs) ya no estará visible ni disponible para reserva en la plataforma.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ash)',
                  border: '1px solid var(--color-graphite)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteSlot}
                disabled={isDeletingSlot}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: isDeletingSlot ? 'not-allowed' : 'pointer',
                  opacity: isDeletingSlot ? 0.7 : 1,
                }}
              >
                {isDeletingSlot ? 'Eliminando...' : 'Sí, Eliminar Turno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
