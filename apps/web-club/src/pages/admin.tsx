import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  getClubsFirestore,
  getCourtsFirestore,
  saveClubsFirestore,
  saveCourtsFirestore,
  uploadImageFirebase,
} from '../services/firebase';
import { MDP_REAL_CLUBS, MDP_REAL_COURTS } from '@hay-equipo/db';
import { SportBadge } from '../components/SportBadge';

/* ────────────────────────────────────────────────────────────
   TypeScript Interfaces
   ──────────────────────────────────────────────────────────── */

export type SportType = 'PADEL' | 'FUTBOL_5' | 'FUTBOL_7' | 'FUTBOL_11';

export interface AdminCourt {
  id: string;
  clubId: string;
  name: string;
  sportType: SportType;
  surface: string;
  pricePerHour: number;
  durationMinutes: number;
  isCovered: boolean;
  hasLighting: boolean;
  priceFixedSlotDiscount?: number;
  capacity: number; // 4 for Padel, 10 for F5, 14 for F7, 22 for F11
  images: string[];
}

export interface AdminClubAmenities {
  parking: boolean;
  buffet: boolean;
  equipmentRental: boolean;
  wifi: boolean;
  showers: boolean;
  lockerRooms: boolean;
  grill: boolean;
  lighting: boolean;
  covered: boolean;
  syntheticWPT?: boolean;
}

export interface AdminClub {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  province?: string;
  phone: string;
  whatsapp: string;
  minPrice: number;
  active: boolean;
  description: string;
  openingTime: string;
  closingTime: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  amenities: AdminClubAmenities;
  images: string[];
  sports?: string[];
  sportCategory?: 'PADEL' | 'FUTBOL' | 'BOTH';
  adminEmail?: string;
  adminEmails?: string[];
  ownerUid?: string;
}

/* ────────────────────────────────────────────────────────────
   Clean SVG Vector Icons (Zero-Emoji Compliance)
   ──────────────────────────────────────────────────────────── */

const Icons = {
  Building: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
      <path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" />
      <path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  ),
  Pitch: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Users: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Plus: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Edit: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Close: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Phone: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  WhatsApp: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  MapPin: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Upload: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Refresh: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  ExternalLink: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Lock: ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Database: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Mail: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="0" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Key: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-1.5 1.5L16 7l-2 2m-2-2 2-2m-4 4 1 1-1.5 1.5-1.5-1.5M7.5 16.5A5 5 0 1 1 14 10l-6.5 6.5H5v2.5H2.5V21h5v-4.5z" />
    </svg>
  ),
  AlertCircle: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Image: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="0" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Star: ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Grid: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="0" />
      <rect x="14" y="3" width="7" height="7" rx="0" />
      <rect x="14" y="14" width="7" height="7" rx="0" />
      <rect x="3" y="14" width="7" height="7" rx="0" />
    </svg>
  ),
  List: ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

const DEFAULT_AMENITIES: AdminClubAmenities = {
  parking: false,
  buffet: false,
  equipmentRental: false,
  wifi: false,
  showers: false,
  lockerRooms: false,
  grill: false,
  lighting: false,
  covered: false,
  syntheticWPT: false,
};

export default function AdminPage() {
  const router = useRouter();

  // Auth gatekeeper state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Main data state
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [courts, setCourts] = useState<AdminCourt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL' | 'BOTH'>('ALL');
  const [adminFilter, setAdminFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Modal state for Club Editing/Creation
  const [isClubModalOpen, setIsClubModalOpen] = useState<boolean>(false);
  const [editingClub, setEditingClub] = useState<AdminClub | null>(null);
  const [isNewClub, setIsNewClub] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [newAdminEmailInput, setNewAdminEmailInput] = useState<string>('');

  // Modal for Court Management
  const [isCourtsModalOpen, setIsCourtsModalOpen] = useState<boolean>(false);
  const [selectedClubForCourts, setSelectedClubForCourts] = useState<AdminClub | null>(null);

  // Upload state
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const courtFileInputRef = useRef<HTMLInputElement | null>(null);

  // New Court Form state
  const [newCourtForm, setNewCourtForm] = useState<{
    name: string;
    sportType: SportType;
    surface: string;
    pricePerHour: number;
    durationMinutes: number;
    capacity: number;
    isCovered: boolean;
    hasLighting: boolean;
    images: string[];
  }>({
    name: '',
    sportType: 'PADEL',
    surface: 'Césped Sintético Texturado Azul WPT',
    pricePerHour: 28000,
    durationMinutes: 90,
    capacity: 4,
    isCovered: true,
    hasLighting: true,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'],
  });

  // Check persisted auth on mount
  useEffect(() => {
    const saved = localStorage.getItem('hay_equipo_admin_authorized');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data from Firestore merged with all MDP clubs catalog
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedClubs, fetchedCourts] = await Promise.all([
        getClubsFirestore(),
        getCourtsFirestore(),
      ]);

      const firestoreClubsList: any[] = Array.isArray(fetchedClubs) ? fetchedClubs : [];
      const firestoreCourtsList: any[] = Array.isArray(fetchedCourts) ? fetchedCourts : [];

      // Merge: Keep Firestore clubs (with user's custom edits & adminEmail),
      // and append any club from MDP_REAL_CLUBS not yet in Firestore.
      const existingClubIds = new Set(firestoreClubsList.map((c: any) => c.id || c.slug));

      const mergedRawClubs: any[] = [
        ...firestoreClubsList,
        ...MDP_REAL_CLUBS.filter((mdpClub: any) => !existingClubIds.has(mdpClub.id) && !existingClubIds.has(mdpClub.slug))
      ];

      const normalizedClubs: AdminClub[] = mergedRawClubs.map((c: any) => {
        const primaryAdminEmail = c.adminEmail || (Array.isArray(c.adminEmails) && c.adminEmails.length > 0 ? c.adminEmails[0] : '');
        const adminEmailsList: string[] = Array.isArray(c.adminEmails)
          ? c.adminEmails.map((e: any) => String(e).trim().toLowerCase()).filter(Boolean)
          : primaryAdminEmail ? [primaryAdminEmail.trim().toLowerCase()] : [];

        if (primaryAdminEmail && !adminEmailsList.includes(primaryAdminEmail.trim().toLowerCase())) {
          adminEmailsList.unshift(primaryAdminEmail.trim().toLowerCase());
        }

        return {
          id: c.id || `club-${Date.now()}`,
          slug: c.slug || c.id || '',
          name: c.name || 'Sin Nombre',
          address: c.address || '',
          city: c.city || 'Mar del Plata',
          province: c.province || 'Buenos Aires',
          phone: c.phone || '',
          whatsapp: c.whatsapp || c.whatsappPhone || '',
          minPrice: c.minPrice || 25000,
          active: c.active ?? true,
          description: c.description || 'Complejo deportivo en Mar del Plata.',
          openingTime: c.openingTime || '08:00',
          closingTime: c.closingTime || '23:30',
          latitude: c.latitude || -37.979858,
          longitude: c.longitude || -57.589794,
          rating: c.rating,
          reviewCount: c.reviewCount,
          amenities: {
            ...DEFAULT_AMENITIES,
            ...(c.amenities || {}),
          },
          images: Array.isArray(c.images) && c.images.length > 0 ? c.images : [
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
          ],
          sports: Array.isArray(c.sports) ? c.sports : undefined,
          sportCategory: c.sportCategory,
          adminEmail: primaryAdminEmail ? primaryAdminEmail.trim().toLowerCase() : '',
          adminEmails: adminEmailsList,
          ownerUid: c.ownerUid || '',
        };
      });

      // Merge courts
      const existingCourtIds = new Set(firestoreCourtsList.map((ct: any) => ct.id));
      const mergedRawCourts: any[] = [
        ...firestoreCourtsList,
        ...MDP_REAL_COURTS.filter((mdpCourt: any) => !existingCourtIds.has(mdpCourt.id))
      ];

      const normalizedCourts: AdminCourt[] = mergedRawCourts.map((c: any) => ({
        id: c.id || `court-${Date.now()}-${Math.random()}`,
        clubId: c.clubId || '',
        name: c.name || 'Cancha',
        sportType: (c.sportType || (c.sport === 'PADEL' ? 'PADEL' : 'FUTBOL_5')) as SportType,
        surface: c.surface || 'Césped Sintético',
        pricePerHour: c.pricePerHour || c.price || 30000,
        durationMinutes: c.durationMinutes || 90,
        isCovered: !!c.isCovered,
        hasLighting: c.hasLighting ?? true,
        priceFixedSlotDiscount: c.priceFixedSlotDiscount || 0.12,
        capacity: c.capacity || (c.sportType === 'PADEL' ? 4 : (c.sportType === 'FUTBOL_7' ? 14 : c.sportType === 'FUTBOL_11' ? 22 : 10)),
        images: Array.isArray(c.images) && c.images.length > 0 ? c.images : [
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
        ],
      }));

      setClubs(normalizedClubs);
      setCourts(normalizedCourts);
    } catch (e) {
      console.error('Error fetching admin data:', e);
      showNotification('error', 'Error al conectar con Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Auth check handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    if (clean === 'hayequipo' || clean === 'admin2026' || clean === 'hayequipo2026' || clean === 'emimoter') {
      setIsAuthenticated(true);
      localStorage.setItem('hay_equipo_admin_authorized', 'true');
      setAuthError('');
    } else {
      setAuthError('Clave de acceso incorrecta.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hay_equipo_admin_authorized');
  };

  // Computed metrics
  const stats = useMemo(() => {
    const totalClubs = clubs.length;
    const totalCourts = courts.length;
    const padelCourts = courts.filter(c => c.sportType === 'PADEL').length;
    const futbol5Courts = courts.filter(c => c.sportType === 'FUTBOL_5').length;
    const futbol7Courts = courts.filter(c => c.sportType === 'FUTBOL_7').length;
    const futbol11Courts = courts.filter(c => c.sportType === 'FUTBOL_11').length;
    const totalFutbolCourts = futbol5Courts + futbol7Courts + futbol11Courts;

    const padelOnlyClubs = clubs.filter(c => {
      const cCourts = courts.filter(ct => ct.clubId === c.id);
      const hasP = cCourts.some(ct => ct.sportType === 'PADEL') || c.sports?.includes('PADEL');
      const hasF = cCourts.some(ct => ct.sportType?.startsWith('FUTBOL')) || c.sports?.includes('FUTBOL');
      return hasP && !hasF;
    }).length;

    const futbolOnlyClubs = clubs.filter(c => {
      const cCourts = courts.filter(ct => ct.clubId === c.id);
      const hasP = cCourts.some(ct => ct.sportType === 'PADEL') || c.sports?.includes('PADEL');
      const hasF = cCourts.some(ct => ct.sportType?.startsWith('FUTBOL')) || c.sports?.includes('FUTBOL');
      return hasF && !hasP;
    }).length;

    const bothClubs = clubs.filter(c => {
      const cCourts = courts.filter(ct => ct.clubId === c.id);
      const hasP = cCourts.some(ct => ct.sportType === 'PADEL') || c.sports?.includes('PADEL');
      const hasF = cCourts.some(ct => ct.sportType?.startsWith('FUTBOL')) || c.sports?.includes('FUTBOL');
      return hasP && hasF;
    }).length;

    const clubsWithAdmin = clubs.filter(c => Boolean(c.adminEmail || (c.adminEmails && c.adminEmails.length > 0))).length;
    const clubsWithoutAdmin = totalClubs - clubsWithAdmin;

    return {
      totalClubs,
      totalCourts,
      padelCourts,
      totalFutbolCourts,
      futbol5Courts,
      futbol7Courts,
      futbol11Courts,
      padelOnlyClubs,
      futbolOnlyClubs,
      bothClubs,
      clubsWithAdmin,
      clubsWithoutAdmin,
    };
  }, [clubs, courts]);

  // Filtered clubs list (Search + Sport + Admin status)
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesQuery =
        !searchQuery ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.phone && club.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (club.whatsapp && club.whatsapp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (club.adminEmail && club.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (club.adminEmails && club.adminEmails.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())));

      const clubCourts = courts.filter(c => c.clubId === club.id);
      const hasPadel = clubCourts.some(c => c.sportType === 'PADEL') || Boolean(club.sports?.includes('PADEL'));
      const hasFutbol = clubCourts.some(c => c.sportType?.startsWith('FUTBOL')) || Boolean(club.sports?.includes('FUTBOL'));

      let matchesSport = true;
      if (sportFilter === 'PADEL') matchesSport = hasPadel;
      if (sportFilter === 'FUTBOL') matchesSport = hasFutbol;
      if (sportFilter === 'BOTH') matchesSport = hasPadel && hasFutbol;

      const hasAdmin = Boolean(club.adminEmail || (club.adminEmails && club.adminEmails.length > 0));
      let matchesAdmin = true;
      if (adminFilter === 'ASSIGNED') matchesAdmin = hasAdmin;
      if (adminFilter === 'UNASSIGNED') matchesAdmin = !hasAdmin;

      return matchesQuery && matchesSport && matchesAdmin;
    });
  }, [clubs, courts, searchQuery, sportFilter, adminFilter]);

  // Save changes to Firestore
  const handleSaveAllToFirestore = async (updatedClubsList = clubs, updatedCourtsList = courts) => {
    setIsSaving(true);
    try {
      const [clubsOk, courtsOk] = await Promise.all([
        saveClubsFirestore(updatedClubsList),
        saveCourtsFirestore(updatedCourtsList),
      ]);

      if (clubsOk && courtsOk) {
        showNotification('success', `${updatedClubsList.length} clubes sincronizados en Firestore con éxito.`);
      } else {
        showNotification('error', 'Ocurrió un inconveniente al guardar en Firestore.');
      }
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error de red al guardar en Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal for a Club
  const handleOpenEditClub = (club: AdminClub) => {
    setEditingClub({
      ...club,
      amenities: { ...club.amenities },
      images: Array.isArray(club.images) ? [...club.images] : [],
      adminEmail: club.adminEmail || (club.adminEmails && club.adminEmails[0]) || '',
      adminEmails: Array.isArray(club.adminEmails) ? [...club.adminEmails] : (club.adminEmail ? [club.adminEmail] : []),
    });
    setImageUrlInput('');
    setNewAdminEmailInput('');
    setIsNewClub(false);
    setIsClubModalOpen(true);
  };

  // Open Create Modal for a New Club
  const handleOpenNewClub = () => {
    const newId = `club-${Date.now()}`;
    const emptyClub: AdminClub = {
      id: newId,
      slug: '',
      name: '',
      address: '',
      city: 'Mar del Plata',
      province: 'Buenos Aires',
      phone: '',
      whatsapp: '',
      minPrice: 28000,
      active: true,
      description: 'Complejo de canchas en Mar del Plata.',
      openingTime: '08:00',
      closingTime: '23:30',
      latitude: -37.979858,
      longitude: -57.589794,
      amenities: { ...DEFAULT_AMENITIES },
      images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'],
      adminEmail: '',
      adminEmails: [],
    };
    setEditingClub(emptyClub);
    setImageUrlInput('');
    setNewAdminEmailInput('');
    setIsNewClub(true);
    setIsClubModalOpen(true);
  };

  // Photo handlers for editingClub
  const handleAddImageUrl = () => {
    if (!editingClub || !imageUrlInput.trim()) return;
    const cleanUrl = imageUrlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('/')) {
      showNotification('error', 'Ingresá una URL válida (ej: https://... o /logos/...)');
      return;
    }
    setEditingClub({
      ...editingClub,
      images: [...editingClub.images, cleanUrl],
    });
    setImageUrlInput('');
    showNotification('success', 'Foto agregada a la lista.');
  };

  const handleMakeCoverImage = (index: number) => {
    if (!editingClub || index === 0) return;
    const target = editingClub.images[index];
    const rest = editingClub.images.filter((_, idx) => idx !== index);
    setEditingClub({
      ...editingClub,
      images: [target, ...rest],
    });
    showNotification('success', 'Foto establecida como portada.');
  };

  const handleRemoveImage = (index: number) => {
    if (!editingClub) return;
    if (editingClub.images.length <= 1) {
      showNotification('error', 'El club debe tener al menos una foto.');
      return;
    }
    const filtered = editingClub.images.filter((_, idx) => idx !== index);
    setEditingClub({
      ...editingClub,
      images: filtered,
    });
  };

  // Staff admin email handlers
  const handleAddSecondaryAdminEmail = () => {
    if (!editingClub || !newAdminEmailInput.trim()) return;
    const email = newAdminEmailInput.trim().toLowerCase();
    if (!email.includes('@') || !email.includes('.')) {
      showNotification('error', 'Ingresá un formato de email válido.');
      return;
    }
    const current = editingClub.adminEmails || [];
    if (current.includes(email)) {
      showNotification('error', 'Este correo ya está agregado.');
      return;
    }
    const nextList = [...current, email];
    setEditingClub({
      ...editingClub,
      adminEmail: editingClub.adminEmail || email,
      adminEmails: nextList,
    });
    setNewAdminEmailInput('');
  };

  const handleRemoveSecondaryAdminEmail = (emailToRemove: string) => {
    if (!editingClub) return;
    const nextList = (editingClub.adminEmails || []).filter(e => e !== emailToRemove);
    const nextPrimary = editingClub.adminEmail === emailToRemove ? (nextList[0] || '') : editingClub.adminEmail;
    setEditingClub({
      ...editingClub,
      adminEmail: nextPrimary,
      adminEmails: nextList,
    });
  };

  // Save Club in state and sync Firestore
  const handleSaveClubModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;

    if (!editingClub.name.trim()) {
      showNotification('error', 'El nombre del club es obligatorio.');
      return;
    }

    const cleanSlug = editingClub.slug.trim() || editingClub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanAdminEmail = editingClub.adminEmail ? editingClub.adminEmail.trim().toLowerCase() : '';
    let updatedAdminEmails = Array.isArray(editingClub.adminEmails)
      ? editingClub.adminEmails.map(m => m.trim().toLowerCase()).filter(Boolean)
      : [];
    if (cleanAdminEmail && !updatedAdminEmails.includes(cleanAdminEmail)) {
      updatedAdminEmails = [cleanAdminEmail, ...updatedAdminEmails];
    }

    const readyClub: AdminClub = {
      ...editingClub,
      slug: cleanSlug,
      name: editingClub.name.trim(),
      address: editingClub.address.trim(),
      phone: editingClub.phone.trim(),
      whatsapp: editingClub.whatsapp.trim(),
      adminEmail: cleanAdminEmail,
      adminEmails: updatedAdminEmails,
      images: editingClub.images.filter(img => Boolean(img && img.trim())),
    };

    let updatedClubs: AdminClub[];
    if (isNewClub) {
      updatedClubs = [readyClub, ...clubs];
    } else {
      updatedClubs = clubs.map(c => c.id === readyClub.id ? readyClub : c);
    }

    setClubs(updatedClubs);
    setIsClubModalOpen(false);
    setEditingClub(null);

    await handleSaveAllToFirestore(updatedClubs, courts);
    showNotification('success', `Club "${readyClub.name}" guardado exitosamente.`);
  };

  // Delete Club
  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el club "${clubName}" y todas sus canchas asociadas?`)) {
      return;
    }
    const updatedClubs = clubs.filter(c => c.id !== clubId);
    const updatedCourts = courts.filter(c => c.clubId !== clubId);

    setClubs(updatedClubs);
    setCourts(updatedCourts);

    await handleSaveAllToFirestore(updatedClubs, updatedCourts);
    showNotification('success', `Club "${clubName}" eliminado.`);
  };

  // Open Courts Management Modal
  const handleOpenCourtsModal = (club: AdminClub) => {
    setSelectedClubForCourts(club);
    setNewCourtForm({
      name: '',
      sportType: 'PADEL',
      surface: 'Césped Sintético Texturado',
      pricePerHour: club.minPrice || 28000,
      durationMinutes: 90,
      capacity: 4,
      isCovered: true,
      hasLighting: true,
      images: club.images.length > 0 ? [club.images[0]] : ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'],
    });
    setIsCourtsModalOpen(true);
  };

  // Add Court to selected club
  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForCourts) return;

    if (!newCourtForm.name.trim()) {
      showNotification('error', 'El nombre de la cancha es obligatorio.');
      return;
    }

    const defaultCapacity =
      newCourtForm.sportType === 'PADEL' ? 4 :
      newCourtForm.sportType === 'FUTBOL_7' ? 14 :
      newCourtForm.sportType === 'FUTBOL_11' ? 22 : 10;

    const newCourt: AdminCourt = {
      id: `court-${selectedClubForCourts.id}-${Date.now()}`,
      clubId: selectedClubForCourts.id,
      name: newCourtForm.name.trim(),
      sportType: newCourtForm.sportType,
      surface: newCourtForm.surface.trim() || 'Césped Sintético',
      pricePerHour: Number(newCourtForm.pricePerHour) || 28000,
      durationMinutes: Number(newCourtForm.durationMinutes) || (newCourtForm.sportType === 'PADEL' ? 90 : 60),
      capacity: Number(newCourtForm.capacity) || defaultCapacity,
      isCovered: newCourtForm.isCovered,
      hasLighting: newCourtForm.hasLighting,
      priceFixedSlotDiscount: 0.12,
      images: newCourtForm.images.length > 0 ? newCourtForm.images : selectedClubForCourts.images,
    };

    const updatedCourts = [...courts, newCourt];
    setCourts(updatedCourts);

    setNewCourtForm(prev => ({
      ...prev,
      name: '',
      pricePerHour: selectedClubForCourts.minPrice || 28000,
    }));

    await handleSaveAllToFirestore(clubs, updatedCourts);
    showNotification('success', `Cancha "${newCourt.name}" agregada a ${selectedClubForCourts.name}.`);
  };

  // Delete Court
  const handleDeleteCourt = async (courtId: string, courtName: string) => {
    if (!confirm(`¿Eliminar la cancha "${courtName}"?`)) return;

    const updatedCourts = courts.filter(c => c.id !== courtId);
    setCourts(updatedCourts);
    await handleSaveAllToFirestore(clubs, updatedCourts);
    showNotification('success', `Cancha eliminada.`);
  };

  // Image upload handler for Club
  const handleClubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingClub) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageFirebase(file, 'clubs');
      if (url) {
        setEditingClub({
          ...editingClub,
          images: [url, ...editingClub.images],
        });
        showNotification('success', 'Imagen subida a Firebase Storage.');
      } else {
        showNotification('error', 'No se pudo subir la imagen.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error al subir archivo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Image upload handler for Court
  const handleCourtImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageFirebase(file, 'courts');
      if (url) {
        setNewCourtForm(prev => ({
          ...prev,
          images: [url, ...prev.images],
        }));
        showNotification('success', 'Imagen subida a Storage.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     Auth Gate Screen
     ──────────────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="admin-root">
        <Head>
          <title>Hay Equipo — Acceso Administrativo</title>
        </Head>

        {/* Unified Top Header — ThoughtLab Swiss Minimal */}
        <header className="landing-header">
          <div className="header-left-col">
            <Link href="/" className="header-brand-wrap">
              <span className="brand-title">HAY EQUIPO?</span>
              <div className="brand-tag-wrap">
                <span className="live-dot-pulse" />
                <span className="brand-sub">CONTROL CENTRAL</span>
                <span className="brand-version-pill">DB V2</span>
              </div>
            </Link>
          </div>

          <div className="header-nav-actions">
            <Link href="/reservar" target="_blank" className="header-nav-link">
              <Icons.ExternalLink size={13} color="#94a3b8" />
              <span>Ver Web</span>
            </Link>
            <Link href="/" className="header-nav-link">
              <span>← Volver al Inicio</span>
            </Link>
          </div>
        </header>

        <div className="login-screen-wrap">
          <div className="login-box">
            <div className="login-badge">
              <Icons.Lock size={13} color="#fc1c46" />
              <span>SISTEMA INTERNO HAY EQUIPO</span>
            </div>

            <h1 className="login-title">PANEL DE CONTROL</h1>
            <p className="login-subtitle">
              Gestión centralizada de clubes, canchas, teléfonos y datos de Mar del Plata.
            </p>

            <form onSubmit={handleAuthSubmit} className="login-form">
              <label className="field-label">CLAVE DE ACCESO</label>
              <input
                type="password"
                placeholder="Ingresá la clave de administrador"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="input-sharp"
                autoFocus
              />

              {authError && <div className="error-badge">{authError}</div>}

              <button type="submit" className="header-cta-pill" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', height: '42px' }}>
                INGRESAR AL PANEL
              </button>
            </form>

            <div className="login-hint">
              <span>Clave por defecto: <code>hayequipo2026</code></span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-root {
            min-height: 100vh;
            background-color: #000000;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            font-family: var(--font-sui, 'Space Grotesk', sans-serif);
          }
          :global(a), :global(a:visited), :global(a:active), :global(a:hover) {
            text-decoration: none !important;
            color: inherit !important;
          }
          :global(.landing-header) {
            position: sticky;
            top: 0;
            z-index: 1000;
            height: 64px;
            padding: 0 32px;
            background: rgba(6, 6, 6, 0.88);
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
          :global(.header-left-col) {
            display: flex;
            align-items: center;
          }
          :global(.header-brand-wrap) {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none !important;
            color: #ffffff !important;
          }
          :global(.brand-title) {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff !important;
            letter-spacing: -0.6px;
            font-family: var(--font-sui, 'Space Grotesk', sans-serif);
            line-height: 1;
          }
          :global(.brand-tag-wrap) {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 3px 9px 3px 7px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
          }
          :global(.live-dot-pulse) {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
            display: inline-block;
            animation: pulseGreen 2.2s infinite ease-in-out;
          }
          @keyframes pulseGreen {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(0.85); }
          }
          :global(.brand-sub) {
            font-size: 10px;
            font-weight: 700;
            color: #94a3b8 !important;
            letter-spacing: 1.1px;
            text-transform: uppercase;
          }
          :global(.brand-version-pill) {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.6px;
            color: #e2e8f0 !important;
            background: rgba(255, 255, 255, 0.08);
            padding: 1px 6px;
            border-radius: 9999px;
          }
          :global(.header-nav-actions) {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          :global(.header-nav-link) {
            background-color: rgba(255, 255, 255, 0.04);
            color: #e2e8f0 !important;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 9999px;
            padding: 7px 15px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none !important;
            letter-spacing: 0.2px;
            transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
            display: inline-flex;
            align-items: center;
            gap: 7px;
            cursor: pointer;
          }
          :global(.header-nav-link:hover) {
            background-color: rgba(255, 255, 255, 0.09);
            border-color: rgba(255, 255, 255, 0.28);
            color: #ffffff !important;
            transform: translateY(-1px);
          }
          .login-screen-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 24px;
          }
          .login-screen {
            width: 100%;
            max-width: 420px;
          }
          .login-box {
            background-color: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 0px;
            padding: 38px 30px;
          }
          .login-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #fc1c46;
            margin-bottom: 18px;
          }
          .login-title {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .login-subtitle {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .field-label {
            display: block;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          .input-sharp {
            width: 100%;
            background-color: #000000;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0px;
            color: #ffffff;
            padding: 12px 16px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .input-sharp:focus {
            border-color: #fc1c46;
          }
          .error-badge {
            margin-top: 12px;
            font-size: 12px;
            color: #fc1c46;
            background: rgba(252, 28, 70, 0.1);
            padding: 8px 12px;
            border-left: 2px solid #fc1c46;
          }
          .btn-pill-cta {
            background-color: #fc1c46;
            color: #ffffff !important;
            border: none;
            border-radius: 9999px;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn-pill-cta:hover {
            opacity: 0.92;
          }
          .login-hint {
            margin-top: 22px;
            font-size: 11px;
            color: #666666;
            text-align: center;
          }
          .login-hint code {
            color: #fc1c46;
            background: rgba(255, 255, 255, 0.05);
            padding: 2px 6px;
          }
        `}</style>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     Main Admin Dashboard
     ──────────────────────────────────────────────────────────── */
  return (
    <div className="admin-root">
      <Head>
        <title>Hay Equipo — Panel de Control</title>
      </Head>

      {/* Toast Notification */}
      {notification && (
        <div className={`toast-banner ${notification.type}`}>
          <div className="toast-content">
            {notification.type === 'success' ? (
              <Icons.Check size={16} color="#10b981" />
            ) : (
              <Icons.Close size={16} color="#fc1c46" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          HEADER — ThoughtLab Swiss Minimal (Consistent with Web)
          ═══════════════════════════════════════════════════════════ */}
      <header className="landing-header">
        <div className="header-left-col">
          <Link href="/" className="header-brand-wrap">
            <span className="brand-title">HAY EQUIPO?</span>
            <div className="brand-tag-wrap">
              <span className="live-dot-pulse" />
              <span className="brand-sub">CONTROL CENTRAL</span>
              <span className="brand-version-pill">DB LIVE</span>
            </div>
          </Link>
        </div>

        {/* Center Live Database Indicator */}
        <div className="header-center-col">
          <div className="header-live-badge">
            <Icons.Building size={13} color="#94a3b8" />
            <span className="badge-text">Sincronizados:</span>
            <span className="badge-highlight">{clubs.length} Clubes</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="header-nav-actions">
          <Link href="/reservar" target="_blank" className="header-nav-link" title="Abrir marketplace de reservas">
            <Icons.ExternalLink size={13} color="#94a3b8" />
            <span>Ver Web</span>
          </Link>

          <Link href="/club" target="_blank" className="header-nav-link" title="Abrir panel operativo de clubes">
            <Icons.Grid size={13} color="#94a3b8" />
            <span>Terminal Clubes</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenNewClub}
            className="header-btn-primary"
            title="Crear un nuevo club en Firestore"
          >
            <Icons.Plus size={14} color="#ffffff" />
            <span>Nuevo Club</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión de administrador"
            className="header-btn-exit"
          >
            <Icons.Close size={13} color="#94a3b8" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-body">
        {/* Metric Cards Bento Grid — 3 Clean Balanced Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">COMPLEJOS EN MDP</div>
            <div className="metric-val">{stats.totalClubs}</div>
            <div className="metric-detail">
              <span className="metric-sub-item crimson">{stats.padelOnlyClubs} Pádel</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item emerald">{stats.futbolOnlyClubs} Fútbol</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item" style={{ color: '#f59e0b' }}>{stats.bothClubs} Mixtos</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">CANCHAS REGISTRADAS</div>
            <div className="metric-val">{stats.totalCourts}</div>
            <div className="metric-detail">
              <span className="metric-sub-item crimson">{stats.padelCourts} Pádel</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item emerald">{stats.totalFutbolCourts} Fútbol</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item" style={{ color: '#888888' }}>{stats.futbol5Courts} F5 / {stats.futbol7Courts} F7 / {stats.futbol11Courts} F11</span>
            </div>
          </div>

          <div className="metric-card highlight-admin">
            <div className="metric-label">ADMINISTRADORES (/club)</div>
            <div className="metric-val text-emerald">
              {stats.clubsWithAdmin} <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 500 }}>/ {stats.totalClubs}</span>
            </div>
            <div className="metric-detail">
              <span className="metric-sub-item emerald">{stats.clubsWithAdmin} Vinculados</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item" style={{ color: '#f59e0b' }}>{stats.clubsWithoutAdmin} Sin asignar</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="action-bar">
          <div className="search-wrapper">
            <Icons.Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por complejo, dirección, teléfono o email de admin..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn-clear">
                <Icons.Close size={12} />
              </button>
            )}
          </div>

          {/* Filter Pills: Sport and Admin Status */}
          <div className="filter-chips">
            <button
              onClick={() => setSportFilter('ALL')}
              className={`filter-chip ${sportFilter === 'ALL' ? 'active' : ''}`}
            >
              TODOS ({stats.totalClubs})
            </button>
            <button
              onClick={() => setSportFilter('PADEL')}
              className={`filter-chip ${sportFilter === 'PADEL' ? 'active' : ''}`}
            >
              PÁDEL ({stats.padelCourts})
            </button>
            <button
              onClick={() => setSportFilter('FUTBOL')}
              className={`filter-chip ${sportFilter === 'FUTBOL' ? 'active' : ''}`}
            >
              FÚTBOL ({stats.totalFutbolCourts})
            </button>
            <button
              onClick={() => setSportFilter('BOTH')}
              className={`filter-chip ${sportFilter === 'BOTH' ? 'active' : ''}`}
            >
              MIXTOS ({stats.bothClubs})
            </button>

            <span className="filter-chip-sep" />

            <button
              onClick={() => setAdminFilter('ALL')}
              className={`filter-chip sub-chip ${adminFilter === 'ALL' ? 'active-sub' : ''}`}
            >
              TODOS LOS ACCESOS
            </button>
            <button
              onClick={() => setAdminFilter('ASSIGNED')}
              className={`filter-chip sub-chip ${adminFilter === 'ASSIGNED' ? 'active-emerald' : ''}`}
            >
              CON ADMIN ({stats.clubsWithAdmin})
            </button>
            <button
              onClick={() => setAdminFilter('UNASSIGNED')}
              className={`filter-chip sub-chip ${adminFilter === 'UNASSIGNED' ? 'active-amber' : ''}`}
            >
              SIN ADMIN ({stats.clubsWithoutAdmin})
            </button>
          </div>
        </div>

        {/* Clubs Container: Grilla Minimalista / Lista */}
        <div className="catalog-container">
          <div className="table-header-meta">
            <div className="meta-left-group">
              <span className="results-count">
                MOSTRANDO {filteredClubs.length} DE {clubs.length} CLUBES EN MAR DEL PLATA
              </span>

              {/* View Mode Toggle: GRILLA vs LISTA */}
              <div className="view-toggle-capsule">
                <button
                  type="button"
                  onClick={() => setViewMode('GRID')}
                  className={`btn-view-toggle ${viewMode === 'GRID' ? 'active' : ''}`}
                  title="Vista en Grilla de Bloques"
                >
                  <Icons.Grid size={12} />
                  <span>GRILLA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  className={`btn-view-toggle ${viewMode === 'LIST' ? 'active' : ''}`}
                  title="Vista en Lista"
                >
                  <Icons.List size={12} />
                  <span>LISTA</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => handleSaveAllToFirestore()}
                disabled={isSaving}
                className="btn-sync-all"
                title="Sincronizar todo el catálogo a Firestore"
              >
                <Icons.Database size={13} color="#10b981" />
                <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR EN FIRESTORE'}</span>
              </button>
              <button onClick={fetchData} className="btn-refresh" title="Recargar desde Firestore">
                <Icons.Refresh size={13} />
                <span>RECARGAR</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Cargando complejos desde base de datos...</span>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron clubes con los filtros seleccionados.</p>
              <button
                onClick={() => { setSearchQuery(''); setSportFilter('ALL'); setAdminFilter('ALL'); }}
                className="btn-pill-reset"
                style={{ marginTop: '14px' }}
              >
                REINICIAR BÚSQUEDA
              </button>
            </div>
          ) : viewMode === 'GRID' ? (
            /* ═══════════════════════════════════════════════════════════
               GRILLA DE BLOQUES MINIMALISTAS (Cohesiva con Hay Equipo)
               ═══════════════════════════════════════════════════════════ */
            <div className="clubs-grid-layout">
              {filteredClubs.map(club => {
                const clubCourts = courts.filter(c => c.clubId === club.id);
                const padelCount = clubCourts.filter(c => c.sportType === 'PADEL').length;
                const f5Count = clubCourts.filter(c => c.sportType === 'FUTBOL_5').length;
                const f7Count = clubCourts.filter(c => c.sportType === 'FUTBOL_7').length;
                const f11Count = clubCourts.filter(c => c.sportType === 'FUTBOL_11').length;
                const cleanWhatsApp = club.whatsapp.replace(/[^0-9]/g, '');

                const derivedSports = club.sports && club.sports.length > 0 
                  ? club.sports 
                  : [
                      ...(padelCount > 0 ? ['PADEL'] : []),
                      ...(f5Count > 0 || f7Count > 0 || f11Count > 0 ? ['FUTBOL'] : [])
                    ];

                const primaryEmail = club.adminEmail || (club.adminEmails && club.adminEmails[0]) || '';
                const totalAdminsCount = club.adminEmails ? club.adminEmails.length : (club.adminEmail ? 1 : 0);
                const coverImage = (club.images && club.images[0]) || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80';

                return (
                  <div key={club.id} className={`club-block-card ${!club.active ? 'is-inactive' : ''}`}>
                    {/* Visual Banner */}
                    <div className="club-block-banner">
                      <div
                        className="club-block-cover-img"
                        style={{ backgroundImage: `url(${coverImage})` }}
                      />
                      <div className="club-block-overlay" />

                      {/* Top Badges */}
                      <div className="club-block-top-row">
                        <SportBadge sports={derivedSports} size="sm" />

                        {primaryEmail ? (
                          <span className="pill-admin-status ok" title={`Admin vinculado: ${primaryEmail}`}>
                            <Icons.Key size={10} color="#10b981" />
                            <span>ADMIN VINCULADO</span>
                          </span>
                        ) : (
                          <span className="pill-admin-status pending" title="Sin email de administrador">
                            <Icons.AlertCircle size={10} color="#94a3b8" />
                            <span>SIN ADMIN</span>
                          </span>
                        )}
                      </div>

                      {/* Name & Slug */}
                      <div className="club-block-header-text">
                        <h3 className="club-block-title" title={club.name}>{club.name}</h3>
                        <div className="club-block-slug">ID: {club.id}</div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="club-block-body">
                      {/* Address */}
                      <div className="block-data-row">
                        <Icons.MapPin size={13} color="#94a3b8" />
                        <span className="block-data-text">
                          {club.address || 'Sin dirección física'} · {club.city || 'Mar del Plata'}
                        </span>
                      </div>

                      {/* Courts Breakdown */}
                      <div className="block-courts-box">
                        <span className="courts-box-label">
                          {clubCourts.length} {clubCourts.length === 1 ? 'CANCHA' : 'CANCHAS'}
                        </span>
                        <div className="courts-box-chips">
                          {padelCount > 0 && <span className="court-mini-chip padel">{padelCount} Pádel</span>}
                          {f5Count > 0 && <span className="court-mini-chip futbol">{f5Count} F5</span>}
                          {f7Count > 0 && <span className="court-mini-chip futbol">{f7Count} F7</span>}
                          {f11Count > 0 && <span className="court-mini-chip futbol">{f11Count} F11</span>}
                          {clubCourts.length === 0 && <span className="court-mini-chip zero">0 canchas</span>}
                        </div>
                      </div>

                      {/* Admin Access Status & Email */}
                      <div className="block-admin-row">
                        <div className="block-admin-info">
                          <Icons.Mail size={12} color={primaryEmail ? '#10b981' : '#64748b'} />
                          <span className={`block-admin-email ${primaryEmail ? 'has-email' : 'no-email'}`}>
                            {primaryEmail || 'Sin email de acceso asignado'}
                          </span>
                          {totalAdminsCount > 1 && (
                            <span className="admin-extra-badge">+{totalAdminsCount - 1}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditClub(club)}
                          className="btn-block-assign"
                        >
                          {primaryEmail ? 'Editar' : '+ Asignar'}
                        </button>
                      </div>

                      {/* Phone & WhatsApp */}
                      <div className="block-contact-row">
                        {cleanWhatsApp && (
                          <a
                            href={`https://wa.me/${cleanWhatsApp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block-contact-link whatsapp"
                            title="Chatear por WhatsApp"
                          >
                            <Icons.WhatsApp size={12} color="#10b981" />
                            <span>{club.whatsapp}</span>
                          </a>
                        )}
                        {club.phone && (
                          <a
                            href={`tel:${club.phone.replace(/[^0-9+]/g, '')}`}
                            className="block-contact-link phone"
                            title="Llamar"
                          >
                            <Icons.Phone size={12} color="#94a3b8" />
                            <span>{club.phone}</span>
                          </a>
                        )}
                        {!cleanWhatsApp && !club.phone && (
                          <span className="block-contact-empty">Sin teléfono de contacto</span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="club-block-footer">
                      <div className="block-footer-left">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClub(club)}
                          className="btn-card-action"
                          title="Editar información del club"
                        >
                          <Icons.Edit size={12} />
                          <span>EDITAR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCourtsModal(club)}
                          className="btn-card-action"
                          title="Gestionar canchas"
                        >
                          <Icons.Pitch size={12} />
                          <span>CANCHAS ({clubCourts.length})</span>
                        </button>
                      </div>

                      <div className="block-footer-right">
                        <Link
                          href={`/club?vincular=${club.id}`}
                          target="_blank"
                          className="btn-card-action highlight"
                          title="Ver terminal privada en /club"
                        >
                          <Icons.ExternalLink size={11} />
                          <span>/club</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteClub(club.id, club.name)}
                          className="btn-card-action danger"
                          title="Eliminar club"
                        >
                          <Icons.Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════
               LISTA MINIMALISTA DE CLUBES (Rediseñada y ordenada)
               ═══════════════════════════════════════════════════════════ */
            <div className="clubs-clean-list">
              {filteredClubs.map(club => {
                const clubCourts = courts.filter(c => c.clubId === club.id);
                const padelCount = clubCourts.filter(c => c.sportType === 'PADEL').length;
                const f5Count = clubCourts.filter(c => c.sportType === 'FUTBOL_5').length;
                const f7Count = clubCourts.filter(c => c.sportType === 'FUTBOL_7').length;
                const f11Count = clubCourts.filter(c => c.sportType === 'FUTBOL_11').length;
                const cleanWhatsApp = club.whatsapp.replace(/[^0-9]/g, '');

                const derivedSports = club.sports && club.sports.length > 0 
                  ? club.sports 
                  : [
                      ...(padelCount > 0 ? ['PADEL'] : []),
                      ...(f5Count > 0 || f7Count > 0 || f11Count > 0 ? ['FUTBOL'] : [])
                    ];

                const primaryEmail = club.adminEmail || (club.adminEmails && club.adminEmails[0]) || '';
                const totalAdminsCount = club.adminEmails ? club.adminEmails.length : (club.adminEmail ? 1 : 0);
                const coverImage = (club.images && club.images[0]) || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300';

                return (
                  <div key={club.id} className="clean-list-item">
                    {/* Club Info */}
                    <div className="clean-list-col-main">
                      <div
                        className="clean-list-thumb"
                        style={{ backgroundImage: `url(${coverImage})` }}
                      />
                      <div>
                        <div className="clean-list-name-row">
                          <span className="clean-list-name">{club.name}</span>
                          <SportBadge sports={derivedSports} size="sm" />
                        </div>
                        <div className="clean-list-slug">ID: {club.id}</div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="clean-list-col-address">
                      <Icons.MapPin size={12} color="#94a3b8" />
                      <span>{club.address || 'Sin dirección'} · {club.city || 'Mar del Plata'}</span>
                    </div>

                    {/* Courts */}
                    <div className="clean-list-col-courts">
                      <span className="courts-count-text">
                        {clubCourts.length} {clubCourts.length === 1 ? 'CANCHA' : 'CANCHAS'}
                      </span>
                      <div className="courts-box-chips">
                        {padelCount > 0 && <span className="court-mini-chip padel">{padelCount} P</span>}
                        {f5Count > 0 && <span className="court-mini-chip futbol">{f5Count} F5</span>}
                        {f7Count > 0 && <span className="court-mini-chip futbol">{f7Count} F7</span>}
                        {f11Count > 0 && <span className="court-mini-chip futbol">{f11Count} F11</span>}
                      </div>
                    </div>

                    {/* Admin */}
                    <div className="clean-list-col-admin">
                      {primaryEmail ? (
                        <span className="pill-admin-status ok" title={primaryEmail}>
                          <Icons.Key size={10} color="#10b981" />
                          <span className="truncate">{primaryEmail}</span>
                          {totalAdminsCount > 1 && <span className="admin-extra-badge">+{totalAdminsCount - 1}</span>}
                        </span>
                      ) : (
                        <span className="pill-admin-status pending" onClick={() => handleOpenEditClub(club)} style={{ cursor: 'pointer' }}>
                          <Icons.AlertCircle size={10} color="#94a3b8" />
                          <span>Sin admin (+ Asignar)</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="clean-list-col-actions">
                      <button
                        onClick={() => handleOpenEditClub(club)}
                        className="btn-card-action"
                        title="Editar datos del club"
                      >
                        <Icons.Edit size={12} />
                        <span>EDITAR</span>
                      </button>

                      <button
                        onClick={() => handleOpenCourtsModal(club)}
                        className="btn-card-action"
                        title="Gestionar canchas"
                      >
                        <Icons.Pitch size={12} />
                        <span>CANCHAS</span>
                      </button>

                      <Link
                        href={`/club?vincular=${club.id}`}
                        target="_blank"
                        className="btn-card-action highlight"
                        title="Abrir en /club"
                      >
                        <Icons.ExternalLink size={11} />
                        <span>/club</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteClub(club.id, club.name)}
                        className="btn-card-action danger"
                        title="Eliminar club"
                      >
                        <Icons.Trash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────
         MODAL: Editar / Crear Club
         ──────────────────────────────────────────────────────────── */}
      {isClubModalOpen && editingClub && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {isNewClub ? 'CREACIÓN DE NUEVO COMPLEJO' : 'EDICIÓN DE CLUB'}
                </span>
                <h2 className="modal-title">
                  {isNewClub ? 'Agregar Club a la Base de Datos' : editingClub.name}
                </h2>
              </div>
              <button
                onClick={() => { setIsClubModalOpen(false); setEditingClub(null); }}
                className="btn-header-icon"
              >
                <Icons.Close size={14} color="#ffffff" />
              </button>
            </div>

            <form onSubmit={handleSaveClubModal} className="modal-form-body">
              {/* Bloque 1: Identificación y Nombre */}
              <div className="form-grid-2">
                <div>
                  <label className="form-label">NOMBRE DEL CLUB / COMPLEJO *</label>
                  <input
                    type="text"
                    required
                    value={editingClub.name}
                    onChange={e => setEditingClub({ ...editingClub, name: e.target.value })}
                    placeholder="Ej: Complejo Los Naranjos"
                    className="input-sharp"
                  />
                </div>

                <div>
                  <label className="form-label">IDENTIFICADOR / SLUG</label>
                  <input
                    type="text"
                    value={editingClub.slug}
                    onChange={e => setEditingClub({ ...editingClub, slug: e.target.value })}
                    placeholder="Ej: los-naranjos"
                    className="input-sharp"
                  />
                </div>
              </div>

              {/* Bloque 2: Ubicación Física y Dirección */}
              <div className="form-grid-3">
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">DIRECCIÓN FÍSICA *</label>
                  <div className="input-with-icon">
                    <Icons.MapPin size={14} color="#fc1c46" />
                    <input
                      type="text"
                      required
                      value={editingClub.address}
                      onChange={e => setEditingClub({ ...editingClub, address: e.target.value })}
                      placeholder="Ej: Dorrego 333"
                      className="input-sharp input-padded"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">CIUDAD</label>
                  <input
                    type="text"
                    value={editingClub.city}
                    onChange={e => setEditingClub({ ...editingClub, city: e.target.value })}
                    placeholder="Mar del Plata"
                    className="input-sharp"
                  />
                </div>
              </div>

              {/* Bloque 3: Teléfonos y Contacto */}
              <div className="form-grid-2">
                <div>
                  <label className="form-label">TELÉFONO FIJO / DE LÍNEA</label>
                  <div className="input-with-icon">
                    <Icons.Phone size={14} color="#94a3b8" />
                    <input
                      type="text"
                      value={editingClub.phone}
                      onChange={e => setEditingClub({ ...editingClub, phone: e.target.value })}
                      placeholder="Ej: (0223) 472-9295"
                      className="input-sharp input-padded"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">WHATSAPP DE CONTACTO (Móvil)</label>
                  <div className="input-with-icon">
                    <Icons.WhatsApp size={14} color="#10b981" />
                    <input
                      type="text"
                      value={editingClub.whatsapp}
                      onChange={e => setEditingClub({ ...editingClub, whatsapp: e.target.value })}
                      placeholder="Ej: +54 9 223 547-0343"
                      className="input-sharp input-padded"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 4: ACCESO DE ADMINISTRADOR DEL CLUB (DESTACADO) */}
              <div className="admin-access-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">
                    <Icons.Key size={15} color="#fc1c46" />
                    <span>ADMINISTRADOR DE CLUB (/club)</span>
                  </div>
                  <span className="admin-card-pill">SEGURIDAD Y PERMISOS</span>
                </div>

                <p className="admin-card-desc">
                  Asigná el correo electrónico (Gmail o email registrado) del encargado o dueño del club. Con este correo, al ingresar a la pestaña <strong>/club</strong>, se le otorgará acceso inmediato al panel de gestión de sus canchas y reservas.
                </p>

                <div className="admin-fields-row">
                  <div style={{ flex: 1 }}>
                    <label className="form-label">CORREO PRINCIPAL DEL ADMINISTRADOR</label>
                    <div className="input-with-icon">
                      <Icons.Mail size={14} color="#10b981" />
                      <input
                        type="email"
                        value={editingClub.adminEmail || ''}
                        onChange={e => setEditingClub({ ...editingClub, adminEmail: e.target.value })}
                        placeholder="ejemplo@gmail.com o admin@club.com"
                        className="input-sharp input-padded"
                      />
                    </div>
                  </div>

                  {!isNewClub && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Link
                        href={`/club?vincular=${editingClub.id}`}
                        target="_blank"
                        className="btn-test-club-panel"
                        title="Abrir y verificar acceso al panel privado del club"
                      >
                        <Icons.ExternalLink size={12} />
                        <span>PROBAR PANEL (/club)</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Administradores adicionales */}
                <div className="additional-admins-box">
                  <label className="form-label" style={{ marginBottom: 6 }}>
                    CORREOS AUTORIZADOS ADICIONALES (RECEPCIONISTAS / SOCIOS)
                  </label>
                  
                  {editingClub.adminEmails && editingClub.adminEmails.length > 0 && (
                    <div className="admin-chips-list">
                      {editingClub.adminEmails.map((email, idx) => (
                        <div key={idx} className="admin-email-tag">
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSecondaryAdminEmail(email)}
                            className="btn-del-email-tag"
                            title="Quitar este acceso"
                          >
                            <Icons.Close size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="add-email-row">
                    <input
                      type="email"
                      value={newAdminEmailInput}
                      onChange={e => setNewAdminEmailInput(e.target.value)}
                      placeholder="Agregar otro correo de personal (ej: socio@club.com)..."
                      className="input-sharp"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSecondaryAdminEmail();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSecondaryAdminEmail}
                      className="btn-add-email-pill"
                    >
                      <Icons.Plus size={12} />
                      <span>AGREGAR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bloque 5: Disciplina del Complejo */}
              <div>
                <label className="form-label">DISCIPLINA DEL COMPLEJO</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {[
                    { id: 'PADEL', label: 'Solo Pádel', sports: ['PADEL'] },
                    { id: 'FUTBOL', label: 'Solo Fútbol', sports: ['FUTBOL'] },
                    { id: 'BOTH', label: 'Ambos (Pádel & Fútbol)', sports: ['PADEL', 'FUTBOL'] },
                  ].map(disc => {
                    const currentCategory = (editingClub.sports?.includes('PADEL') && editingClub.sports?.includes('FUTBOL'))
                      ? 'BOTH'
                      : editingClub.sports?.includes('PADEL')
                      ? 'PADEL'
                      : editingClub.sports?.includes('FUTBOL')
                      ? 'FUTBOL'
                      : 'BOTH';

                    const isSelected = currentCategory === disc.id;
                    return (
                      <button
                        type="button"
                        key={disc.id}
                        onClick={() => setEditingClub({ ...editingClub, sports: disc.sports, sportCategory: disc.id as any })}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          backgroundColor: isSelected ? 'rgba(252, 28, 70, 0.15)' : '#000000',
                          color: isSelected ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
                          border: `1px solid ${isSelected ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.18)'}`,
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {disc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque 6: Precios y Horarios */}
              <div className="form-grid-2">
                <div>
                  <label className="form-label">PRECIO BASE DE REFERENCIA (ARS)</label>
                  <input
                    type="number"
                    value={editingClub.minPrice}
                    onChange={e => setEditingClub({ ...editingClub, minPrice: Number(e.target.value) })}
                    placeholder="28000"
                    className="input-sharp"
                  />
                </div>

                <div>
                  <label className="form-label">HORARIO ESTIMADO (APERTURA Y CIERRE)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={editingClub.openingTime}
                      onChange={e => setEditingClub({ ...editingClub, openingTime: e.target.value })}
                      placeholder="08:00"
                      className="input-sharp"
                    />
                    <input
                      type="text"
                      value={editingClub.closingTime}
                      onChange={e => setEditingClub({ ...editingClub, closingTime: e.target.value })}
                      placeholder="23:30"
                      className="input-sharp"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">DESCRIPCIÓN DEL COMPLEJO</label>
                <textarea
                  rows={2}
                  value={editingClub.description}
                  onChange={e => setEditingClub({ ...editingClub, description: e.target.value })}
                  placeholder="Detalles sobre las instalaciones, vestuarios, ambiente..."
                  className="input-sharp"
                />
              </div>

              {/* Bloque 7: GESTIÓN DE FOTOS DEL CLUB */}
              <div className="photos-management-card">
                <div className="images-label-row">
                  <div>
                    <label className="form-label" style={{ marginBottom: 2 }}>
                      FOTOS DEL CLUB ({editingClub.images.length})
                    </label>
                    <span className="images-sublabel">
                      La primera foto es la portada principal en la app y web. Podés subir archivos a Firebase Storage o pegar URLs directas.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-pill-upload"
                  >
                    <Icons.Upload size={13} />
                    <span>{uploadingImage ? 'SUBIENDO...' : 'SUBIR FOTO A STORAGE'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleClubImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Input para agregar foto por URL */}
                <div className="add-image-url-row">
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Icons.Image size={13} color="#94a3b8" />
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="O pegar URL directa de imagen (ej: https://...)"
                      className="input-sharp input-url"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="btn-add-url-pill"
                  >
                    <Icons.Plus size={12} />
                    <span>AGREGAR FOTO</span>
                  </button>
                </div>

                {/* Galería de fotos con Portada y Eliminar */}
                <div className="images-gallery-grid">
                  {editingClub.images.map((imgUrl, i) => (
                    <div key={i} className={`image-card-item ${i === 0 ? 'is-cover' : ''}`}>
                      <div
                        className="image-card-thumb"
                        style={{
                          backgroundImage: `url(${imgUrl})`,
                        }}
                      />

                      <div className="image-card-overlay">
                        {i === 0 ? (
                          <div className="cover-badge">
                            <Icons.Star size={10} color="#fc1c46" />
                            <span>PORTADA</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCoverImage(i)}
                            className="btn-make-cover"
                            title="Hacer foto de portada"
                          >
                            Hacer Portada
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="btn-delete-image"
                          title="Eliminar foto"
                        >
                          <Icons.Trash size={12} color="#ffffff" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 8: Comodidades y Servicios */}

              {/* Amenities Toggles */}
              <div>
                <label className="form-label">COMODIDADES Y SERVICIOS</label>
                <div className="amenities-grid">
                  {([
                    ['covered', 'Techado / Cubierto'],
                    ['lighting', 'Iluminación LED'],
                    ['parking', 'Estacionamiento'],
                    ['buffet', 'Buffet / Confitería'],
                    ['showers', 'Duchas de Agua Caliente'],
                    ['lockerRooms', 'Vestuarios'],
                    ['wifi', 'Wi-Fi'],
                    ['equipmentRental', 'Alquiler de Paletas/Balones'],
                    ['grill', 'Parrillas / Quinchos'],
                    ['syntheticWPT', 'Césped Texturado WPT'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="amenity-toggle">
                      <input
                        type="checkbox"
                        checked={!!editingClub.amenities[key as keyof AdminClubAmenities]}
                        onChange={e => {
                          setEditingClub({
                            ...editingClub,
                            amenities: {
                              ...editingClub.amenities,
                              [key]: e.target.checked,
                            },
                          });
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setIsClubModalOpen(false); setEditingClub(null); }}
                  className="btn-header-ghost"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-header-primary"
                >
                  {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
         MODAL: Gestión de Canchas por Club
         ──────────────────────────────────────────────────────────── */}
      {isCourtsModalOpen && selectedClubForCourts && (
        <div className="modal-overlay">
          <div className="modal-window modal-wide">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">GESTIÓN DE CANCHAS Y CAPACIDADES</span>
                <h2 className="modal-title">{selectedClubForCourts.name}</h2>
              </div>
              <button
                onClick={() => { setIsCourtsModalOpen(false); setSelectedClubForCourts(null); }}
                className="btn-header-icon"
              >
                <Icons.Close size={14} color="#ffffff" />
              </button>
            </div>

            <div className="modal-two-column">
              {/* Left Column: List of existing courts */}
              <div className="courts-list-column">
                <div className="column-title">
                  CANCHAS REGISTRADAS ({courts.filter(c => c.clubId === selectedClubForCourts.id).length})
                </div>

                <div className="courts-scrollable">
                  {courts.filter(c => c.clubId === selectedClubForCourts.id).length === 0 ? (
                    <div className="no-courts-notice">
                      No hay canchas creadas aún para este club. Usá el formulario a la derecha para dar de alta la primera.
                    </div>
                  ) : (
                    courts
                      .filter(c => c.clubId === selectedClubForCourts.id)
                      .map(court => (
                        <div key={court.id} className="court-item-card">
                          <div className="court-item-header">
                            <span className={`court-type-pill ${court.sportType === 'PADEL' ? 'padel' : 'futbol'}`}>
                              {court.sportType === 'PADEL' ? 'PÁDEL' : court.sportType.replace('_', ' ')}
                            </span>
                            <span className="court-capacity-pill">
                              <Icons.Users size={12} />
                              <span>{court.capacity} JUGADORES</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourt(court.id, court.name)}
                              className="btn-del-court"
                              title="Eliminar cancha"
                            >
                              <Icons.Trash size={12} color="#fc1c46" />
                            </button>
                          </div>

                          <div className="court-item-name">{court.name}</div>
                          <div className="court-item-surface">{court.surface}</div>

                          <div className="court-item-meta">
                            <span>${court.pricePerHour.toLocaleString()} ARS / turno</span>
                            <span>·</span>
                            <span>{court.durationMinutes} min</span>
                            <span>·</span>
                            <span>{court.isCovered ? 'Techada' : 'Al aire libre'}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Right Column: Add New Court Form */}
              <div className="new-court-column">
                <div className="column-title">NUEVA CANCHA PARA ESTE CLUB</div>

                <form onSubmit={handleAddCourt} className="new-court-form">
                  <div>
                    <label className="form-label">TIPO DE DEPORTE *</label>
                    <select
                      value={newCourtForm.sportType}
                      onChange={e => {
                        const val = e.target.value as SportType;
                        const defaultCap =
                          val === 'PADEL' ? 4 :
                          val === 'FUTBOL_7' ? 14 :
                          val === 'FUTBOL_11' ? 22 : 10;

                        setNewCourtForm({
                          ...newCourtForm,
                          sportType: val,
                          capacity: defaultCap,
                          surface: val === 'PADEL' ? 'Césped Sintético Texturado WPT' : 'Césped Sintético Forbex 50mm',
                        });
                      }}
                      className="input-sharp select-sharp"
                    >
                      <option value="PADEL">Pádel (4 personas)</option>
                      <option value="FUTBOL_5">Fútbol 5 (10 personas)</option>
                      <option value="FUTBOL_7">Fútbol 7 (14 personas)</option>
                      <option value="FUTBOL_11">Fútbol 11 (22 personas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">NOMBRE DE LA CANCHA *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Cancha 1 — Panorámica Cristal WPT"
                      value={newCourtForm.name}
                      onChange={e => setNewCourtForm({ ...newCourtForm, name: e.target.value })}
                      className="input-sharp"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">CAPACIDAD (PERSONAS)</label>
                      <input
                        type="number"
                        value={newCourtForm.capacity}
                        onChange={e => setNewCourtForm({ ...newCourtForm, capacity: Number(e.target.value) })}
                        className="input-sharp"
                      />
                    </div>

                    <div>
                      <label className="form-label">PRECIO TURNO (ARS)</label>
                      <input
                        type="number"
                        value={newCourtForm.pricePerHour}
                        onChange={e => setNewCourtForm({ ...newCourtForm, pricePerHour: Number(e.target.value) })}
                        className="input-sharp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">SUPERFICIE / DETALLES</label>
                    <input
                      type="text"
                      placeholder="Ej: Césped Sintético Forbex 50mm con caucho"
                      value={newCourtForm.surface}
                      onChange={e => setNewCourtForm({ ...newCourtForm, surface: e.target.value })}
                      className="input-sharp"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">DURACIÓN TURNO (MIN)</label>
                      <select
                        value={newCourtForm.durationMinutes}
                        onChange={e => setNewCourtForm({ ...newCourtForm, durationMinutes: Number(e.target.value) })}
                        className="input-sharp select-sharp"
                      >
                        <option value={60}>60 minutos (1 hora)</option>
                        <option value={90}>90 minutos (1h 30m)</option>
                        <option value={120}>120 minutos (2 horas)</option>
                      </select>
                    </div>

                    <div className="checkbox-col">
                      <label className="amenity-toggle" style={{ marginTop: '24px' }}>
                        <input
                          type="checkbox"
                          checked={newCourtForm.isCovered}
                          onChange={e => setNewCourtForm({ ...newCourtForm, isCovered: e.target.checked })}
                        />
                        <span>Cancha Techada</span>
                      </label>
                    </div>
                  </div>

                  {/* Court Image upload */}
                  <div>
                    <div className="images-label-row">
                      <label className="form-label" style={{ marginBottom: 0 }}>FOTO DE LA CANCHA</label>
                      <button
                        type="button"
                        onClick={() => courtFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn-pill-upload"
                      >
                        <Icons.Upload size={12} />
                        <span>{uploadingImage ? 'SUBIENDO...' : 'SUBIR FOTO'}</span>
                      </button>
                      <input
                        ref={courtFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCourtImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {newCourtForm.images && newCourtForm.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {newCourtForm.images.map((imgUrl, i) => (
                          <div key={i} className="image-preview-card">
                            <img src={imgUrl} alt="Cancha" />
                            <button
                              type="button"
                              className="btn-remove-img"
                              onClick={() =>
                                setNewCourtForm(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, idx) => idx !== i),
                                }))
                              }
                              title="Eliminar foto"
                            >
                              <Icons.Trash size={10} color="#ffffff" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-header-primary"
                    style={{ width: '100%', marginTop: '14px', justifyContent: 'center' }}
                  >
                    <Icons.Plus size={15} color="#ffffff" />
                    <span>AGREGAR ESTA CANCHA AL CLUB</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global & Scoped Styles */}
      <style jsx global>{`
        /* Eradicate any browser default purple/blue link colors and outlines */
        a, a:visited, a:active, a:hover {
          text-decoration: none !important;
          color: inherit !important;
        }

        /* ── Header Matching Landing & Rest of Web — ThoughtLab Swiss Minimal ── */
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 64px;
          padding: 0 32px;
          background: rgba(6, 6, 6, 0.88);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .header-left-col {
          display: flex;
          align-items: center;
        }

        .header-brand-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none !important;
          color: #ffffff !important;
        }

        .brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff !important;
          letter-spacing: -0.6px;
          font-family: var(--font-sui, 'Space Grotesk', sans-serif);
          line-height: 1;
        }

        .brand-tag-wrap {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 3px 9px 3px 7px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
        }

        .live-dot-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          display: inline-block;
          animation: pulseGreen 2.2s infinite ease-in-out;
        }

        @keyframes pulseGreen {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.85);
          }
        }

        .brand-sub {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8 !important;
          letter-spacing: 1.1px;
          text-transform: uppercase;
        }

        .brand-version-pill {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: #e2e8f0 !important;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 6px;
          border-radius: 9999px;
        }

        .header-center-col {
          display: flex;
          align-items: center;
        }

        .header-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          font-size: 11.5px;
        }

        .badge-text {
          color: #94a3b8;
          font-weight: 500;
        }

        .badge-highlight {
          color: #ffffff;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .header-nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-nav-link {
          background-color: rgba(255, 255, 255, 0.04);
          color: #e2e8f0 !important;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 7px 15px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none !important;
          letter-spacing: 0.2px;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }

        .header-nav-link:hover {
          background-color: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.28);
          color: #ffffff !important;
          transform: translateY(-1px);
        }

        .header-btn-primary {
          background-color: #fc1c46;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          cursor: pointer;
          box-shadow: 0 2px 14px rgba(252, 28, 70, 0.32);
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-btn-primary:hover {
          background-color: #ff2a54;
          box-shadow: 0 4px 20px rgba(252, 28, 70, 0.48);
          transform: translateY(-1px);
        }

        .header-btn-exit {
          background-color: transparent;
          color: #94a3b8 !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          padding: 7px 13px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-btn-exit:hover {
          color: #fc1c46 !important;
          border-color: rgba(252, 28, 70, 0.4);
          background-color: rgba(252, 28, 70, 0.08);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .landing-header {
            padding: 0 16px;
          }
          .header-center-col {
            display: none;
          }
          .brand-sub, .brand-version-pill {
            display: none;
          }
        }
      `}</style>

      <style jsx>{`
        .admin-root {
          min-height: 100vh;
          background-color: var(--color-void, #000000);
          color: var(--color-frost, #ffffff);
          font-family: var(--font-sui, 'Space Grotesk', sans-serif);
          padding-bottom: 60px;
        }

        /* Toast */
        .toast-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
          padding: 12px 20px;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-banner.success {
          border-left: 3px solid #10b981;
        }
        .toast-banner.error {
          border-left: 3px solid #fc1c46;
        }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Body */
        .admin-body {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 36px;
        }

        /* Metrics Bento Grid — 3 Balanced Cards */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .landing-header {
            padding: 0 16px;
          }
          .admin-body {
            padding: 20px 16px;
          }
        }
        .metric-card {
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          padding: 20px;
        }
        .metric-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .metric-val {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .metric-val.text-crimson {
          color: #fc1c46;
        }
        .metric-val.text-emerald {
          color: #10b981;
        }
        .metric-detail {
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .metric-sub-item.emerald {
          color: #10b981;
        }
        .metric-sub-item.crimson {
          color: #fc1c46;
        }
        .metric-divider {
          color: #444444;
        }

        /* Action & Filter Bar */
        .action-bar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }
        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0px;
          padding: 0 16px;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          border-radius: 0px;
          color: #ffffff;
          padding: 12px 12px;
          font-size: 14px;
          outline: none;
        }
        .btn-clear {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        /* Filter Chips */
        .filter-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .filter-chip {
          background: #0a0a0a;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-chip:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .filter-chip.active {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }
        .filter-chip-sep {
          width: 1px;
          height: 18px;
          background-color: rgba(255, 255, 255, 0.15);
          margin: 0 4px;
          flex-shrink: 0;
        }
        .filter-chip.sub-chip {
          background: #141414;
        }
        .filter-chip.active-sub {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }
        .filter-chip.active-emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: #10b981;
        }
        .filter-chip.active-amber {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .btn-sync-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #141414;
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 9999px;
          color: #10b981;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-sync-all:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10b981;
        }

        /* Catalog Container: Sharp 90° */
        .catalog-container {
          background-color: transparent;
          border: none;
          border-radius: 0px;
        }
        .table-header-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 12px;
        }
        .meta-left-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .view-toggle-capsule {
          display: inline-flex;
          align-items: center;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 2px;
          gap: 2px;
        }
        .btn-view-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          border-radius: 9999px;
          color: #94a3b8;
          padding: 4px 11px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-view-toggle:hover {
          color: #ffffff;
        }
        .btn-view-toggle.active {
          background: #ffffff;
          color: #000000;
        }

        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          color: #94a3b8;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          transition: all 0.2s;
        }
        .btn-refresh:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.35);
        }

        /* ═══════════════════════════════════════════════════════════
           GRILLA DE BLOQUES MINIMALISTAS
           ═══════════════════════════════════════════════════════════ */
        .clubs-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 22px;
        }
        .club-block-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .club-block-card:hover {
          border-color: rgba(252, 28, 70, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        }
        .club-block-card.is-inactive {
          opacity: 0.55;
        }

        /* Block Banner / Header */
        .club-block-banner {
          position: relative;
          height: 145px;
          overflow: hidden;
          background: #000000;
        }
        .club-block-cover-img {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: brightness(0.85);
          transition: transform 0.4s ease;
        }
        .club-block-card:hover .club-block-cover-img {
          transform: scale(1.03);
        }
        .club-block-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.65) 50%, rgba(10, 10, 10, 0.2) 100%);
        }
        .club-block-top-row {
          position: absolute;
          top: 12px;
          left: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          z-index: 2;
        }
        .pill-admin-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 3px 9px;
          border-radius: 9999px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          text-transform: uppercase;
        }
        .pill-admin-status.ok {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
        }
        .pill-admin-status.pending {
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
        }
        .club-block-header-text {
          position: absolute;
          bottom: 12px;
          left: 14px;
          right: 14px;
          z-index: 2;
        }
        .club-block-title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.4px;
          line-height: 1.25;
          margin: 0 0 3px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .club-block-slug {
          font-size: 10.5px;
          color: #888888;
          font-family: monospace;
          letter-spacing: 0.3px;
        }

        /* Block Body */
        .club-block-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .block-data-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          color: #cccccc;
          line-height: 1.4;
        }
        .block-data-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .block-courts-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0px;
        }
        .courts-box-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #888888;
          text-transform: uppercase;
        }
        .courts-box-chips {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        .court-mini-chip {
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
        }
        .court-mini-chip.padel {
          background: rgba(252, 28, 70, 0.12);
          color: #fc1c46;
          border: 1px solid rgba(252, 28, 70, 0.3);
        }
        .court-mini-chip.futbol {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .court-mini-chip.zero {
          background: rgba(255, 255, 255, 0.05);
          color: #777777;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .block-admin-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 11.5px;
          gap: 8px;
        }
        .block-admin-info {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .block-admin-email {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }
        .block-admin-email.has-email {
          color: #ffffff;
          font-weight: 600;
        }
        .block-admin-email.no-email {
          color: #64748b;
          font-style: italic;
        }
        .admin-extra-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 9999px;
        }
        .btn-block-assign {
          background: transparent;
          border: none;
          color: #fc1c46;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
        }
        .btn-block-assign:hover {
          text-decoration: underline;
        }

        .block-contact-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11.5px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .block-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          text-decoration: none !important;
          transition: color 0.2s;
        }
        .block-contact-link.whatsapp:hover {
          color: #10b981 !important;
        }
        .block-contact-link.phone:hover {
          color: #ffffff !important;
        }
        .block-contact-empty {
          font-size: 11px;
          color: #555555;
        }

        /* Block Footer Actions */
        .club-block-footer {
          padding: 10px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: #070707;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .block-footer-left,
        .block-footer-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-card-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
          color: #ffffff !important;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          padding: 5px 12px;
          cursor: pointer;
          text-decoration: none !important;
          transition: all 0.2s ease;
        }
        .btn-card-action:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .btn-card-action.highlight {
          background: rgba(252, 28, 70, 0.1);
          border-color: rgba(252, 28, 70, 0.35);
          color: #fc1c46 !important;
        }
        .btn-card-action.highlight:hover {
          background: #fc1c46;
          border-color: #fc1c46;
          color: #ffffff !important;
        }
        .btn-card-action.danger {
          padding: 5px 8px;
          border-color: rgba(255, 255, 255, 0.1);
          color: #777777 !important;
        }
        .btn-card-action.danger:hover {
          border-color: #fc1c46;
          background: rgba(252, 28, 70, 0.15);
          color: #fc1c46 !important;
        }

        /* ═══════════════════════════════════════════════════════════
           LISTA MINIMALISTA DE CLUBES
           ═══════════════════════════════════════════════════════════ */
        .clubs-clean-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .clean-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0px;
          gap: 16px;
          transition: border-color 0.2s;
          flex-wrap: wrap;
        }
        .clean-list-item:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .clean-list-col-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 240px;
        }
        .clean-list-thumb {
          width: 44px;
          height: 44px;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          flex-shrink: 0;
        }
        .clean-list-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .clean-list-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        .clean-list-slug {
          font-size: 10.5px;
          color: #777777;
          font-family: monospace;
          margin-top: 2px;
        }
        .clean-list-col-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #cccccc;
          min-width: 200px;
        }
        .clean-list-col-courts {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 130px;
        }
        .courts-count-text {
          font-size: 10px;
          font-weight: 800;
          color: #888888;
          text-transform: uppercase;
        }
        .clean-list-col-admin {
          min-width: 170px;
        }
        .truncate {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .clean-list-col-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Loading & Empty States */
        .loading-state, .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
        .btn-pill-reset {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #fc1c46;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }
        .modal-window {
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
        }
        .modal-window.modal-wide {
          max-width: 960px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background-color: #121212;
        }
        .modal-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #fc1c46;
          display: block;
          margin-bottom: 4px;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }
        .modal-form-body {
          padding: 24px 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Inputs */
        .input-sharp {
          width: 100%;
          background-color: #000000;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0px;
          color: #ffffff;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-sharp:focus {
          border-color: #fc1c46;
        }
        .select-sharp {
          appearance: none;
          cursor: pointer;
        }
        .form-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon svg {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }
        .input-padded {
          padding-left: 36px !important;
        }

        /* Admin Access Card */
        .admin-access-card {
          background: #080808;
          border: 1px solid rgba(252, 28, 70, 0.35);
          border-radius: 0px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }
        .admin-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #ffffff;
        }
        .admin-card-pill {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #fc1c46;
          background: rgba(252, 28, 70, 0.15);
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .admin-card-desc {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }
        .admin-card-desc strong {
          color: #ffffff;
        }
        .admin-fields-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .btn-test-club-panel {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          background: #141414;
          color: #fc1c46 !important;
          border: 1px solid rgba(252, 28, 70, 0.4);
          border-radius: 9999px;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-decoration: none !important;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn-test-club-panel:hover {
          background: rgba(252, 28, 70, 0.15);
          border-color: #fc1c46;
        }
        .additional-admins-box {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .admin-chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 4px;
        }
        .admin-email-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          padding: 3px 10px;
          font-size: 11px;
          color: #ffffff;
        }
        .btn-del-email-tag {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .btn-del-email-tag:hover {
          color: #fc1c46;
        }
        .add-email-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .btn-add-email-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn-add-email-pill:hover {
          background: #242424;
          border-color: #ffffff;
        }

        /* Photos Management Card */
        .photos-management-card {
          background: #080808;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .images-sublabel {
          display: block;
          font-size: 11px;
          color: #888888;
          margin-top: 2px;
        }
        .add-image-url-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .input-url {
          padding-left: 32px !important;
        }
        .add-image-url-row svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .btn-add-url-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn-add-url-pill:hover {
          background: #242424;
          border-color: #fc1c46;
        }
        .images-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          margin-top: 4px;
        }
        .image-card-item {
          position: relative;
          height: 100px;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0px;
          overflow: hidden;
        }
        .image-card-item.is-cover {
          border: 2px solid #fc1c46;
        }
        .image-card-thumb {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        .image-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
        }
        .cover-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #fc1c46;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 9999px;
          letter-spacing: 0.5px;
        }
        .btn-make-cover {
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-make-cover:hover {
          background: #fc1c46;
          border-color: #fc1c46;
        }
        .btn-delete-image {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-delete-image:hover {
          background: #fc1c46;
          border-color: #fc1c46;
        }

        /* Image row */
        .images-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .btn-pill-upload {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a1a1a;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-pill-upload:hover {
          border-color: #fc1c46;
        }
        .image-preview-card {
          position: relative;
          width: 90px;
          height: 60px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }
        .image-preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .btn-remove-img {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          background: #fc1c46;
          color: #ffffff;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Amenities toggles */
        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          background: #000000;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .amenity-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #cccccc;
          cursor: pointer;
        }
        .amenity-toggle input {
          accent-color: #fc1c46;
          cursor: pointer;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Courts modal 2-column layout */
        .modal-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow-y: auto;
          min-height: 480px;
        }
        .courts-list-column {
          padding: 24px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          background-color: #080808;
          display: flex;
          flex-direction: column;
        }
        .new-court-column {
          padding: 24px;
          background-color: #0d0d0d;
        }
        .column-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .courts-scrollable {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .no-courts-notice {
          font-size: 13px;
          color: #666666;
          line-height: 1.5;
          padding: 20px 0;
        }
        .court-item-card {
          background-color: #121212;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0px;
          padding: 14px;
        }
        .court-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .court-type-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .court-type-pill.padel {
          background: rgba(252, 28, 70, 0.15);
          color: #fc1c46;
        }
        .court-type-pill.futbol {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        .court-capacity-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .btn-del-court {
          margin-left: auto;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .court-item-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 2px;
        }
        .court-item-surface {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .court-item-meta {
          font-size: 11px;
          color: #666666;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .new-court-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .modal-two-column {
            grid-template-columns: 1fr;
          }
          .courts-list-column {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
        }

        @media (max-width: 640px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
          .header-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
