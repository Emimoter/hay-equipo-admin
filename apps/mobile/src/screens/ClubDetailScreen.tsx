import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
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
  onNavigateCheckout
}) => {
  const [club, setClub] = useState<(Club & { courts: Court[] }) | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

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
    const lat = club.latitude;
    const lng = club.longitude;
    const label = encodeURIComponent(club.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url);
  };

  if (!club) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 400 }]}>
        <ActivityIndicator size="large" color="#fc1c46" />
        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 12, fontFamily: fonts.medium }}>Cargando club...</Text>
        <TouchableOpacity style={{ marginTop: 24, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#1f2430', borderRadius: 12 }} onPress={onNavigateBack}>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Club Cover Photo */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: club.images[0] }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#fc1c46"
              strokeWidth={2}
              fill="rgba(252,28,70,0.2)"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Title & Rating */}
        <View style={styles.headerRow}>
          <Text style={[typography.titleLarge, { fontFamily: fonts.headingBold }]}>{club.name}</Text>
          <View style={styles.ratingBadge}>
            <StarIcon size={12} fill="#FACC15" color="#FACC15" />
            <Text style={styles.ratingText}>{club.rating} ({club.reviewCount})</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <MapPinIcon size={13} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={styles.addressText}>{club.address}, {club.city}</Text>
        </View>

        {/* Action Buttons: Cómo llegar, WhatsApp */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps}>
            <MapPinIcon size={14} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Cómo llegar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => Linking.openURL(`https://wa.me/${club.whatsapp.replace(/\D/g, '')}`)}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.actionButtonSecondaryText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Amenities */}
        <Text style={styles.sectionTitle}>Servicios e Instalaciones</Text>
        <View style={styles.amenitiesGrid}>
          {Boolean(club.amenities?.parking) ? (
            <View style={styles.amenityItem}>
              <ParkingIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Estacionamiento</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.showers) ? (
            <View style={styles.amenityItem}>
              <RoofIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Vestuarios</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.buffet) ? (
            <View style={styles.amenityItem}>
              <CoffeeIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Buffet / Bar</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.covered) ? (
            <View style={styles.amenityItem}>
              <RoofIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Canchas Techadas</Text>
            </View>
          ) : null}
          {Boolean(club.amenities?.equipmentRental) ? (
            <View style={styles.amenityItem}>
              <PadelIcon size={15} color="#fc1c46" strokeWidth={2} />
              <Text style={styles.amenityText}>Alquiler de paletas</Text>
            </View>
          ) : null}
        </View>

        {/* Court Selection Tabs */}
        <Text style={styles.sectionTitle}>Elegí una Cancha</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtsScroll}>
          {club.courts.map(c => {
            const isSelected = selectedCourtId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.courtTab, isSelected && styles.courtTabActive]}
                onPress={() => setSelectedCourtId(c.id)}
              >
                <Text style={[styles.courtTabName, isSelected && styles.courtTabNameActive]}>{c.name}</Text>
                <Text style={styles.courtTabSurface}>{c.surface}</Text>
                <Text style={styles.courtTabBadge}>{c.isCovered ? 'Techada' : 'Outdoor'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Availability Grid */}
        <Text style={styles.sectionTitle}>Disponibilidad Real para Hoy</Text>
        <View style={styles.slotsGrid}>
          {slots.length === 0 ? (
            <Text style={styles.noSlotsText}>No hay turnos libres para esta cancha hoy.</Text>
          ) : (
            slots.map((slot, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.slotButton}
                onPress={() => onNavigateCheckout(slot)}
              >
                <Text style={styles.slotButtonTime}>{slot.startTime}</Text>
                <Text style={styles.slotButtonPrice}>{formatCurrency(slot.price)}</Text>
                <Text style={styles.slotButtonStatus}>Disponible</Text>
              </TouchableOpacity>
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
    backgroundColor: colors.background
  },
  imageContainer: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: 220
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    backgroundColor: colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  backButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    backgroundColor: colors.overlay,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  ratingBadge: {
    backgroundColor: '#3B371E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  ratingText: {
    color: '#FACC15',
    fontWeight: '700',
    fontSize: 13
  },
  addressText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4
  },
  actionButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonSecondaryText: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontSize: 14
  },
  sectionTitle: {
    ...typography.titleMedium,
    marginTop: 10,
    marginBottom: 12
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  amenityIcon: {
    fontSize: 16,
    marginRight: 6
  },
  amenityText: {
    color: colors.textSecondary,
    fontSize: 12
  },
  courtsScroll: {
    marginBottom: 20
  },
  courtTab: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 170
  },
  courtTabActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(252, 28, 70, 0.12)'
  },
  courtTabName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  courtTabNameActive: {
    color: colors.primary
  },
  courtTabSurface: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 6
  },
  courtTabBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  slotButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
    borderRadius: 12,
    padding: 12,
    width: '30%',
    alignItems: 'center'
  },
  slotButtonTime: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800'
  },
  slotButtonPrice: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  slotButtonStatus: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2
  },
  noSlotsText: {
    color: colors.textMuted,
    fontSize: 13,
    padding: 12
  }
});
