import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { colors } from './src/components/theme';
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

type TabType = 'HOME' | 'SEARCH' | 'MATCHES' | 'BOOKINGS' | 'PROFILE';

function MainAppContent() {
  const { user, userProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedSlotForCheckout, setSelectedSlotForCheckout] = useState<TimeSlot | null>(null);
  const [activeSplitBooking, setActiveSplitBooking] = useState<Booking | null>(null);
  const [searchInitialSport, setSearchInitialSport] = useState<string>('PADEL');

  const navigateToSearch = (sport = 'PADEL') => {
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
            onNavigateFixedSlots={() => setActiveTab('MATCHES')}
            onNavigateProfile={() => setActiveTab('PROFILE')}
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
      case 'MATCHES':
        return <FixedSlotScreen />;
      case 'BOOKINGS':
        return (
          <MyBookingsScreen
            onNavigateSplit={navigateToSplit}
            onNavigateNewBooking={() => setActiveTab('SEARCH')}
          />
        );
      case 'PROFILE':
        return <ProfileScreen onNavigateLogin={() => setShowAuthModal(true)} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom 5-Tab Navigation Bar */}
      {!selectedSlotForCheckout && !activeSplitBooking && !selectedClubId && !showAuthModal && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('HOME')}>
            <Text style={[styles.navIcon, activeTab === 'HOME' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('SEARCH')}>
            <Text style={[styles.navIcon, activeTab === 'SEARCH' && styles.navIconActive]}>🔍</Text>
            <Text style={[styles.navLabel, activeTab === 'SEARCH' && styles.navLabelActive]}>Buscar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('MATCHES')}>
            <Text style={[styles.navIcon, activeTab === 'MATCHES' && styles.navIconActive]}>⚡</Text>
            <Text style={[styles.navLabel, activeTab === 'MATCHES' && styles.navLabelActive]}>Fijos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('BOOKINGS')}>
            <Text style={[styles.navIcon, activeTab === 'BOOKINGS' && styles.navIconActive]}>📅</Text>
            <Text style={[styles.navLabel, activeTab === 'BOOKINGS' && styles.navLabelActive]}>Reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab('PROFILE')}>
            <Text style={[styles.navIcon, activeTab === 'PROFILE' && styles.navIconActive]}>👤</Text>
            <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenContainer: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  navTab: {
    alignItems: 'center',
    flex: 1
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.5
  },
  navIconActive: {
    opacity: 1
  },
  navLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '800'
  }
});
