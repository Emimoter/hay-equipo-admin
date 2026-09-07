import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { colors, fonts, formatCurrency } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import {
  StarIcon,
  UsersIcon,
  PadelIcon,
  ShieldCheckIcon,
  WalletIcon,
  CloseIcon,
  FootballIcon,
} from '../components/AppIcons';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { triggerHaptic } from '../services/haptics';

interface ProfileScreenProps {
  onNavigateLogin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateLogin }) => {
  const { user, userProfile, logout, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const handleLogout = () => {
    triggerHaptic('warning');
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que querés salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            await logout();
            if (onNavigateLogin) onNavigateLogin();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    triggerHaptic('error');
    Alert.alert(
      '⚠️ Eliminar Cuenta Definitivamente',
      'Esta acción es irreversible. Se eliminarán permanentemente tus datos de perfil, historial de reservas, saldo en billetera y preferencias de acuerdo a las normativas de privacidad.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar mi cuenta',
          style: 'destructive',
          onPress: () => {
            // Second confirmation step for maximum safety
            Alert.alert(
              'Confirmación Final',
              '¿Realmente deseás borrar todos tus datos de Hay Equipo?',
              [
                { text: 'Volver', style: 'cancel' },
                {
                  text: 'Borrar Todo',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    triggerHaptic('heavy');
                    const res = await deleteAccount();
                    setIsDeleting(false);
                    if (res.success) {
                      Alert.alert('Cuenta Eliminada', 'Tu cuenta y datos han sido suprimidos con éxito.');
                      if (onNavigateLogin) onNavigateLogin();
                    } else {
                      Alert.alert('Aviso de Seguridad', res.error || 'No se pudo eliminar la cuenta. Por favor iniciá sesión nuevamente.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Emiliano Martínez';
  const email = userProfile?.email || user?.email || 'emiliano@hayequipo.com.ar';
  const photoURL = userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const phone = userProfile?.phone || '+54 9 11 5555-0001';
  const matches = userProfile?.matchesPlayed || 24;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════
            TOP IDENTITY HERO (CANVAS BLANCO + DARK PASSPORT)
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            <View style={styles.googleBadge}>
              <ShieldCheckIcon size={13} color="#ffffff" strokeWidth={2.4} />
            </View>
          </View>

          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userPhone}>{phone} · {email}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.levelBadge}>
              <PadelIcon size={12} color="#fc1c46" strokeWidth={2.2} />
              <Text style={styles.levelBadgeText}>PÁDEL 5TA</Text>
            </View>
            <View style={[styles.levelBadge, styles.levelBadgeSecondary]}>
              <FootballIcon size={12} color="#94a3b8" strokeWidth={2} />
              <Text style={[styles.levelBadgeText, { color: '#cbd5e1' }]}>FÚTBOL 7</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            STATS BENTO GRID (BLACK CARDS WITH RED ACCENTS)
            ═══════════════════════════════════════════════════════ */}
        <View style={styles.statsRow}>
          <DoubleBezelCard variant="black" style={styles.statCardOuter} innerStyle={styles.statCardInner}>
            <Text style={styles.statNumber}>{matches}</Text>
            <Text style={styles.statLabel}>Partidos jugados</Text>
          </DoubleBezelCard>
          <DoubleBezelCard variant="black" style={styles.statCardOuter} innerStyle={styles.statCardInner}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Turno fijo activo</Text>
          </DoubleBezelCard>
          <DoubleBezelCard variant="black" style={styles.statCardOuter} innerStyle={styles.statCardInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.statNumber}>4.9</Text>
              <StarIcon size={13} fill="#FACC15" color="#FACC15" />
            </View>
            <Text style={styles.statLabel}>Rating fair play</Text>
          </DoubleBezelCard>
        </View>

        {/* ═══════════════════════════════════════════════════════
            DIRECT MERCADO PAGO BADGE (ZERO IN-APP WALLET CUSTODY)
            ═══════════════════════════════════════════════════════ */}
        <DoubleBezelCard variant="red" style={styles.walletOuter} innerStyle={styles.walletInner} glow>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <ShieldCheckIcon size={15} color="#ffffff" strokeWidth={2.2} />
              <Text style={styles.walletLabel}>Pagos 100% Directos</Text>
            </View>
            <Text style={styles.walletAmount}>Mercado Pago</Text>
            <Text style={styles.walletSub}>Sin retención de dinero en la app · Directo al club</Text>
          </View>
          <TouchableOpacity
            style={styles.walletBtn}
            onPress={() => {
              triggerHaptic('light');
              Alert.alert(
                'Pagos Seguros y Directos',
                'Todas las reservas y pagos divididos se abonan directamente mediante Mercado Pago. Hay Equipo no retiene saldos ni comisiones ocultas.'
              );
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.walletBtnText}>Ver Info</Text>
          </TouchableOpacity>
        </DoubleBezelCard>

        {/* ═══════════════════════════════════════════════════════
            SECTION: ACTIVIDAD Y GRUPOS
            ═══════════════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Actividad y Grupos</Text>
        <DoubleBezelCard variant="black" style={styles.menuOuter} innerStyle={styles.menuInner}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Mis Grupos Deportivos', '• Pádel Jueves 21:00 hs (4 integrantes)\n• Fútbol 7 Miércoles 20:00 hs (14 integrantes)');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <UsersIcon size={16} color="#fc1c46" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Mis Grupos</Text>
              <Text style={styles.menuSubText}>Pádel Jueves, Fútbol Miércoles</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Clubes Favoritos', '• Arena Pádel Palermo\n• Club 360 Pádel\n• Jara Fútbol Club');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="#fc1c46"
                  strokeWidth={2}
                  fill="rgba(252,28,70,0.2)"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Clubes Favoritos</Text>
              <Text style={styles.menuSubText}>Acceso rápido a disponibilidad</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Notificaciones Push', 'Recordatorios automáticos activos:\n• 24 horas antes del partido\n• 2 horas antes para confirmación de quórum');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Recordatorios de Partido</Text>
              <Text style={styles.menuSubText}>Notificaciones activadas (24h y 2h)</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </DoubleBezelCard>

        {/* ═══════════════════════════════════════════════════════
            SECTION: MEDIOS DE PAGO Y LEGALES (GOOGLE PLAY COMPLIANCE)
            ═══════════════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Medios de Pago y Legal</Text>
        <DoubleBezelCard variant="black" style={styles.menuOuter} innerStyle={styles.menuInner}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              triggerHaptic('light');
              Alert.alert('Mercado Pago', 'Tu cuenta está conectada con Checkout Pro para pagos de reservas y cobros directos.');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="3" stroke="#fc1c46" strokeWidth={2} />
                <Line x1="2" y1="10" x2="22" y2="10" stroke="#fc1c46" strokeWidth={1.8} />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Mercado Pago</Text>
              <Text style={styles.menuSubText}>Checkout Pro vinculado</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              triggerHaptic('light');
              setShowPrivacyModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <ShieldCheckIcon size={16} color="#fc1c46" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Política de Privacidad</Text>
              <Text style={styles.menuSubText}>Tratamiento de datos personales y ubicación</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              triggerHaptic('light');
              setShowTermsModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBox}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Polyline points="14 2 14 8 20 8" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="16" y1="13" x2="8" y2="13" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="16" y1="17" x2="8" y2="17" stroke="#fc1c46" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Términos y Condiciones</Text>
              <Text style={styles.menuSubText}>Normas del servicio y cancelaciones</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </DoubleBezelCard>

        {/* ═══════════════════════════════════════════════════════
            SECTION: CUENTA Y SEGURIDAD (ACCOUNT DELETION)
            ═══════════════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Cuenta y Seguridad</Text>
        <DoubleBezelCard variant="black" style={styles.menuOuter} innerStyle={styles.menuInner}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Polyline points="16 17 21 12 16 7" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="21" y1="12" x2="9" y2="12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { fontFamily: fonts.bold }]}>Cerrar Sesión</Text>
              <Text style={styles.menuSubText}>Salir de tu cuenta en este dispositivo</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Polyline points="3 6 5 6 21 6" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="10" y1="11" x2="10" y2="17" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Line x1="14" y1="11" x2="14" y2="17" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: '#ef4444', fontFamily: fonts.bold }]}>
                {isDeleting ? 'Eliminando datos...' : 'Eliminar mi Cuenta'}
              </Text>
              <Text style={[styles.menuSubText, { color: 'rgba(239, 68, 68, 0.7)' }]}>
                Supresión definitiva de datos según Google Play
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={[styles.menuArrow, { color: '#ef4444' }]}>›</Text>
            )}
          </TouchableOpacity>
        </DoubleBezelCard>

        {/* Footer Version */}
        <View style={styles.footerBox}>
          <Text style={styles.versionText}>Hay Equipo v1.0.0 (Build 1)</Text>
          <Text style={styles.copyrightText}>Plataforma de Reservas y Gestión Deportiva</Text>
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════
          MODAL: POLÍTICA DE PRIVACIDAD
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Política de Privacidad</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              style={styles.modalCloseBtn}
            >
              <CloseIcon size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>1. Información que recopilamos</Text>
            <Text style={styles.modalParagraph}>
              Hay Equipo recopila tu nombre, correo electrónico y número de teléfono para gestionar tus reservas deportivas y la división de pagos (split payments) con tus compañeros de equipo.
            </Text>

            <Text style={styles.modalSectionTitle}>2. Uso de tu Ubicación</Text>
            <Text style={styles.modalParagraph}>
              Solicitamos acceso a tu ubicación únicamente mientras utilizás la aplicación para mostrarte los clubes y canchas más cercanos en el mapa interactivo. No almacenamos tu historial de ubicación de forma continua ni lo compartimos con terceros con fines publicitarios.
            </Text>

            <Text style={styles.modalSectionTitle}>3. Procesamiento de Pagos</Text>
            <Text style={styles.modalParagraph}>
              Los pagos son procesados de forma segura a través de Mercado Pago. Hay Equipo no almacena los números completos de tus tarjetas ni tus credenciales bancarias.
            </Text>

            <Text style={styles.modalSectionTitle}>4. Derecho de Supresión y Eliminación</Text>
            <Text style={styles.modalParagraph}>
              Podés solicitar la eliminación total de tu cuenta y de tus datos personales en cualquier momento desde el botón "Eliminar mi Cuenta" en esta pantalla o a través de nuestra web oficial https://hayequipo.com/privacy.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL: TÉRMINOS Y CONDICIONES
          ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              style={styles.modalCloseBtn}
            >
              <CloseIcon size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>1. Reservas y Turnos Fijos</Text>
            <Text style={styles.modalParagraph}>
              Al reservar una cancha a través de Hay Equipo, asegurás la disponibilidad del espacio en el club seleccionado. En caso de contar con turno fijo, la suscripción se renueva periódicamente conforme al acuerdo con el complejo.
            </Text>

            <Text style={styles.modalSectionTitle}>2. División de Pagos (Split Payments)</Text>
            <Text style={styles.modalParagraph}>
              El organizador bloquea la cancha y los participantes disponen de una ventana de tiempo para completar sus aportes individuales. Los saldos no utilizados se reintegran a la billetera virtual del usuario.
            </Text>

            <Text style={styles.modalSectionTitle}>3. Políticas de Cancelación</Text>
            <Text style={styles.modalParagraph}>
              Las cancelaciones quedan sujetas a la anticipación fijada por cada club. Si se libera una fecha de turno fijo con la antelación requerida, el crédito se acredita automáticamente en la billetera virtual del jugador.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    borderColor: '#fc1c46',
  },
  googleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fc1c46',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 22,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  userPhone: {
    fontFamily: fonts.regular,
    color: '#64748b',
    fontSize: 13,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0b0e14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.35)',
  },
  levelBadgeSecondary: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  levelBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 10.5,
    letterSpacing: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCardOuter: {
    flex: 1,
  },
  statCardInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 19,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statLabel: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
  },
  walletOuter: {
    marginBottom: 24,
  },
  walletInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fc1c46',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  walletLabel: {
    fontFamily: fonts.bold,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  walletAmount: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 24,
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  walletSub: {
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  walletBtn: {
    backgroundColor: '#0b0e14',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  walletBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12.5,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    color: '#0f172a',
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: 10,
    marginTop: 4,
  },
  menuOuter: {
    marginBottom: 20,
  },
  menuInner: {
    backgroundColor: '#0b0e14',
    borderWidth: 1,
    borderColor: 'rgba(252, 28, 70, 0.25)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(252, 28, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 1,
  },
  menuSubText: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11.5,
  },
  menuArrow: {
    fontFamily: fonts.bold,
    color: '#94a3b8',
    fontSize: 20,
    marginLeft: 8,
  },
  footerBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: fonts.bold,
    color: '#64748b',
    fontSize: 12,
  },
  copyrightText: {
    fontFamily: fonts.regular,
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0b0e14',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    color: '#ffffff',
    fontSize: 18,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalSectionTitle: {
    fontFamily: fonts.bold,
    color: '#fc1c46',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 6,
  },
  modalParagraph: {
    fontFamily: fonts.regular,
    color: '#cbd5e1',
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 10,
  },
});

