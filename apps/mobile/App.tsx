import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { colors, fonts } from './src/components/theme';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchMapScreen } from './src/screens/SearchMapScreen';
import { ClubDetailScreen } from './src/screens/ClubDetailScreen';
import { BookingCheckoutScreen } from './src/screens/BookingCheckoutScreen';
import { SplitInvitationScreen } from './src/screens/SplitInvitationScreen';
import { FixedSlotScreen } from './src/screens/FixedSlotScreen';
import { MyBookingsScreen } from './src/screens/MyBookingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TimeSlot, Booking } from '@hay-equipo/contracts';
import { HomeIcon, SearchIcon, CalendarIcon, WalletIcon, ProfileIcon } from './src/components/NavIcons';
import { requestLocationPermissions, getRealUserLocation } from './src/services/location';

type TabType = 'HOME' | 'SEARCH' | 'BOOKINGS' | 'PAYMENTS' | 'PROFILE';

function MainAppContent() {
  const { user, userProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedSlotForCheckout, setSelectedSlotForCheckout] = useState<TimeSlot | null>(null);
  const [activeSplitBooking, setActiveSplitBooking] = useState<Booking | null>(null);
  const [searchInitialSport, setSearchInitialSport] = useState<string>('PADEL');

  useEffect(() => {
    // Proactively request GPS location permissions upon opening the app
    const initializeLocation = async () => {
      await requestLocationPermissions();
      await getRealUserLocation(true);
    };
    initializeLocation();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setSelectedClubId(null);
    setSelectedSlotForCheckout(null);
    setActiveSplitBooking(null);
    setActiveTab(tab);
  };

  const navigateToSearch = (sport = 'PADEL') => {
    setSelectedClubId(null);
    setSelectedSlotForCheckout(null);
    setSearchInitialSport(sport);
    setActiveTab('SEARCH');
  };

  const navigateToClub = (clubId: string) => {
    setSelectedClubId(clubId);
  };

  const navigateToCheckout = (slot: TimeSlot) => {
    setSelectedSlotForCheckout(slot);
  };

  const navigateToSplit = (booking: Booking) => {
    setSelectedSlotForCheckout(null);
    setActiveSplitBooking(booking);
  };

  const navigateToBookingSuccess = (booking: Booking) => {
    setSelectedSlotForCheckout(null);
    setSelectedClubId(null);
    setActiveTab('BOOKINGS');
  };

  if (showAuthModal) {
    return <AuthScreen onSuccess={() => setShowAuthModal(false)} />;
  }

  // Render Modal Views or Active Tab
  const renderScreen = () => {
    if (activeSplitBooking) {
      return (
        <SplitInvitationScreen
          booking={activeSplitBooking}
          onNavigateHome={() => {
            setActiveSplitBooking(null);
            setActiveTab('HOME');
          }}
          onNavigateMyBookings={() => {
            setActiveSplitBooking(null);
            setActiveTab('BOOKINGS');
          }}
        />
      );
    }

    if (selectedSlotForCheckout) {
      return (
        <BookingCheckoutScreen
          slot={selectedSlotForCheckout}
          onNavigateBack={() => setSelectedSlotForCheckout(null)}
          onNavigateSuccess={navigateToBookingSuccess}
          onNavigateSplit={navigateToSplit}
        />
      );
    }

    if (selectedClubId) {
      return (
        <ClubDetailScreen
          clubId={selectedClubId}
          onNavigateBack={() => setSelectedClubId(null)}
          onNavigateCheckout={navigateToCheckout}
        />
      );
    }

    switch (activeTab) {
      case 'HOME':
        return (
          <HomeScreen
            onNavigateSearch={navigateToSearch}
            onNavigateClub={navigateToClub}
            onNavigateCheckout={navigateToCheckout}
            onNavigateFixedSlots={() => handleTabChange('PAYMENTS')}
            onNavigateProfile={() => handleTabChange('PROFILE')}
          />
        );
      case 'SEARCH':
        return (
          <SearchMapScreen
            initialSport={searchInitialSport}
            onNavigateCheckout={navigateToCheckout}
            onNavigateClub={navigateToClub}
          />
        );
      case 'BOOKINGS':
        return (
          <MyBookingsScreen
            onNavigateSplit={navigateToSplit}
            onNavigateNewBooking={() => handleTabChange('SEARCH')}
          />
        );
      case 'PAYMENTS':
        return <FixedSlotScreen />;
      case 'PROFILE':
        return <ProfileScreen onNavigateLogin={() => setShowAuthModal(true)} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07080a" />
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* ────────────────────────────────────────────────────────────
          FLOATING DOCK BOTTOM NAVIGATION (Exact Mockup Reference)
          ──────────────────────────────────────────────────────────── */}
      {!selectedSlotForCheckout && !activeSplitBooking && !showAuthModal && (
        <View style={styles.floatingDockContainer}>
          <View style={styles.floatingDock}>

            {/* TAB 1: INICIO */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navTab, activeTab === 'HOME' && styles.navTabActive]}
              onPress={() => handleTabChange('HOME')}
            >
              <HomeIcon color={activeTab === 'HOME' ? '#fc1c46' : '#6b7280'} size={20} />
              <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>Inicio</Text>
              {activeTab === 'HOME' && <View style={styles.activeDot} />}
            </TouchableOpacity>

            {/* TAB 2: EXPLORAR / SEARCH */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navTab, activeTab === 'SEARCH' && styles.navTabActive]}
              onPress={() => handleTabChange('SEARCH')}
            >
              <SearchIcon color={activeTab === 'SEARCH' ? '#fc1c46' : '#6b7280'} size={20} />
              <Text style={[styles.navLabel, activeTab === 'SEARCH' && styles.navLabelActive]}>Explorar</Text>
              {activeTab === 'SEARCH' && <View style={styles.activeDot} />}
            </TouchableOpacity>

            {/* TAB 3: RESERVAS */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navTab, activeTab === 'BOOKINGS' && styles.navTabActive]}
              onPress={() => handleTabChange('BOOKINGS')}
            >
              <CalendarIcon color={activeTab === 'BOOKINGS' ? '#fc1c46' : '#6b7280'} size={20} />
              <Text style={[styles.navLabel, activeTab === 'BOOKINGS' && styles.navLabelActive]}>Reservas</Text>
              {activeTab === 'BOOKINGS' && <View style={styles.activeDot} />}
            </TouchableOpacity>

            {/* TAB 4: PAGOS */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navTab, activeTab === 'PAYMENTS' && styles.navTabActive]}
              onPress={() => handleTabChange('PAYMENTS')}
            >
              <WalletIcon color={activeTab === 'PAYMENTS' ? '#fc1c46' : '#6b7280'} size={20} />
              <Text style={[styles.navLabel, activeTab === 'PAYMENTS' && styles.navLabelActive]}>Pagos</Text>
              {activeTab === 'PAYMENTS' && <View style={styles.activeDot} />}
            </TouchableOpacity>

            {/* TAB 5: PERFIL */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navTab, activeTab === 'PROFILE' && styles.navTabActive]}
              onPress={() => handleTabChange('PROFILE')}
            >
              <ProfileIcon color={activeTab === 'PROFILE' ? '#fc1c46' : '#6b7280'} size={20} />
              <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>Perfil</Text>
              {activeTab === 'PROFILE' && <View style={styles.activeDot} />}
            </TouchableOpacity>

          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07080a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fc1c46" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080a',
  },
  screenContainer: {
    flex: 1,
  },
  floatingDockContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 14,
    right: 14,
    zIndex: 99,
  },
  floatingDock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 20, 26, 0.94)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 16,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 16,
    minHeight: 52,
  },
  navTabActive: {
    backgroundColor: 'rgba(252, 28, 70, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.3)',
  },
  navLabel: {
    fontFamily: fonts.medium,
    color: '#6b7280',
    fontSize: 10.5,
    marginTop: 3,
  },
  navLabelActive: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fc1c46',
    marginTop: 2,
    shadowColor: '#fc1c46',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
});
