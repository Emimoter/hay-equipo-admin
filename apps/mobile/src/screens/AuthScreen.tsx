import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { colors, typography } from '../components/theme';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      Alert.alert('Error', res.error || 'No se pudo iniciar sesión con Google');
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor completá tu email y contraseña.');
      return;
    }

    setLoading(true);
    if (isRegister) {
      if (!fullName) {
        Alert.alert('Nombre requerido', 'Por favor ingresá tu nombre y apellido.');
        setLoading(false);
        return;
      }
      const res = await registerWithEmail(email, password, fullName, phone);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        Alert.alert('Error al registrarse', res.error);
      }
    } else {
      const res = await loginWithEmail(email, password);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        Alert.alert('Error al ingresar', res.error);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Logo */}
      <View style={styles.logoBox}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>HE</Text>
        </View>
        <Text style={styles.appName}>HAY EQUIPO</Text>
        <Text style={styles.tagline}>La plataforma de reservas deportivas en Argentina</Text>
      </View>

      {/* Auth Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
        <Text style={styles.cardSubtitle}>
          {isRegister ? 'Registrate para reservar canchas y dividir pagos con tu equipo' : 'Ingresá para gestionar tus reservas y turnos fijos'}
        </Text>

        {/* Google Sign In Button */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
          <Text style={styles.googleIcon}>🌐</Text>
          <Text style={styles.googleBtnText}>Continuar con Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con tu email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form Fields */}
        {isRegister && (
          <div>
            <label style={{ display: 'none' }}>Nombre</label>
            <Text style={styles.fieldLabel}>Nombre y Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Emiliano Martínez"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.fieldLabel}>Celular (WhatsApp)</Text>
            <TextInput
              style={styles.input}
              placeholder="+54 9 11 5555-0001"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </div>
        )}

        <Text style={styles.fieldLabel}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.fieldLabel}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleEmailAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitBtnText}>{isRegister ? 'Crear mi Cuenta' : 'Ingresar'}</Text>
          )}
        </TouchableOpacity>

        {/* Toggle between Login and Register */}
        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.toggleText}>
            {isRegister ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta todavía? '}
            <Text style={styles.toggleHighlight}>{isRegister ? 'Iniciá Sesión' : 'Registrate gratis'}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.termsText}>
        Al continuar, aceptás los Términos de Servicio y la Política de Privacidad de Hay Equipo.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%'
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  logoIconText: {
    color: colors.background,
    fontSize: 26,
    fontWeight: '900'
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
    marginBottom: 20
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16
  },
  googleIcon: {
    fontSize: 18,
    marginRight: 10
  },
  googleBtnText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 10
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: colors.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800'
  },
  toggleRow: {
    marginTop: 16,
    alignItems: 'center'
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  toggleHighlight: {
    color: colors.primary,
    fontWeight: '700'
  },
  termsText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10
  }
});
