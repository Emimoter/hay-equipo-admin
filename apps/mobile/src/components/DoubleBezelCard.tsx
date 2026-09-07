import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { colors, shadows } from './theme';
import { triggerHaptic } from '../services/haptics';

interface DoubleBezelCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  highlighted?: boolean;
  glow?: boolean;
  variant?: 'black' | 'red';
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
}

export const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({
  children,
  style,
  innerStyle,
  onPress,
  activeOpacity = 0.88,
  highlighted = false,
  glow = false,
  variant = 'black',
  hapticFeedback = 'light',
}) => {
  const handlePress = () => {
    if (onPress) {
      if (hapticFeedback) {
        triggerHaptic(hapticFeedback);
      }
      onPress();
    }
  };

  const isRed = variant === 'red';

  const innerContent = (
    <View
      style={[
        styles.innerCore,
        isRed && styles.innerCoreRed,
        highlighted && styles.innerCoreHighlighted,
        innerStyle,
      ]}
    >
      {children}
    </View>
  );

  const containerStyle = [
    styles.outerShell,
    isRed && styles.outerShellRed,
    highlighted && styles.outerShellHighlighted,
    glow && shadows.glowPrimary,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={activeOpacity}
        style={containerStyle}
      >
        {innerContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {innerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  outerShell: {
    backgroundColor: 'rgba(11, 14, 20, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(11, 14, 20, 0.12)',
    borderRadius: 22,
    padding: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  outerShellRed: {
    backgroundColor: 'rgba(252, 28, 70, 0.2)',
    borderColor: 'rgba(252, 28, 70, 0.4)',
    shadowColor: '#fc1c46',
    shadowOpacity: 0.35,
  },
  outerShellHighlighted: {
    backgroundColor: 'rgba(252, 28, 70, 0.16)',
    borderColor: 'rgba(252, 28, 70, 0.45)',
  },
  innerCore: {
    backgroundColor: '#0b0e14',
    borderRadius: 20.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  innerCoreRed: {
    backgroundColor: '#fc1c46',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  innerCoreHighlighted: {
    backgroundColor: '#121624',
  },
});
