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
  rating: number;
  reviewCount: number;
  amenities: AdminClubAmenities;
  images: string[];
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
};

const DEFAULT_AMENITIES: AdminClubAmenities = {
  parking: true,
  buffet: true,
  equipmentRental: true,
  wifi: true,
  showers: true,
  lockerRooms: true,
  grill: false,
  lighting: true,
  covered: true,
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

  // Search & Sport Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'PADEL' | 'FUTBOL'>('ALL');

  // Modal state for Club Editing/Creation
  const [isClubModalOpen, setIsClubModalOpen] = useState<boolean>(false);
  const [editingClub, setEditingClub] = useState<AdminClub | null>(null);
  const [isNewClub, setIsNewClub] = useState<boolean>(false);

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

  // Fetch data from Firestore
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedClubs, fetchedCourts] = await Promise.all([
        getClubsFirestore(),
        getCourtsFirestore(),
      ]);

      const normalizedClubs: AdminClub[] = (fetchedClubs || []).map((c: any) => ({
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
        rating: c.rating || 4.8,
        reviewCount: c.reviewCount || 100,
        amenities: {
          ...DEFAULT_AMENITIES,
          ...(c.amenities || {}),
        },
        images: Array.isArray(c.images) && c.images.length > 0 ? c.images : [
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
        ],
      }));

      const normalizedCourts: AdminCourt[] = (fetchedCourts || []).map((c: any) => ({
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

    return {
      totalClubs,
      totalCourts,
      padelCourts,
      totalFutbolCourts,
      futbol5Courts,
      futbol7Courts,
      futbol11Courts,
    };
  }, [clubs, courts]);

  // Filtered clubs list (Search + Sport only, no modalities)
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesQuery =
        !searchQuery ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.city.toLowerCase().includes(searchQuery.toLowerCase());

      const clubCourts = courts.filter(c => c.clubId === club.id);
      const hasPadel = clubCourts.some(c => c.sportType === 'PADEL');
      const hasFutbol = clubCourts.some(c => c.sportType.startsWith('FUTBOL'));

      let matchesSport = true;
      if (sportFilter === 'PADEL') matchesSport = hasPadel;
      if (sportFilter === 'FUTBOL') matchesSport = hasFutbol;

      return matchesQuery && matchesSport;
    });
  }, [clubs, courts, searchQuery, sportFilter]);

  // Save changes to Firestore
  const handleSaveAllToFirestore = async (updatedClubsList = clubs, updatedCourtsList = courts) => {
    setIsSaving(true);
    try {
      const [clubsOk, courtsOk] = await Promise.all([
        saveClubsFirestore(updatedClubsList),
        saveCourtsFirestore(updatedCourtsList),
      ]);

      if (clubsOk && courtsOk) {
        showNotification('success', 'Base de datos Firestore sincronizada con éxito.');
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
    setEditingClub({ ...club, amenities: { ...club.amenities } });
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
      rating: 4.8,
      reviewCount: 20,
      amenities: { ...DEFAULT_AMENITIES },
      images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'],
    };
    setEditingClub(emptyClub);
    setIsNewClub(true);
    setIsClubModalOpen(true);
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
    const readyClub: AdminClub = {
      ...editingClub,
      slug: cleanSlug,
      name: editingClub.name.trim(),
      address: editingClub.address.trim(),
      phone: editingClub.phone.trim(),
      whatsapp: editingClub.whatsapp.trim(),
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

        <div className="login-screen">
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

              <button type="submit" className="btn-pill-cta" style={{ width: '100%', marginTop: '16px' }}>
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
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: var(--font-sui, 'Space Grotesk', sans-serif);
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
          HEADER POLISHED & CLEAN (No visited purple colors)
          ═══════════════════════════════════════════════════════════ */}
      <header className="admin-header">
        <div className="header-container">
          <div className="header-left">
            <Link href="/" className="brand-link">
              <span className="brand-dot" />
              <span className="brand-title">HAY EQUIPO</span>
              <span className="brand-badge">ADMIN</span>
            </Link>

            <div className="header-sep" />

            <div className="status-indicator">
              <span className="pulse-dot" />
              <span className="status-text">Base de datos activa</span>
              <span className="status-sub">· Mar del Plata</span>
            </div>
          </div>

          <div className="header-right">
            <Link href="/reservar" target="_blank" className="btn-header-ghost">
              <Icons.ExternalLink size={13} color="#ffffff" />
              <span>Ver Web</span>
            </Link>

            <button
              onClick={() => handleSaveAllToFirestore()}
              disabled={isSaving}
              className="btn-header-dark"
            >
              <Icons.Database size={13} color="#10b981" />
              <span>{isSaving ? 'Guardando...' : 'Sincronizar DB'}</span>
            </button>

            <button
              onClick={handleOpenNewClub}
              className="btn-header-primary"
            >
              <Icons.Plus size={14} color="#ffffff" />
              <span>Nuevo Club</span>
            </button>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="btn-header-icon"
            >
              <Icons.Close size={13} color="#94a3b8" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-body">
        {/* Metric Cards Bento Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">TOTAL CLUBES</div>
            <div className="metric-val">{stats.totalClubs}</div>
            <div className="metric-detail">
              <span>Complejos registrados en Mar del Plata</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">TOTAL CANCHAS</div>
            <div className="metric-val">{stats.totalCourts}</div>
            <div className="metric-detail">
              <span className="metric-sub-item crimson">{stats.padelCourts} Pádel</span>
              <span className="metric-divider">·</span>
              <span className="metric-sub-item emerald">{stats.totalFutbolCourts} Fútbol</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">CANCHAS DE PÁDEL</div>
            <div className="metric-val text-crimson">{stats.padelCourts}</div>
            <div className="metric-detail">
              <span>Capacidad: 4 jugadores p/ cancha</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">CANCHAS DE FÚTBOL</div>
            <div className="metric-val text-emerald">{stats.totalFutbolCourts}</div>
            <div className="metric-detail">
              <span>{stats.futbol5Courts} F5 (10p) · {stats.futbol7Courts} F7 (14p) · {stats.futbol11Courts} F11 (22p)</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Bar (No modalities) */}
        <div className="action-bar">
          <div className="search-wrapper">
            <Icons.Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por nombre de club, dirección o barrio..."
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

          {/* Filter Pills: Sport only */}
          <div className="filter-chips">
            <button
              onClick={() => setSportFilter('ALL')}
              className={`filter-chip ${sportFilter === 'ALL' ? 'active' : ''}`}
            >
              TODOS LOS DEPORTES ({stats.totalClubs} CLUBES)
            </button>
            <button
              onClick={() => setSportFilter('PADEL')}
              className={`filter-chip ${sportFilter === 'PADEL' ? 'active' : ''}`}
            >
              PÁDEL ({stats.padelCourts} CANCHAS)
            </button>
            <button
              onClick={() => setSportFilter('FUTBOL')}
              className={`filter-chip ${sportFilter === 'FUTBOL' ? 'active' : ''}`}
            >
              FÚTBOL ({stats.totalFutbolCourts} CANCHAS)
            </button>
          </div>
        </div>

        {/* Clubs Table View (No modalidad column) */}
        <div className="table-container">
          <div className="table-header-meta">
            <span className="results-count">
              MOSTRANDO {filteredClubs.length} DE {clubs.length} CLUBES EN MAR DEL PLATA
            </span>
            <button onClick={fetchData} className="btn-refresh" title="Recargar desde Firebase">
              <Icons.Refresh size={13} />
              <span>RECARGAR</span>
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Cargando datos desde Firestore...</span>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron clubes con los filtros seleccionados.</p>
              <button onClick={() => { setSearchQuery(''); setSportFilter('ALL'); }} className="btn-pill-reset" style={{ marginTop: '14px' }}>
                REINICIAR BÚSQUEDA
              </button>
            </div>
          ) : (
            <table className="clubs-table">
              <thead>
                <tr>
                  <th>CLUB / COMPLEJO</th>
                  <th>DIRECCIÓN Y CIUDAD</th>
                  <th>CANCHAS ACTIVAS</th>
                  <th>CONTACTO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.map(club => {
                  const clubCourts = courts.filter(c => c.clubId === club.id);
                  const padelCount = clubCourts.filter(c => c.sportType === 'PADEL').length;
                  const f5Count = clubCourts.filter(c => c.sportType === 'FUTBOL_5').length;
                  const f7Count = clubCourts.filter(c => c.sportType === 'FUTBOL_7').length;
                  const f11Count = clubCourts.filter(c => c.sportType === 'FUTBOL_11').length;
                  const cleanWhatsApp = club.whatsapp.replace(/[^0-9]/g, '');

                  return (
                    <tr key={club.id} className={!club.active ? 'row-inactive' : ''}>
                      {/* Name & Photo */}
                      <td>
                        <div className="club-cell">
                          <div
                            className="club-thumb"
                            style={{
                              backgroundImage: `url(${club.images[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300'})`,
                            }}
                          />
                          <div>
                            <div className="club-cell-name">{club.name}</div>
                            <div className="club-cell-slug">ID: {club.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td>
                        <div className="address-cell">
                          <div className="address-main">{club.address || 'Sin dirección'}</div>
                          <div className="address-city">{club.city || 'Mar del Plata'}</div>
                        </div>
                      </td>

                      {/* Courts Breakdown */}
                      <td>
                        <div className="courts-breakdown-cell">
                          <div className="total-badge">
                            {clubCourts.length} {clubCourts.length === 1 ? 'CANCHA' : 'CANCHAS'}
                          </div>
                          <div className="courts-chips">
                            {padelCount > 0 && (
                              <span className="court-chip padel">{padelCount} Pádel (4p)</span>
                            )}
                            {f5Count > 0 && (
                              <span className="court-chip futbol">{f5Count} F5 (10p)</span>
                            )}
                            {f7Count > 0 && (
                              <span className="court-chip futbol">{f7Count} F7 (14p)</span>
                            )}
                            {f11Count > 0 && (
                              <span className="court-chip futbol">{f11Count} F11 (22p)</span>
                            )}
                            {clubCourts.length === 0 && (
                              <span className="court-chip zero">Sin canchas asignadas</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div className="contact-cell">
                          {cleanWhatsApp && (
                            <a
                              href={`https://wa.me/${cleanWhatsApp}`}
                              target="_blank"
                              rel="noreferrer"
                              className="contact-link whatsapp"
                              title="Abrir WhatsApp"
                            >
                              <Icons.WhatsApp size={13} color="#10b981" />
                              <span>{club.whatsapp}</span>
                            </a>
                          )}
                          {club.phone && (
                            <div className="contact-link phone">
                              <Icons.Phone size={12} color="#94a3b8" />
                              <span>{club.phone}</span>
                            </div>
                          )}
                          {!cleanWhatsApp && !club.phone && (
                            <span className="text-muted">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleOpenCourtsModal(club)}
                            className="btn-pill-action"
                            title="Gestionar canchas de este club"
                          >
                            <Icons.Pitch size={13} />
                            <span>CANCHAS ({clubCourts.length})</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditClub(club)}
                            className="btn-pill-action secondary"
                            title="Editar datos del club"
                          >
                            <Icons.Edit size={13} />
                            <span>EDITAR</span>
                          </button>

                          <button
                            onClick={() => handleDeleteClub(club.id, club.name)}
                            className="btn-pill-action danger"
                            title="Eliminar club"
                          >
                            <Icons.Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <div className="form-grid-2">
                <div>
                  <label className="form-label">NOMBRE DEL CLUB *</label>
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

              <div className="form-grid-2">
                <div>
                  <label className="form-label">DIRECCIÓN *</label>
                  <input
                    type="text"
                    required
                    value={editingClub.address}
                    onChange={e => setEditingClub({ ...editingClub, address: e.target.value })}
                    placeholder="Ej: Dorrego 333"
                    className="input-sharp"
                  />
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

              <div className="form-grid-2">
                <div>
                  <label className="form-label">TELÉFONO DE LÍNEA / FIJO</label>
                  <input
                    type="text"
                    value={editingClub.phone}
                    onChange={e => setEditingClub({ ...editingClub, phone: e.target.value })}
                    placeholder="(0223) 472-9295"
                    className="input-sharp"
                  />
                </div>

                <div>
                  <label className="form-label">WHATSAPP DE CONTACTO</label>
                  <input
                    type="text"
                    value={editingClub.whatsapp}
                    onChange={e => setEditingClub({ ...editingClub, whatsapp: e.target.value })}
                    placeholder="Ej: +54 9 223 547-0343"
                    className="input-sharp"
                  />
                </div>
              </div>

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
                  rows={3}
                  value={editingClub.description}
                  onChange={e => setEditingClub({ ...editingClub, description: e.target.value })}
                  placeholder="Detalles sobre las instalaciones, vestuarios, ambiente..."
                  className="input-sharp"
                />
              </div>

              {/* Club Images & Firebase Storage */}
              <div>
                <div className="images-label-row">
                  <label className="form-label" style={{ marginBottom: 0 }}>FOTOS DEL CLUB (FIREBASE STORAGE)</label>
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

                <div className="images-preview-row">
                  {editingClub.images.map((imgUrl, i) => (
                    <div key={i} className="image-preview-card" style={{ position: 'relative' }}>
                      <img 
                        src={imgUrl} 
                        alt={i === 0 ? 'Isotipo' : `Foto ${i + 1}`}
                        style={{ objectFit: i === 0 ? 'contain' : 'cover', backgroundColor: '#0c0c0c' }}
                        onError={(e) => {
                          if (i === 0) {
                            e.currentTarget.style.display = 'none';
                          } else {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300';
                          }
                        }} 
                      />
                      <div style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 8, fontWeight: 700, color: i === 0 ? '#fc1c46' : '#ffffff', textTransform: 'uppercase', background: 'rgba(0,0,0,0.7)', padding: '1px 4px', borderRadius: 4 }}>
                        {i === 0 ? 'Isotipo' : `Foto ${i + 1}`}
                      </div>
                      {editingClub.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = editingClub.images.filter((_, idx) => idx !== i);
                            setEditingClub({ ...editingClub, images: filtered });
                          }}
                          className="btn-remove-img"
                        >
                          <Icons.Close size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
        /* Eradicate any browser default purple visited link color */
        a, a:visited, a:active, a:hover {
          text-decoration: none !important;
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

        /* ── Header Clean & Polished ── */
        .admin-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          background-color: #0a0a0a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
        }
        .header-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .brand-link,
        .brand-link:visited,
        .brand-link:hover,
        .brand-link:active {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none !important;
          color: #ffffff !important;
        }
        .brand-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #fc1c46;
          display: inline-block;
        }
        .brand-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #ffffff !important;
        }
        .brand-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          background: rgba(252, 28, 70, 0.15);
          color: #fc1c46 !important;
          border: 1px solid rgba(252, 28, 70, 0.3);
          padding: 2px 7px;
          border-radius: 9999px;
        }
        .header-sep {
          width: 1px;
          height: 18px;
          background-color: rgba(255, 255, 255, 0.12);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #10b981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
        }
        .status-text {
          color: #cccccc;
          font-weight: 500;
        }
        .status-sub {
          color: #666666;
          font-weight: 400;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-header-ghost,
        .btn-header-ghost:visited,
        .btn-header-ghost:active {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          background: transparent;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none !important;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .btn-header-ghost:hover {
          background-color: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff !important;
        }
        .btn-header-dark {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          background: #141414;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .btn-header-dark:hover {
          background: #1f1f1f;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .btn-header-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          background: #fc1c46;
          color: #ffffff !important;
          border: none;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-header-primary:hover {
          opacity: 0.92;
        }
        .btn-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background-color 0.2s;
        }
        .btn-header-icon:hover {
          color: #ffffff;
          border-color: #fc1c46;
          background-color: rgba(252, 28, 70, 0.1);
        }

        /* Body */
        .admin-body {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        /* Metrics Bento Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
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

        /* Table Container: Sharp 90° */
        .table-container {
          background-color: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          overflow: hidden;
        }
        .table-header-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
        }
        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .btn-refresh:hover {
          color: #ffffff;
        }

        .clubs-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .clubs-table th {
          background-color: #121212;
          padding: 12px 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .clubs-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          vertical-align: middle;
        }
        .clubs-table tr:hover td {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .row-inactive td {
          opacity: 0.5;
        }

        /* Table Cells */
        .club-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .club-thumb {
          width: 44px;
          height: 44px;
          border-radius: 0px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: #0c0c0c;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }
        .club-cell-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
        }
        .club-cell-slug {
          font-size: 11px;
          color: #666666;
          margin-top: 2px;
        }
        .address-cell {
          font-size: 13px;
        }
        .address-main {
          color: #ffffff;
        }
        .address-city {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* Courts Breakdown Cell */
        .courts-breakdown-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .total-badge {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }
        .courts-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .court-chip {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .court-chip.padel {
          background: rgba(252, 28, 70, 0.12);
          color: #fc1c46;
          border: 1px solid rgba(252, 28, 70, 0.3);
        }
        .court-chip.futbol {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .court-chip.zero {
          background: rgba(255, 255, 255, 0.05);
          color: #666666;
        }

        /* Contact Cell */
        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          text-decoration: none !important;
          color: #ffffff !important;
        }
        .contact-link.whatsapp:hover {
          color: #10b981 !important;
        }
        .contact-link.phone {
          color: #94a3b8 !important;
        }
        .text-muted {
          font-size: 12px;
          color: #666666;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-pill-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-pill-action:hover {
          background: #242424;
          border-color: #ffffff;
        }
        .btn-pill-action.secondary {
          background: transparent;
          color: #94a3b8;
        }
        .btn-pill-action.secondary:hover {
          color: #ffffff;
        }
        .btn-pill-action.danger {
          background: transparent;
          color: #fc1c46;
          border-color: rgba(252, 28, 70, 0.3);
          padding: 6px 8px;
        }
        .btn-pill-action.danger:hover {
          background: rgba(252, 28, 70, 0.15);
          border-color: #fc1c46;
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

        /* Image row */
        .images-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .btn-pill-upload {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a1a1a;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 4px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .btn-pill-upload:hover {
          border-color: #fc1c46;
        }
        .images-preview-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 0;
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
