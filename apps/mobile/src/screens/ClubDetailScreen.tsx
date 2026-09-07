import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, fonts, formatCurrency } from '../components/theme';
import {
  MapPinIcon,
  StarIcon,
  ParkingIcon,
  RoofIcon,
  CoffeeIcon,
  PadelIcon,
  ClockIcon,
} from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';
import { mobileApi } from '../services/api';
import { Club, Court, TimeSlot } from '@hay-equipo/contracts';

interface ClubDetailScreenProps {
  clubId: string;
  onNavigateBack: () => void;
  onNavigateCheckout: (slot: TimeSlot) => void;
}

export const ClubDetailScreen: React.FC<ClubDetailScreenProps> = ({
  clubId,
  onNavigateBack,
  onNavigateCheckout,
}) => {
  const [club, setClub] = useState<(Club & { courts: Court[] }) | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  useEffect(() => {
    loadClub();
  }, [clubId]);

  useEffect(() => {
    if (selectedCourtId) {
      loadSlots();
    }
  }, [selectedCourtId, selectedDate]);

  const loadClub = async () => {
    const data = await mobileApi.getClubDetails(clubId);
    if (data) {
      setClub(data);
      if (data.courts.length > 0) setSelectedCourtId(data.courts[0].id);
    }
  };

  const loadSlots = async () => {
    const data = await mobileApi.searchAvailability({ date: selectedDate });
    setSlots(data.filter(s => s.courtId === selectedCourtId));
  };

  const handleOpenMaps = () => {
    if (!club) return;
    triggerHaptic('light');
    const lat = club.latitude;
    const lng = club.longitude;
    const label = encodeURIComponent(club.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url);
  };

  const handleCourtSelect = (courtId: string) => {
    triggerHaptic('selection');
    setSelectedCourtId(courtId);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    triggerHaptic('medium');
    onNavigateCheckout(slot);
  };

  if (!club) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 400 }]}>
        <ActivityIndicator size="large" color="#fc1c46" />
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 14, fontFamily: fonts.medium }}>Cargando complejo...</Text>
        <TouchableOpacity
          style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 22, backgroundColor: '#0b0e14', borderRadius: 14 }}
          onPress={() => {
            triggerHaptic('light');
            onNavigateBack();
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 13, fontFamily: fonts.bold }}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      {/* ═══════════════════════════════════════════════════════
          CINEMATIC HERO HEADER
          ═══════════════════════════════════════════════════════ */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: club.images[0] }} style={styles.image} />
        <View style={styles.imageOverlay} />
        
        {/* Top Controls: Back & Favorite */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            triggerHaptic('light');
            onNavigateBack();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => {
            triggerHaptic('medium');
            setIsFavorited(!isFavorited);
          }}
          activeOpacity={0.8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#fc1c46"
              strokeWidth={2}
              fill={isFavorited ? '#fc1c46' : 'rgba(252,28,70,0.25)'}
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Title & Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.clubHeading}>{club.name}</Text>
          <View style={styles.ratingBadge}>
            <StarIcon size={12} fill="#FACC15" color="#FACC15" />
            <Text style={styles.ratingText}>{club.rating} ({club.reviewCount})</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 }}>
          <MapPinIcon size={13} color="#64748b" strokeWidth={1.8} />
          <Text style={styles.addressText}>{club.address}, {club.city}</Text>
        </View>

        {/* Action Buttons: Cómo llegar, WhatsApp */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps} activeOpacity={0.85}>
            <MapPinIcon size={14} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Cómo llegar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => {
              triggerHaptic('light');
              Linking.openURL(`https://wa.me/${club.whatsapp.replace(/\D/g, '')}`);
            }}
            activeOpacity={0.85}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.actionButtonSecondaryText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Amenities */}
        <Text style={styles.sectionTitle}>Servicios e Instalaciones</Text>
        <View style={styles.amenitiesGrid}>
          {Boolean(club.amenities?.parking) ? (
            <View style={styles.amenityItem}>
              <ParkingIcon size={14} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Estacionamiento</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.showers) ? (
            <View style={styles.amenityItem}>
              <RoofIcon size={14} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Vestuarios</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.buffet) ? (
            <View style={styles.amenityItem}>
              <CoffeeIcon size={14} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Buffet / Bar</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.covered) ? (
            <View style={styles.amenityItem}>
              <RoofIcon size={14} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Canchas Techadas</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.equipmentRental) ? (
            <View style={styles.amenityItem}>
              <PadelIcon size={14} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Alquiler de paletas</Text>
            </View>
          ) : null}
        </View>

        {/* Court Selection Tabs (Double Bezel Pills) */}
        <Text style={styles.sectionTitle}>Elegí una Cancha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtsScroll} contentContainerStyle={{ paddingRight: 16 }}>
          {club.courts.map(c => {
            const isSelected = selectedCourtId === c.id;
            return (
              <DoubleBezelCard
                key={c.id}
                variant="black"
                style={[styles.courtCardOuter, isSelected && styles.courtCardOuterActive]}
                innerStyle={[styles.courtCardInner, isSelected && styles.courtCardInnerActive]}
                onPress={() => handleCourtSelect(c.id)}
              >
                <Text style={[styles.courtTabName, isSelected && styles.courtTabNameActive]}>{c.name}</Text>
                <Text style={styles.courtTabSurface}>{c.surface}</Text>
                <View style={styles.courtBadgeContainer}>
                  <Text style={styles.courtTabBadge}>{c.isCovered ? 'Techada' : 'Outdoor'}</Text>
                </View>
              </DoubleBezelCard>
            );
          })}
        </ScrollView>

        {/* Availability Grid */}
        <View style={styles.availabilityHeader}>
          <Text style={styles.sectionTitle}>Disponibilidad Real para Hoy</Text>
          <View style={styles.liveIndicatorPill}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>EN VIVO</Text>
          </View>
        </View>

        <View style={styles.slotsGrid}>
          {slots.length === 0 ? (
            <DoubleBezelCard variant="black" style={{ width: '100%' }} innerStyle={styles.emptySlotsCard}>
              <Text style={styles.noSlotsText}>No hay turnos libres para esta cancha hoy.</Text>
            </DoubleBezelCard>
          ) : (
            slots.map((slot, idx) => (
              <DoubleBezelCard
                key={idx}
                variant="black"
                style={styles.slotButtonOuter}
                innerStyle={styles.slotButtonInner}
                onPress={() => handleSlotSelect(slot)}
                glow
              >
                <View style={styles.slotTimeRow}>
                  <ClockIcon size={12} color="#fc1c46" strokeWidth={2.2} />
                  <Text style={styles.slotButtonTime}>{slot.startTime}</Text>
                </View>
                <Text style={styles.slotButtonPrice}>{formatCurrency(slot.price)}</Text>
                <View style={styles.slotAvailablePill}>
                  <Text style={styles.slotButtonStatus}>Reservar</Text>
                </View>
              </DoubleBezelCard>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 20, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    backgroundColor: 'rgba(11, 14, 20, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 16,
    right: 16,
    backgroundColor: 'rgba(11, 14, 20, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clubHeading: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 22,
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 9999,
  },
  ratingText: {
    color: '#FACC15',
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  addressText: {
    fontFamily: fonts.medium,
    color: '#64748b',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#fc1c46',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13.5,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionButtonSecondaryText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13.5,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#0f172a',
    letterSpacing: -0.3,
    marginTop: 8,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0b0e14',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.2)',
  },
  amenityText: {
    fontFamily: fonts.medium,
    color: '#ffffff',
    fontSize: 12,
  },
  courtsScroll: {
    marginBottom: 24,
  },
  courtCardOuter: {
    width: 165,
    marginRight: 10,
  },
  courtCardOuterActive: {
    borderColor: '#fc1c46',
  },
  courtCardInner: {
    padding: 14,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  courtCardInnerActive: {
    backgroundColor: '#171b26',
    borderColor: '#fc1c46',
  },
  courtTabName: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 3,
  },
  courtTabNameActive: {
    color: '#fc1c46',
  },
  courtTabSurface: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11.5,
    marginBottom: 8,
  },
  courtBadgeContainer: {
    alignSelf: 'flex-start',
  },
  courtTabBadge: {
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    color: '#fc1c46',
    fontFamily: fonts.bold,
    fontSize: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 28, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  liveIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fc1c46',
  },
  liveIndicatorText: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotButtonOuter: {
    width: '31%',
  },
  slotButtonInner: {
    padding: 12,
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    alignItems: 'center',
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  slotButtonTime: {
    fontFamily: fonts.headingBold,
    color: '#fc1c46',
    fontSize: 15,
  },
  slotButtonPrice: {
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 6,
  },
  slotAvailablePill: {
    backgroundColor: '#fc1c46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotButtonStatus: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 10,
  },
  emptySlotsCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0b0e14',
  },
  noSlotsText: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 13,
  },
});
